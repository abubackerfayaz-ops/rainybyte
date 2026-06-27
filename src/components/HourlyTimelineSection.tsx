'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type Metric = 'temp' | 'rain' | 'wind' | 'comfort';

const METRIC_CONFIG: Record<Metric, { label: string; color: string; unit: string }> = {
  temp: { label: 'Temperature', color: '#f97316', unit: '°C' },
  rain: { label: 'Rain Probability', color: '#60a5fa', unit: '%' },
  wind: { label: 'Wind Speed', color: '#22d3ee', unit: ' km/h' },
  comfort: { label: 'Comfort Score', color: '#4ade80', unit: '/100' },
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl" style={{ background: 'rgba(9,9,11,0.95)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: "'Space Grotesk', sans-serif", color: '#e4e4e7', fontSize: 13 }}>
      <div style={{ color: '#71717a', fontSize: 11, marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{payload[0].value}</div>
    </div>
  );
};

interface HourlyTimelineSectionProps {
  hourlyForecast: any[];
}

export default function HourlyTimelineSection({ hourlyForecast }: HourlyTimelineSectionProps) {
  const [metric, setMetric] = useState<Metric>('temp');
  const cfg = METRIC_CONFIG[metric];

  const data = hourlyForecast.slice(0, 12).map((h) => ({
    time: h.time === 'Now' ? 'Now' : h.time,
    temp: Math.round(h.temp),
    rain: h.rainChance || 0,
    wind: Math.round(h.windSpeed || 0),
    comfort: Math.round(Math.max(0, 100 - Math.abs(h.temp - 22) * 2.5 - (h.humidity > 70 ? (h.humidity - 70) : 0))),
    condition: h.temp > 30 ? '☀️' : h.rainChance > 50 ? '🌧' : h.rainChance > 20 ? '🌦' : h.cloudCover > 60 ? '⛅' : '☀️',
  }));

  return (
    <section className="section-container pb-6">
      <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, color: '#e4e4e7' }}>
            Hourly Forecast
          </h2>
          <div className="flex gap-1.5">
            {(Object.keys(METRIC_CONFIG) as Metric[]).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
                style={{
                  background: metric === m ? `${METRIC_CONFIG[m].color}20` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${metric === m ? `${METRIC_CONFIG[m].color}50` : 'rgba(255,255,255,0.07)'}`,
                  color: metric === m ? METRIC_CONFIG[m].color : '#71717a',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {METRIC_CONFIG[m].label}
              </button>
            ))}
          </div>
        </div>

        {data.length > 0 && (
          <>
            <div className="flex gap-3 overflow-x-auto pb-3 mb-4" style={{ scrollbarWidth: 'none' }}>
              {data.map((h, i) => {
                const val = h[metric];
                return (
                  <div key={i} className="flex flex-col items-center gap-2 min-w-[60px] shrink-0">
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#52525b' }}>{h.time}</span>
                    <span style={{ fontSize: 18 }}>{h.condition}</span>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: '#e4e4e7', fontWeight: 500 }}>
                      {val}{metric === 'temp' ? '°' : ''}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -30 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={cfg.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={cfg.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fill: '#3f3f46', fontSize: 10, fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#3f3f46', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey={metric} stroke={cfg.color} strokeWidth={1.5} fill="url(#areaGrad)" dot={false} activeDot={{ r: 4, fill: cfg.color, strokeWidth: 0 }} isAnimationActive={true} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
