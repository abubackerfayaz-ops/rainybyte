'use client';

import { Thermometer, Sun, Droplets, Wind, Activity, Shield, Coffee } from 'lucide-react';

function RadialGauge({ value, max, color, size = 100 }: { value: number; max: number; color: string; size?: number }) {
  const pct = value / max;
  const r = (size - 12) / 2;
  const startAngle = -220;
  const totalArc = 260;
  const angle = startAngle + pct * totalArc;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const cx = size / 2;
  const cy = size / 2;

  const arcPath = (fromDeg: number, toDeg: number, r: number) => {
    const from = { x: cx + r * Math.cos(toRad(fromDeg)), y: cy + r * Math.sin(toRad(fromDeg)) };
    const to = { x: cx + r * Math.cos(toRad(toDeg)), y: cy + r * Math.sin(toRad(toDeg)) };
    const large = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${from.x} ${from.y} A ${r} ${r} 0 ${large} 1 ${to.x} ${to.y}`;
  };

  const dotX = cx + r * Math.cos(toRad(angle));
  const dotY = cy + r * Math.sin(toRad(angle));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <path d={arcPath(-220, 40, r)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} strokeLinecap="round" />
      {pct > 0 && (
        <path d={arcPath(-220, -220 + pct * 260, r)} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 5px ${color}90)` }} />
      )}
      <circle cx={dotX} cy={dotY} r={4} fill={color} />
    </svg>
  );
}

interface ComfortDashboardSectionProps {
  current: any;
}

export default function ComfortDashboardSection({ current }: ComfortDashboardSectionProps) {
  if (!current) return null;

  const COMFORT_ITEMS = [
    { label: 'Heat Stress', value: current.temp > 35 ? 85 : current.temp > 30 ? 65 : current.temp > 25 ? 40 : current.temp > 15 ? 20 : 10, max: 100, unit: current.temp > 35 ? 'Danger' : current.temp > 30 ? 'Caution' : 'Low', color: current.temp > 35 ? '#ef4444' : current.temp > 30 ? '#f97316' : current.temp > 25 ? '#fbbf24' : '#4ade80', icon: Thermometer, note: current.temp > 35 ? 'Avoid outdoors' : current.temp > 30 ? 'Stay hydrated' : 'Comfortable' },
    { label: 'UV Index', value: current.uvIndex, max: 11, unit: current.uvIndex >= 8 ? 'Extreme' : current.uvIndex >= 6 ? 'High' : current.uvIndex >= 3 ? 'Moderate' : 'Low', color: current.uvIndex >= 8 ? '#ef4444' : current.uvIndex >= 6 ? '#f97316' : current.uvIndex >= 3 ? '#fbbf24' : '#4ade80', icon: Sun, note: current.uvIndex >= 6 ? 'Use SPF 50+' : 'Low exposure' },
    { label: 'Humidity Comfort', value: 100 - Math.abs(current.humidity - 50), max: 100, unit: current.humidity > 70 ? 'Humid' : current.humidity < 30 ? 'Dry' : 'Ideal', color: current.humidity > 70 ? '#60a5fa' : current.humidity < 30 ? '#f59e0b' : '#4ade80', icon: Droplets, note: current.humidity > 70 ? 'Slightly sticky' : current.humidity < 30 ? 'Use moisturizer' : 'Perfect balance' },
    { label: 'Wind Comfort', value: current.windSpeed > 30 ? 30 : current.windSpeed > 20 ? 50 : current.windSpeed > 10 ? 75 : 90, max: 100, unit: current.windSpeed > 30 ? 'Windy' : current.windSpeed > 20 ? 'Breezy' : 'Pleasant', color: current.windSpeed > 30 ? '#f87171' : current.windSpeed > 20 ? '#fbbf24' : '#22d3ee', icon: Wind, note: current.windSpeed > 20 ? 'Secure loose items' : 'Light breeze' },
    { label: 'Running Score', value: current.temp > 35 ? 15 : current.temp > 30 ? 45 : current.temp > 25 ? 70 : current.temp > 10 ? 85 : 50, max: 100, unit: current.temp > 35 ? 'Avoid' : current.temp > 30 ? 'Caution' : current.temp > 10 ? 'Good' : 'Cold', color: current.temp > 35 ? '#ef4444' : current.temp > 30 ? '#f59e0b' : '#4ade80', icon: Activity, note: current.temp > 30 ? 'Early AM ideal' : 'Great conditions' },
    { label: 'Air Quality', value: Math.max(0, 100 - (current.aqi || 0)), max: 100, unit: current.aqi > 150 ? 'Unhealthy' : current.aqi > 100 ? 'Moderate' : 'Good', color: current.aqi > 150 ? '#ef4444' : current.aqi > 100 ? '#f59e0b' : '#86efac', icon: Shield, note: current.aqi > 100 ? 'Limit outdoor activity' : `AQI ${current.aqi || 0}` },
    { label: 'Hydration Need', value: current.temp > 35 ? 9 : current.temp > 30 ? 7 : current.temp > 25 ? 5 : 3, max: 10, unit: current.temp > 30 ? 'High' : 'Moderate', color: current.temp > 30 ? '#67e8f9' : '#22d3ee', icon: Coffee, note: current.temp > 30 ? '~3L recommended' : '~2L recommended' },
  ];

  return (
    <section className="section-container pb-6">
      <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, color: '#e4e4e7' }}>
              Human Comfort Dashboard
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#52525b' }}>
              Biometric-weighted environmental scoring
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#4ade80' }}>
              Overall Comfort: {Math.round(COMFORT_ITEMS.reduce((s, item) => s + item.value, 0) / COMFORT_ITEMS.length)}/100
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {COMFORT_ITEMS.map(({ label, value, max, color, icon: Icon, note, unit }) => (
            <div
              key={label}
              className="flex flex-col items-center p-4 rounded-2xl cursor-default transition-all duration-200 hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="relative mb-2">
                <RadialGauge value={value} max={max} color={color} size={88} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Icon className="w-3.5 h-3.5 mb-0.5" style={{ color }} strokeWidth={1.5} />
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, color: '#e4e4e7' }}>{value}</span>
                </div>
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#71717a', textAlign: 'center', lineHeight: 1.3, marginBottom: 4 }}>
                {label}
              </p>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color, fontWeight: 500, marginBottom: 3 }}>{unit}</span>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#3f3f46', textAlign: 'center', lineHeight: 1.3 }}>{note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
