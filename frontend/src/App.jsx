import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Star, Sparkles, AlertCircle, Zap, Compass, Flame, Ghost, Swords } from 'lucide-react';

const BACKEND_URL = "https://abhay557-animesearch.hf.space";

const SUGGESTIONS = [
  { icon: Swords, text: "A lone samurai seeking revenge in feudal Japan" },
  { icon: Ghost, text: "Psychological horror in a school setting" },
  { icon: Compass, text: "Pirates exploring a vast ocean for treasure" },
  { icon: Flame, text: "Overpowered MC destroys everyone" },
  { icon: Zap, text: "Time travel romance with a twist ending" },
  { icon: Sparkles, text: "A peaceful slice of life in the countryside" },
];

/* ─── Score Ring SVG ──────────────────────── */
function ScoreRing({ score }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.min(Math.max(score || 0, 0), 10);
  const offset = circumference - (normalized / 10) * circumference;

  const getColor = (s) => {
    if (s >= 8) return '#22c55e';
    if (s >= 6) return '#eab308';
    if (s >= 4) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="score-ring flex items-center justify-center">
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={radius} fill="none" strokeWidth="3" className="score-ring-bg" />
        <circle
          cx="22" cy="22" r={radius}
          fill="none" strokeWidth="3"
          stroke={getColor(normalized)}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xs font-bold text-white">
        {score ? score.toFixed(1) : '—'}
      </span>
    </div>
  );
}

/* ─── Skeleton Card ───────────────────────── */
function SkeletonCard() {
  return (
    <div className="aspect-[2/3] rounded-[20px] overflow-hidden bg-surface-800 border border-white/[0.04]">
      <div className="skeleton w-full h-full" />
    </div>
  );
}

/* ─── Anime Card ──────────────────────────── */
function AnimeCard({ anime, index }) {
  const genres = anime.genres ? anime.genres.split(',').map(g => g.trim()).filter(Boolean) : [];

  return (
    <div
      className="anime-card aspect-[2/3] stagger-item"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Image */}
      {anime.image ? (
        <img
          src={anime.image}
          alt={anime.title}
          className="card-image absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-surface-700 to-surface-900" />
      )}

      {/* Overlay */}
      <div className="card-overlay absolute inset-0" />

      {/* Match badge */}
      <div className="absolute top-3 left-3 z-20">
        <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/10 text-white text-[11px] px-3 py-1.5 rounded-full font-semibold">
          <Sparkles className="w-3 h-3 text-orange-400" />
          {(anime.score * 100).toFixed(0)}% match
        </div>
      </div>

      {/* MAL Score Ring */}
      {anime.mal_score && (
        <div className="absolute top-3 right-3 z-20">
          <ScoreRing score={anime.mal_score} />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-5 flex flex-col justify-end h-full">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-snug tracking-tight">
          {anime.title}
        </h3>

        <p className="text-zinc-400 text-[13px] line-clamp-3 leading-relaxed mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {anime.synopsis}
        </p>

        <div className="flex items-center gap-2 mb-3 text-[12px] text-zinc-500 font-medium">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400" fill="currentColor" />
            {anime.mal_score || 'N/A'}
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <span>{anime.episodes === '?' || anime.episodes == null ? 'Ongoing' : `${anime.episodes} eps`}</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {genres.slice(0, 3).map((genre, i) => (
            <span key={i} className="genre-pill">{genre}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main App ────────────────────────────── */
export default function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef(null);

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setQuery(q);
    setIsSearching(true);
    setError('');
    setResults([]);
    setHasSearched(true);

    try {
      const response = await fetch(`${BACKEND_URL}/search?q=${encodeURIComponent(q)}`);
      if (!response.ok) throw new Error('Backend not available');
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Search failed:", err);
      setError('Unable to connect to the search engine. Make sure the backend is running.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSuggestionClick = (text) => {
    setQuery(text);
    handleSearch(text);
    inputRef.current?.blur();
  };

  return (
    <div className="min-h-screen relative">
      {/* Ambient Background */}
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />

      {/* Noise Grain Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[1] opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <main className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Hero Section ─── */}
        <section className={`flex flex-col items-center text-center transition-all duration-700 ease-out ${
          hasSearched ? 'pt-10 pb-8' : 'pt-24 md:pt-36 pb-16'
        }`}>
          {/* Logo / Brand */}
          <div className={`transition-all duration-700 ease-out ${hasSearched ? 'mb-4' : 'mb-8'}`}>
            {!hasSearched && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-[13px] text-zinc-400 font-medium mb-6 animate-fade-in">
                <Zap className="w-3.5 h-3.5 text-orange-400" />
                Powered by AI Semantic Search
              </div>
            )}
            <h1 className={`font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-600 transition-all duration-700 ${
              hasSearched ? 'text-2xl md:text-3xl' : 'text-5xl md:text-7xl lg:text-8xl'
            }`}>
              AniSearch
            </h1>
            {!hasSearched && (
              <p className="mt-4 text-lg md:text-xl text-zinc-500 max-w-xl mx-auto font-light leading-relaxed animate-fade-in">
                Describe a plot, mood, or scenario — and we'll find the anime.
              </p>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSubmit} className={`w-full transition-all duration-700 ${
            hasSearched ? 'max-w-2xl' : 'max-w-3xl'
          }`}>
            <div className="search-container relative">
              <div className="search-glow" />
              <div className="relative flex items-center bg-surface-800/80 backdrop-blur-xl border border-white/[0.08] rounded-full p-1.5 sm:p-2 shadow-2xl transition-all duration-300 focus-within:border-orange-500/40">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-500 ml-3 sm:ml-4 flex-shrink-0" />
                <input
                  ref={inputRef}
                  id="search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="A cyberpunk detective fighting rogue AI..."
                  className="flex-1 bg-transparent border-none py-3 sm:py-4 pl-3 sm:pl-4 pr-2 text-base sm:text-lg text-white placeholder-zinc-600 focus:outline-none"
                />
                <button
                  id="search-button"
                  type="submit"
                  disabled={isSearching || !query.trim()}
                  className="flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-full font-semibold text-sm sm:text-base transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 flex-shrink-0"
                >
                  {isSearching ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span className="hidden sm:inline">Explore</span>
                      <Search className="w-4 h-4 sm:hidden" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Suggestion Chips */}
          {!hasSearched && (
            <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-3xl animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {SUGGESTIONS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(s.text)}
                    className="suggestion-chip"
                  >
                    <Icon className="w-3.5 h-3.5 text-orange-400/70" />
                    {s.text}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* ─── Error State ─── */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 animate-slide-up">
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 backdrop-blur-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* ─── Loading Skeletons ─── */}
        {isSearching && (
          <section className="pb-20">
            <div className="flex items-center justify-between mb-6">
              <div className="skeleton h-7 w-40" />
              <div className="skeleton h-5 w-28" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </section>
        )}

        {/* ─── Results Grid ─── */}
        {!isSearching && results.length > 0 && (
          <section className="pb-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Top Matches
              </h2>
              <span className="text-zinc-500 text-sm font-medium">
                {results.length} results
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {results.map((anime, index) => (
                <AnimeCard key={index} anime={anime} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* ─── Empty State ─── */}
        {!isSearching && hasSearched && results.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-surface-700 flex items-center justify-center mb-5">
              <Search className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-300 mb-2">No results found</h3>
            <p className="text-sm text-zinc-500 max-w-sm">
              Try describing the anime differently — mention plot elements, character archetypes, or the overall mood.
            </p>
          </div>
        )}

        {/* ─── Footer ─── */}
        <footer className={`text-center py-8 border-t border-white/[0.04] ${hasSearched ? 'mt-0' : 'mt-20'}`}>
          <p className="text-xs text-zinc-600">
            AniSearch &middot; Semantic anime discovery powered by sentence embeddings
          </p>
        </footer>
      </main>
    </div>
  );
}
