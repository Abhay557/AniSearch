import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { Star, Play, List, AlertCircle, ArrowLeft, Calendar, Film, Clock, Activity, Share2, Info, Check, ShieldAlert, Trophy, Hash } from 'lucide-react';

export default function AnimeDetails() {
  const { state } = useLocation();
  const { mal_id } = useParams();

  const [anime, setAnime] = useState(state?.anime || null);
  const [loading, setLoading] = useState(!state?.anime);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // If anime data isn't passed via router-state, fetch it directly
    if (!anime && mal_id) {
      setLoading(true);
      const isId = /^\d+$/.test(mal_id);
      const url = isId
        ? `https://api.jikan.moe/v4/anime/${mal_id}`
        : `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(mal_id)}&limit=1`;

      fetch(url)
        .then(res => res.json())
        .then(resData => {
          const data = isId ? resData.data : resData.data?.[0];
          if (data) {
            setAnime({
              mal_id: data.mal_id,
              title: data.title,
              genres: (data.genres || []).map(g => g.name).join(', '),
              synopsis: data.synopsis,
              episodes: data.episodes,
              mal_score: data.score,
              image: data.images?.jpg?.large_image_url,
              duration: data.duration,
              rating: data.rating,
              rank: data.rank,
              popularity: data.popularity,
              season: data.season,
              year: data.year,
              status: data.status
            });
          } else {
            setError(true);
          }
        })
        .catch(err => setError(true))
        .finally(() => setLoading(false));
    }
  }, [mal_id, anime]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10 text-white bg-surface-900">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <span className="text-zinc-500 font-medium">Reconstructing from the void...</span>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10 text-white">
        <div className="text-center p-8 bg-surface-800/40 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-2 tracking-tight text-white">Lost in the Void</h2>
          <p className="text-zinc-400 mb-6 max-w-sm mx-auto leading-relaxed text-sm">
            We couldn't track down the details for this anime. It might have slipped into another dimension.
          </p>
          <Link to="/" className="inline-flex px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-full font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all active:scale-95 text-sm">
            Return to Discovery
          </Link>
        </div>
      </div>
    );
  }

  const scoreText = anime.mal_score && anime.mal_score !== 'N/A' ? anime.mal_score.toFixed(2) : '—';
  const genres = anime.genres ? anime.genres.split(',').map(g => g.trim()).filter(Boolean) : [];
  const statusFormatted = anime.status || (anime.episodes === '?' || anime.episodes == null ? 'Ongoing' : 'Completed');

  // Format Season + Year if available
  const seasonYear = anime.season && anime.season !== '?' && anime.year && anime.year !== '?'
    ? `${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year}`
    : (anime.year && anime.year !== '?' ? anime.year : 'Unknown');

  // Parse rating (e.g., "R - 17+ (violence & profanity)" -> "R - 17+")
  const shortRating = anime.rating && anime.rating !== '?' ? anime.rating.split('(')[0].trim() : 'Unrated';

  const StatBadge = ({ icon: Icon, label, value }) => (
    <div className="flex flex-col p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl transition-all duration-300">
      <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
        <Icon className="w-3.5 h-3.5 text-orange-400/80" />
        <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{label}</span>
      </div>
      <span className="text-[13px] text-zinc-100 font-medium drop-shadow-sm leading-tight truncate">{value || 'N/A'}</span>
    </div>
  );

  return (
    <div className="min-h-screen relative bg-surface-900 overflow-hidden selection:bg-orange-500/30 selection:text-white">
      {/* ─── Immersive Blurred Backdrop ─── */}
      {anime.image && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
          <img
            src={anime.image}
            alt="backdrop"
            className="w-full h-full object-cover blur-[100px] scale-125 opacity-20 saturate-150 transform-gpu"
          />
          {/* Gradients to blend backdrop seamlessly into the void */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-900/95 via-surface-900/60 to-transparent" />
        </div>
      )}

      {/* ─── Main Content Wrapper ─── */}
      <main className="relative z-10 max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 animate-fade-in">

        {/* Top Header Navigation */}
        <header className="flex items-center justify-between mb-6 md:mb-8">
          <Link
            to="/"
            className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-zinc-300 hover:text-white transition-all backdrop-blur-md shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[13px] font-semibold tracking-wide">Back to Explore</span>
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-orange-500/10 border border-white/10 hover:border-orange-500/30 rounded-full text-zinc-300 hover:text-orange-400 transition-all backdrop-blur-md shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="text-[13px] font-semibold tracking-wide hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
          </button>
        </header>

        {/* ─── Content Grid ─── */}
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">

          {/* Left Column: Visuals & CTAs */}
          <div className="w-full md:w-[260px] lg:w-[280px] flex-shrink-0 flex flex-col gap-4 mx-auto lg:mx-0">

            {/* The Poster presentation */}
            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] border border-white/10 group">
              <img
                src={anime.image}
                alt={anime.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-90" />

              {/* Elegant Score Display */}
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-orange-400 font-black mb-0.5 opacity-90">Rating</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-black text-3xl text-white leading-none tracking-tighter">{scoreText}</span>
                    {scoreText !== '—' && <span className="text-zinc-400 font-bold text-xs">/ 10</span>}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)] mb-0.5">
                  <Star className="w-5 h-5 fill-current" />
                </div>
              </div>
            </div>

            {/* Core Interactions */}
            <div className="flex flex-col gap-2">
              <button className="relative overflow-hidden w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3 px-6 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:-translate-y-0.5 group">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <Play className="w-4 h-4 fill-current relative z-10" />
                <span className="relative z-10">Play Trailer</span>
              </button>

              <button className="w-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/20 text-zinc-300 hover:text-white py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 backdrop-blur-md">
                <List className="w-4 h-4" />
                Episode Roster
              </button>
            </div>
          </div>

          {/* Right Column: Deep Information */}
          <div className="flex-1 flex flex-col pt-1 lg:pt-4">

            {/* Title Block & Taxonomy */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {genres.map((genre, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full backdrop-blur-md transition-colors cursor-default"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-100 to-zinc-400 tracking-[-0.02em] leading-[1.1] mb-4 drop-shadow-sm">
                {anime.title}
              </h1>
            </div>

            {/* Comprehensive Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
              <StatBadge icon={Activity} label="State" value={statusFormatted} />
              <StatBadge icon={Calendar} label="Aired" value={seasonYear} />
              <StatBadge icon={Film} label="Episodes" value={anime.episodes} />
              <StatBadge icon={Clock} label="Runtime" value={anime.duration && anime.duration !== '?' ? anime.duration : '24m / ep'} />
              <StatBadge icon={ShieldAlert} label="Rating" value={shortRating} />
              <StatBadge icon={Trophy} label="Rank" value={anime.rank && anime.rank !== '?' ? `#${anime.rank}` : 'N/A'} />
              <StatBadge icon={Hash} label="Popularity" value={anime.popularity && anime.popularity !== '?' ? `#${anime.popularity}` : 'N/A'} />
            </div>

            {/* In-Depth Synopsis */}
            <div className="relative bg-white/[0.02] border border-white/5 rounded-2xl p-5 lg:p-8 backdrop-blur-xl shadow-xl">
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-white mb-4 tracking-tight">
                <Info className="w-5 h-5 text-orange-400" />
                The Premise
              </h3>
              <div className="prose prose-sm prose-invert max-w-none">
                <p className="text-zinc-300 leading-[1.7] text-[14px] opacity-90 font-light pr-3 max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500/30 scrollbar-track-transparent">
                  {anime.synopsis || "Vault records show no descriptive data for this entry. Its mystery remains intact."}
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
