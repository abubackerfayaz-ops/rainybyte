'use client';

import { Brain, Heart, Camera, Activity, Plane, PersonStanding, TrendingUp } from 'lucide-react';

function CircularGauge({ value, max = 100, color, size = 72 }: { value: number; max?: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const dash = pct * circ;
  const gap = circ - dash;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${gap}`} strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
      />
    </svg>
  );
}

interface AIIntelligencePanelProps {
  comfortScore: number;
  confidenceScore: number;
  current: any;
}

export default function AIIntelligencePanel({ comfortScore, confidenceScore, current }: AIIntelligencePanelProps) {
  const SCORES = [
    { label: 'Forecast Confidence', value: confidenceScore, unit: '%', icon: Brain, color: '#f97316', description: 'High certainty' },
    { label: 'Comfort Score', value: comfortScore, unit: '/100', icon: Heart, color: '#4ade80', description: comfortScore >= 80 ? 'Very comfortable' : comfortScore >= 60 ? 'Comfortable' : 'Uncomfortable' },
    { label: 'Photography', value: current?.condition === 'Clear' ? 91 : current?.condition === 'Partly Cloudy' ? 78 : 55, unit: '/100', icon: Camera, color: '#a78bfa', description: current?.condition === 'Clear' ? 'Exceptional light' : 'Moderate conditions' },
    { label: 'Exercise', value: current?.temp > 30 ? 45 : current?.temp > 25 ? 74 : current?.temp > 15 ? 85 : 50, unit: '/100', icon: Activity, color: '#22d3ee', description: current?.temp > 30 ? 'Heat caution' : 'Good conditions' },
    { label: 'Travel', value: current?.rain > 50 ? 45 : current?.rain > 20 ? 65 : 88, unit: '/100', icon: Plane, color: '#60a5fa', description: current?.rain > 50 ? 'Rain likely' : 'Clear skies' },
    { label: 'Outdoor Activity', value: current?.temp > 35 ? 35 : current?.temp > 30 ? 60 : current?.temp > 10 ? 85 : 40, unit: '/100', icon: PersonStanding, color: '#fb923c', description: current?.temp > 35 ? 'Extreme heat' : 'Great conditions' },
    { label: 'Health Risk', value: current?.aqi > 150 ? 65 : current?.aqi > 100 ? 40 : 22, unit: '/100', icon: TrendingUp, color: current?.aqi > 150 ? '#ef4444' : current?.aqi > 100 ? '#f59e0b' : '#4ade80', description: current?.aqi > 150 ? 'High risk' : current?.aqi > 100 ? 'Moderate' : 'Low risk', inverted: true },
  ];

  return (
    <section className="section-container pb-6">
      <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3 mb-7">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)' }}>
            <Brain className="w-4 h-4" style={{ color: '#f97316' }} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-semibold leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, color: '#e4e4e7' }}>
              AI Weather Intelligence
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#52525b' }}>
              Powered by RainyByte Neural Engine v4.2
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {SCORES.map(({ label, value, unit, icon: Icon, color, description, inverted }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 hover:scale-105 cursor-default group"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="relative">
                <CircularGauge value={inverted ? 100 - value : value} color={color} size={68} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Icon className="w-3.5 h-3.5 mb-0.5" style={{ color }} strokeWidth={1.5} />
                  <span className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: '#e4e4e7' }}>
                    {value}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#71717a', lineHeight: 1.3, marginBottom: 2 }}>{label}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color, fontWeight: 500 }}>{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-5 flex items-center gap-4 px-5 py-3.5 rounded-xl"
          style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)' }}
        >
          <div className="w-1.5 h-10 rounded-full" style={{ background: 'linear-gradient(180deg, #f97316, #fbbf24)' }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#A1A1AA', lineHeight: 1.6 }}>
            <strong style={{ color: '#fb923c' }}>AI Insight:</strong> Today ranks in the{' '}
            <strong style={{ color: '#e4e4e7' }}>top 15%</strong> of days this year for overall conditions.{' '}
            {current?.condition === 'Clear'
              ? 'The afternoon golden hour will offer soft directional light. Sunset quality score is high.'
              : current?.condition === 'Rain'
              ? 'Rain is the dominant factor today. Plan indoor activities and watch for improving conditions by evening.'
              : 'Cloud cover creates a soft lighting environment throughout the day. Comfort levels remain favorable.'}
          </p>
        </div>
      </div>
    </section>
  );
}
