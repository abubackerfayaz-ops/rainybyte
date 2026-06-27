'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertTriangle } from 'lucide-react';
import Navigation from './Navigation';
import HeroSection from './HeroSection';
import AIIntelligencePanel from './AIIntelligencePanel';
import HourlyTimelineSection from './HourlyTimelineSection';
import ForecastBattleSection from './ForecastBattleSection';
import ComfortDashboardSection from './ComfortDashboardSection';
import AIAssistantSection from './AIAssistantSection';
import GlobalRankingsSection from './GlobalRankingsSection';
import ClimateDashboard from './ClimateDashboard';
import AIAssistant from './AIAssistant';
import SourcesPanel from './SourcesPanel';
import { AgricultureDashboard, AstronomyDashboard, TravelDashboard } from './SpecializedDashboards';
import { mapWeatherToSummary } from '../utils/mapWeatherData';

const WeatherMap = dynamic(() => import('./WeatherMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-2xl bg-black/30 border border-white/[0.04] flex items-center justify-center">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-cyan/60 mx-auto" />
        <p className="text-sm text-white/30">Loading map...</p>
      </div>
    </div>
  ),
});

interface FavoriteLocation { name: string; lat: number; lon: number; }

const tabItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'climate', label: 'Climate' },
  { id: 'specialized', label: 'Sectors' },
  { id: 'map', label: 'Map' },
  { id: 'assistant', label: 'AI Assistant' },
  { id: 'sources', label: 'Sources' },
] as const;

export default function Dashboard() {
  const [lat, setLat] = useState<number>(51.5074);
  const [lon, setLon] = useState<number>(-0.1278);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'climate' | 'specialized' | 'map' | 'assistant' | 'sources'>('overview');

  const fetchWeatherData = useCallback(async (latitude: number, longitude: number, nameQuery?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = nameQuery ? `/api/weather?q=${encodeURIComponent(nameQuery)}` : `/api/weather?lat=${latitude}&lon=${longitude}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to retrieve weather intelligence');
      setWeatherData(data);
      if (data.location) { setLat(data.location.lat); setLon(data.location.lon); }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLat(pos.coords.latitude); setLon(pos.coords.longitude); },
        () => fetchWeatherData(51.5074, -0.1278)
      );
    } else {
      fetchWeatherData(51.5074, -0.1278);
    }
  }, [fetchWeatherData]);

  useEffect(() => { fetchWeatherData(lat, lon); }, [lat, lon, fetchWeatherData]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 3) { setSuggestions([]); setShowSuggestions(false); return; }

    // Try Open-Meteo first (fast, direct)
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`)
      .then(r => r.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          setSuggestions(data.results);
          setShowSuggestions(true);
        } else {
          // Fallback to server-side geocoding (Nominatim + web search)
          fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
            .then(r => r.json())
            .then(fbData => {
              if (fbData.results && fbData.results.length > 0) {
                setSuggestions(fbData.results);
                setShowSuggestions(true);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        // Fallback on network error too
        fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
          .then(r => r.json())
          .then(fbData => {
            if (fbData.results && fbData.results.length > 0) {
              setSuggestions(fbData.results);
              setShowSuggestions(true);
            }
          })
          .catch(() => {});
      });
  };

  const handleSuggestionClick = (sug: any) => {
    setLat(sug.latitude); setLon(sug.longitude);
    const admin = sug.admin1 ? `, ${sug.admin1}` : '';
    const country = sug.country ? `, ${sug.country}` : '';
    setSearchQuery(`${sug.name}${admin}${country}`);
    setShowSuggestions(false);
  };

  const locationName = weatherData?.location?.name?.split(',')[0] || 'Earth';

  const { current, activeModel, modelComparisons, hourlyForecast, dailyForecast, airQuality, agriculture, astronomy, travel, alerts, marine, dataSources } = weatherData || {};

  if (loading && !weatherData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090B' }}>
        <div className="text-center space-y-6">
          <div className="w-16 h-16 rounded-full border border-white/[0.04] border-t-cyan/70 animate-spin mx-auto" />
          <p className="text-white/40 text-sm">Loading weather intelligence...</p>
        </div>
      </div>
    );
  }

  if (error && !weatherData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090B' }}>
        <div className="text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-white/30 mx-auto" />
          <p className="text-white/50 text-sm">{error}</p>
          <button onClick={() => fetchWeatherData(lat, lon)} className="px-5 py-2 bg-white/5 border border-white/10 text-white/60 rounded-xl text-sm hover:bg-white/10 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const weatherSummary = weatherData ? mapWeatherToSummary(weatherData) : null;
  const comfortScore = current ? Math.round(Math.max(0, 100 - Math.abs(current.temp - 22) * 2.5 - (current.humidity > 70 ? (current.humidity - 70) * 0.3 : 0))) : 75;
  const confidenceScore = activeModel?.confidence || 89;

  return (
    <div style={{ background: '#09090B', minHeight: '100vh', color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
      <Navigation
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        onSuggestionClick={handleSuggestionClick}
        onSearchBlur={() => setShowSuggestions(false)}
        locationName={locationName}
      />

      {/* Tab navigation */}
      <div className="fixed top-[73px] left-0 right-0 z-40 flex items-center justify-center gap-1 px-6 py-3" style={{ background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200"
            style={{
              background: activeTab === tab.id ? 'rgba(249,115,22,0.15)' : 'transparent',
              border: `1px solid ${activeTab === tab.id ? 'rgba(249,115,22,0.3)' : 'transparent'}`,
              color: activeTab === tab.id ? '#fb923c' : '#71717a',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <main style={{ paddingTop: 130 }}>
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <HeroSection location={weatherData?.location} current={current} loading={loading} />
              <div style={{ paddingTop: 0 }}>
                <AIIntelligencePanel comfortScore={comfortScore} confidenceScore={confidenceScore} current={current} />
                <HourlyTimelineSection hourlyForecast={hourlyForecast || []} />
                <ForecastBattleSection modelComparisons={modelComparisons} activeModel={activeModel} />
                <ComfortDashboardSection current={current} />
                <AIAssistantSection />
                <GlobalRankingsSection />
                <footer className="px-6 py-8 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#3f3f46' }}>
                    RainyByte AI · Weather Intelligence Platform · Data refreshed every 5 minutes ·{' '}
                    <span style={{ color: '#52525b' }}>Powered by ECMWF, GFS, ICON, AIFS, UKMO, GEM</span>
                  </p>
                </footer>
              </div>
            </motion.div>
          )}

          {activeTab === 'climate' && weatherData && (
            <motion.div key="climate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <div className="pt-8">
                <ClimateDashboard lat={lat} lon={lon} />
              </div>
            </motion.div>
          )}

          {activeTab === 'specialized' && weatherData && (
            <motion.div key="specialized" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <div className="pt-8 space-y-8 px-6 max-w-6xl mx-auto">
                <AgricultureDashboard data={agriculture} />
                <AstronomyDashboard data={astronomy} />
                <TravelDashboard data={travel} />
              </div>
            </motion.div>
          )}

          {activeTab === 'map' && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <div className="pt-8 px-6 max-w-6xl mx-auto">
                <WeatherMap lat={lat} lon={lon} locationName={locationName} condition={current?.condition || 'Clear'} rainChance={dailyForecast?.[0]?.rainChance || 0} />
              </div>
            </motion.div>
          )}

          {activeTab === 'assistant' && (
            <motion.div key="assistant" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <div className="pt-8">
                <AIAssistant weatherData={weatherSummary!} />
              </div>
            </motion.div>
          )}

          {activeTab === 'sources' && (
            <motion.div key="sources" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <div className="pt-8 px-6 max-w-6xl mx-auto">
                <SourcesPanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
