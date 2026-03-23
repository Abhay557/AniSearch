import json
import os
import torch
from sentence_transformers import SentenceTransformer, util

# 1. Initialize the lightweight embedding model
# This model is small (~80MB), fast, and great for semantic search
print("Loading AI Model...")
model = SentenceTransformer('all-MiniLM-L6-v2')

def load_and_prepare_data(filepath):
    print("Loading JSON data...")
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    anime_records = []
    corpus = []
    
    print("Formatting text corpus...")
    for anime in data:
        title = anime.get('title', 'Unknown Title')
        synopsis = anime.get('synopsis', '')
        
        # Extract genres safely
        genres_list = anime.get('genres', [])
        genres = ", ".join([g.get('name', '') for g in genres_list]) if genres_list else "Unknown Genre"
        
        # Skip entries with no synopsis to keep data clean
        if not synopsis:
            continue
            
        # Combine everything into one rich text string for the AI to read
        combined_text = f"Title: {title}. Genres: {genres}. Synopsis: {synopsis}"
        
        anime_records.append({
            'title': title,
            'genres': genres,
            'episodes': anime.get('episodes', '?'),
            'score': anime.get('score', 'N/A')
        })
        corpus.append(combined_text)
        
    return anime_records, corpus

def main():
    json_path = 'jikan_full_dump.json'
    embeddings_path = 'anime_embeddings.pt'
    
    anime_records, corpus = load_and_prepare_data(json_path)
    
    # 2. Generate or Load Embeddings
    # Encoding 20,000+ items takes a few minutes, so we save the math to the hard drive
    if os.path.exists(embeddings_path):
        print("Loading pre-calculated embeddings from disk...")
        corpus_embeddings = torch.load(embeddings_path)
    else:
        print(f"Calculating embeddings for {len(corpus)} anime. This might take 3-5 minutes...")
        corpus_embeddings = model.encode(corpus, convert_to_tensor=True, show_progress_bar=True)
        torch.save(corpus_embeddings, embeddings_path)
        print("Embeddings saved to disk!")

    # 3. The Search Loop
    print("\n--- Anime Semantic Search Engine Ready ---")
    while True:
        query = input("\nWhat kind of anime are you looking for? (or type 'quit' to exit): ")
        if query.lower() in ['quit', 'exit']:
            break
            
        print("Searching...")
        # Convert the user's query into a vector
        query_embedding = model.encode(query, convert_to_tensor=True)
        
        # Calculate cosine similarity between the query and all anime
        cos_scores = util.cos_sim(query_embedding, corpus_embeddings)[0]
        
        # Get the top 5 highest scoring matches
        top_results = torch.topk(cos_scores, k=5)
        
        print(f"\nTop 5 Recommendations for: '{query}'")
        print("-" * 50)
        for score, idx in zip(top_results[0], top_results[1]):
            match = anime_records[idx]
            match_score = score.item()
            # Only show reasonably confident matches
            if match_score > 0.25:
                print(f"Score: {match_score:.2f} | Title: {match['title']}")
                print(f"Genres: {match['genres']} | Episodes: {match['episodes']} | MAL Score: {match['score']}\n")

if __name__ == "__main__":
    main()