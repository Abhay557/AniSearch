from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer, util
from contextlib import asynccontextmanager
import torch
import json
import os
import sys
import uvicorn

# Global variables
model = None
corpus_embeddings = None
anime_records = []

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, corpus_embeddings, anime_records

    print("=== NexusAnime Backend: Initializing ===", flush=True)
    
    # 1. Load AI Model (Force CPU for Hugging Face Free Tier)
    try:
        print("Step 1: Loading SentenceTransformer (all-MiniLM-L6-v2) on CPU...", flush=True)
        # Using a local cache directory can sometimes help with HF permissions
        model = SentenceTransformer('all-MiniLM-L6-v2', device='cpu')
        print("✅ Model loaded successfully.", flush=True)
    except Exception as e:
        print(f"CRITICAL ERROR: Failed to load model: {e}", flush=True)
        # Don't sys.exit here, let the app start so we can see error in /health
    
    # 2. Load Dataset
    json_path = 'jikan_full_dump.json'
    print(f"Step 2: Loading dataset from {json_path}...", flush=True)
    try:
        if os.path.exists(json_path):
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Reset records in case of restart
            anime_records = []
            for anime in data:
                synopsis = anime.get('synopsis', '')
                if not synopsis: continue
                
                genres_list = anime.get('genres', [])
                genres = ", ".join([g.get('name', '') for g in genres_list])
                
                images = anime.get('images', {})
                image_url = images.get('jpg', {}).get('large_image_url', '')

                anime_records.append({
                    'title': anime.get('title', 'Unknown'),
                    'genres': genres,
                    'synopsis': synopsis,
                    'episodes': anime.get('episodes', '?'),
                    'mal_score': anime.get('score', 'N/A'),
                    'image': image_url
                })
            print(f"✅ Successfully loaded {len(anime_records)} anime records.", flush=True)
        else:
            print(f"⚠️ WARNING: {json_path} not found.", flush=True)
    except Exception as e:
        print(f"❌ ERROR: Dataset loading failed: {e}", flush=True)

    # 3. Load Embeddings
    embeddings_path = 'anime_embeddings.pt'
    print(f"Step 3: Loading embeddings from {embeddings_path}...", flush=True)
    if os.path.exists(embeddings_path):
        try:
            # map_location='cpu' is MANDATORY for HF Spaces
            corpus_embeddings = torch.load(embeddings_path, map_location=torch.device('cpu'))
            print("✅ Embeddings loaded and mapped to CPU.", flush=True)
        except Exception as e:
            print(f"❌ ERROR: Failed to load .pt file: {e}", flush=True)
    else:
        print(f"⚠️ CRITICAL: {embeddings_path} is missing.", flush=True)

    print("=== Backend Ready and Listening ===", flush=True)
    yield
    print("=== Shutting Down ===", flush=True)

app = FastAPI(lifespan=lifespan)

# CORS setup for Vercel/Localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/search")
async def search(q: str = Query(..., min_length=1)):
    if model is None or corpus_embeddings is None:
        return {"results": [], "error": "Backend components not fully loaded."}

    try:
        query_vec = model.encode(q, convert_to_tensor=True, device='cpu')
        cos_scores = util.cos_sim(query_vec, corpus_embeddings)[0]
        
        top_k = min(12, len(anime_records))
        top_results = torch.topk(cos_scores, k=top_k)
        
        output = []
        for score, idx in zip(top_results[0], top_results[1]):
            s = score.item()
            if s > 0.12: # Slightly lower threshold for better results
                item = anime_records[idx]
                output.append({
                    "title": item['title'],
                    "genres": item['genres'],
                    "synopsis": item['synopsis'],
                    "episodes": item['episodes'],
                    "score": s,
                    "mal_score": item['mal_score'],
                    "image": item['image']
                })
        return {"results": output}
    except Exception as e:
        return {"results": [], "error": str(e)}

@app.get("/")
def health_check():
    return {
        "status": "alive", 
        "records": len(anime_records), 
        "model_loaded": model is not None,
        "embeddings_loaded": corpus_embeddings is not None
    }

# This block ensures that if the script is run directly, it starts the server on HF's port
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)