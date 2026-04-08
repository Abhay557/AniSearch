import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AnimeDetails from './pages/AnimeDetails';

export default function App() {
  // Hoist state here so navigating back to home preserves the search
  const [cachedResults, setCachedResults] = useState([]);
  const [cachedQuery, setCachedQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  return (
    <div className="min-h-screen relative flex flex-col">
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

      <Routes>
        <Route 
          path="/" 
          element={
            <Home 
              cachedResults={cachedResults}
              setCachedResults={setCachedResults}
              cachedQuery={cachedQuery}
              setCachedQuery={setCachedQuery}
              hasSearched={hasSearched}
              setHasSearched={setHasSearched}
            />
          } 
        />
        <Route path="/anime/:mal_id" element={<AnimeDetails />} />
      </Routes>
    </div>
  );
}
