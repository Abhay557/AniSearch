import json
import os
import torch
from sentence_transformers import SentenceTransformer

def main():
    print("Loading AI Model (all-MiniLM-L6-v2)...")
    # This model is small (~80MB), fast, and great for semantic search
    model = SentenceTransformer('all-MiniLM-L6-v2')

    # Source dataset and target embeddings file
    filepath = 'jikan_full_dump.json'
    embeddings_path = 'anime_embeddings.pt'
    
    print(f"Loading JSON data from '{filepath}'...")
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    corpus = []
    
    print("Formatting text corpus with rich metadata...")
    for anime in data:
        title = anime.get('title', 'Unknown Title')
        synopsis = anime.get('synopsis', '')
        
        # Extract genres safely
        genres_list = anime.get('genres', [])
        genres = ", ".join([g.get('name', '') for g in genres_list]) if genres_list else "Unknown Genre"
        
        # Extract additional contextual data for semantic search matching
        season = anime.get('season', '') or ''
        year = anime.get('year', '') or ''
        rating = anime.get('rating', '') or 'Unknown Rating'
        
        # Skip entries with no synopsis to keep data clean
        if not synopsis:
            continue
            
        # Combine everything into one rich text string for the AI to read
        # Adding season and rating gives the RAG system more surface area to match queries
        combined_text = f"Title: {title}. Genres: {genres}. Season: {season.capitalize()} {year}. Rating: {rating}. Synopsis: {synopsis}"
        
        corpus.append(combined_text)
        
    print(f"Calculating embeddings for {len(corpus)} anime properties...")
    print("This might take 3-5 minutes depending on your hardware.")
    
    # Generate vector embeddings for the entire corpus
    corpus_embeddings = model.encode(corpus, convert_to_tensor=True, show_progress_bar=True)
    
    # Save the PyTorch tensor to disk
    torch.save(corpus_embeddings, embeddings_path)
    print(f"✅ RAG generation complete! Vector embeddings successfully saved to '{embeddings_path}'")

if __name__ == "__main__":
    main()
