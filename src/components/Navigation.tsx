'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Bell, Settings, Zap } from 'lucide-react';

interface NavigationProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  suggestions: any[];
  showSuggestions: boolean;
  onSuggestionClick: (s: any) => void;
  onSearchBlur: () => void;
  locationName: string;
}

export default function Navigation({
  searchQuery, onSearchChange, suggestions,
  showSuggestions, onSuggestionClick, onSearchBlur,
  locationName,
}: NavigationProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onSearchBlur();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onSearchBlur]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{
        background: 'rgba(9,9,11,0.75)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center gap-2.5">
        {/* Rain drop icon */}
        <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
          <path d="M14 0C14 0 2 14 2 22C2 28.6274 7.37258 32 14 32C20.6274 32 26 28.6274 26 22C26 14 14 0 14 0Z" fill="url(#dropGrad)" />
          <path d="M14 2C14 2 4 15 4 22C4 27.5228 8.47715 30 14 30C19.5228 30 24 27.5228 24 22C24 15 14 2 14 2Z" fill="url(#dropInner)" />
          <path d="M10 22C10 18 14 14 14 14C14 14 18 18 18 22C18 24.2091 16.2091 26 14 26C11.7909 26 10 24.2091 10 22Z" fill="rgba(255,255,255,0.15)" />
          <defs>
            <linearGradient id="dropGrad" x1="14" y1="0" x2="14" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f97316" />
              <stop offset="1" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="dropInner" x1="14" y1="2" x2="14" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fb923c" />
              <stop offset="1" stopColor="#f97316" />
            </linearGradient>
          </defs>
        </svg>
        <span
          className="text-white font-bold tracking-tight text-base select-none"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Rain <span style={{ color: '#fb923c' }}>Byte</span>
        </span>
      </div>

      <div ref={ref} className="relative flex-1 max-w-sm mx-8">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: '#71717a' }} strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search city or coordinates…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: '#fff', fontFamily: 'Inter, sans-serif' }}
          />
          <div
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#71717a',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            ⌘K
          </div>
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div
            className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(9,9,11,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            {suggestions.map((s: any, i: number) => (
              <button
                key={i}
                onClick={() => onSuggestionClick(s)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-all hover:bg-white/[0.04]"
                style={{ color: '#d4d4d8', fontFamily: 'Inter, sans-serif' }}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: '#52525b' }} />
                <span>{s.name}{s.admin1 ? `, ${s.admin1}` : ''}{s.country ? `, ${s.country}` : ''}</span>
                <span className="ml-auto text-xs" style={{ color: '#3f3f46' }}>{s.country_code}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-200 hover:bg-white/[0.08]"
          style={{ color: '#A1A1AA', fontFamily: 'Inter, sans-serif' }}
        >
          <MapPin className="w-4 h-4" strokeWidth={1.5} />
          <span className="hidden sm:inline">{locationName}</span>
        </button>
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-white/[0.08]"
          style={{ color: '#71717a' }}
        >
          <Bell className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-white/[0.08]"
          style={{ color: '#71717a' }}
        >
          <Settings className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          J
        </div>
      </div>
    </nav>
  );
}
