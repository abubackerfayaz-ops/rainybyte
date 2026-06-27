'use client';

import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, LayersControl, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Sliders, Layers, Navigation } from 'lucide-react';

interface WeatherMapProps {
  lat: number;
  lon: number;
  locationName: string;
  condition: string;
  rainChance: number;
}

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapInit() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 300);
  }, [map]);
  return null;
}

function MapUpdater({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], 10, { animate: true, duration: 1.5 });
  }, [lat, lon, map]);
  return null;
}

export default function WeatherMap({ lat, lon, locationName, condition, rainChance }: WeatherMapProps) {
  const [opacity, setOpacity] = useState<number>(0.75);
  const [layerType, setLayerType] = useState<'precipitation' | 'wind' | 'temperature'>('precipitation');

  const getRadarColor = () => {
    if (rainChance > 70) return '#ef4444';
    if (rainChance > 40) return '#f59e0b';
    if (rainChance > 10) return '#22c55e';
    return '#00d4ff';
  };

  return (
    <div className="glass-card p-6 flex flex-col overflow-hidden" style={{ minHeight: 580 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan" />
            Interactive Weather Radar
          </h3>
          <p className="text-xs text-white/50">Live troposphere reflectivity scans</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setLayerType('precipitation')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
              layerType === 'precipitation'
                ? 'bg-cyan/15 border-cyan text-cyan'
                : 'bg-white/5 border-white/5 text-white/60 hover:border-white/15'
            }`}
          >
            Precipitation
          </button>
          <button
            onClick={() => setLayerType('wind')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
              layerType === 'wind'
                ? 'bg-sky-blue/15 border-sky-blue text-sky-blue'
                : 'bg-white/5 border-white/5 text-white/60 hover:border-white/15'
            }`}
          >
            Wind Streams
          </button>
          <button
            onClick={() => setLayerType('temperature')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
              layerType === 'temperature'
                ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                : 'bg-white/5 border-white/5 text-white/60 hover:border-white/15'
            }`}
          >
            Thermal Heat
          </button>
        </div>
      </div>

      <div className="relative flex-1 rounded-xl overflow-hidden border border-white/10" style={{ minHeight: 460, background: '#09090B' }}>
        <MapContainer
          center={[lat, lon]}
          zoom={10}
          scrollWheelZoom={true}
          style={{ height: 460, width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapInit />
          <MapUpdater lat={lat} lon={lon} />
          <Circle
            center={[lat, lon]}
            radius={22000}
            pathOptions={{
              color: getRadarColor(),
              fillColor: getRadarColor(),
              fillOpacity: opacity * 0.35,
              weight: 2,
              dashArray: '5, 10'
            }}
          />
          <Circle
            center={[lat, lon]}
            radius={45000}
            pathOptions={{
              color: getRadarColor(),
              fillColor: 'transparent',
              weight: 1,
              opacity: 0.3,
              dashArray: '3, 6'
            }}
          />
          <Circle
            center={[lat, lon]}
            radius={1800}
            pathOptions={{
              color: '#ffffff',
              fillColor: getRadarColor(),
              fillOpacity: 0.95,
              weight: 2
            }}
          />
        </MapContainer>

        <div className="absolute bottom-4 left-4 z-[999] bg-black/85 backdrop-blur-md border border-white/10 rounded-lg p-2.5 text-[10px] space-y-1.5">
          <span className="font-bold block uppercase text-white/40">Radar Scale</span>
          {layerType === 'precipitation' ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-white/80">
                <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" />
                <span>Heavy Rain / Hail</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/80">
                <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
                <span>Moderate Rain</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/80">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                <span>Drizzle / Light Mist</span>
              </div>
            </div>
          ) : layerType === 'wind' ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-white/80">
                <span className="w-2.5 h-2.5 rounded bg-sky-400 inline-block" />
                <span>High Jetstreams</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/80">
                <span className="w-2.5 h-2.5 rounded bg-cyan-600 inline-block" />
                <span>Surface Gales</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-white/80">
                <span className="w-2.5 h-2.5 rounded bg-orange-500 inline-block" />
                <span>Warm Air Mass</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/80">
                <span className="w-2.5 h-2.5 rounded bg-sky-500 inline-block" />
                <span>Cold Front</span>
              </div>
            </div>
          )}
        </div>

        <div className="absolute top-4 right-4 z-[999] bg-black/85 backdrop-blur-md border border-white/10 rounded-lg py-1 px-2.5 text-[9px] font-bold text-cyan animate-pulse flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-ping" />
          SCANNING FEED...
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs text-white/60">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-semibold text-white">
            <Navigation className="w-3.5 h-3.5 text-cyan" />
            {locationName}
          </span>
          <span className="text-[10px] text-white/30">
            {lat.toFixed(4)}°N, {lon.toFixed(4)}°E
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Sliders className="w-4 h-4 text-white/40" />
          <span>Radar Opacity:</span>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-24 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan focus:outline-none"
          />
          <span className="font-bold w-7 text-right">{Math.round(opacity * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
