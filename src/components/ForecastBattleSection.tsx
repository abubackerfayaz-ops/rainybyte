'use client';

import { Trophy, TrendingUp, Cpu, Star } from 'lucide-react';

interface ModelEntry {
  name: string;
  fullName: string;
  accuracy: number;
  confidence: number;
  rank: number;
  badge?: string;
  badgeColor?: string;
  trend?: string;
  trendUp?: boolean;
  description: string;
  color: string;
  isAI?: boolean;
}

interface ForecastBattleSectionProps {
  modelComparisons?: any[];
  activeModel?: any;
}

const CONSENSUS = [
  { label: 'Temperature at 18:00', value: '29°C', agreement: 95 },
  { label: 'Rain probability', value: '42%', agreement: 87 },
  { label: 'Wind peak', value: '22 km/h', agreement: 91 },
];

export default function ForecastBattleSection({ modelComparisons, activeModel }: ForecastBattleSectionProps) {
  const MODELS: ModelEntry[] = [
    { name: 'ECMWF', fullName: 'European Centre', accuracy: 94.2, confidence: 92, rank: 1, badge: 'Champion', badgeColor: '#f97316', trend: '+0.8%', trendUp: true, description: 'Global ensemble leader', color: '#f97316' },
    { name: 'AIFS', fullName: 'ECMWF AI Model', accuracy: 92.6, confidence: 91, rank: 2, badge: 'AI Model', badgeColor: '#a78bfa', trend: '+2.4%', trendUp: true, description: 'Neural weather prediction', color: '#a78bfa', isAI: true },
    { name: 'GFS', fullName: 'Global Forecast System', accuracy: 91.8, confidence: 89, rank: 3, badge: 'Runner-up', badgeColor: '#94a3b8', trend: '+0.2%', trendUp: true, description: 'NOAA flagship model', color: '#94a3b8' },
    { name: 'ICON', fullName: 'DWD ICON', accuracy: 89.3, confidence: 87, rank: 4, trend: '-0.3%', trendUp: false, description: 'German Weather Service', color: '#60a5fa' },
    { name: 'UKMO', fullName: 'UK Met Office', accuracy: 87.6, confidence: 84, rank: 5, trend: '+0.5%', trendUp: true, description: 'Unified model system', color: '#34d399' },
    { name: 'GEM', fullName: 'Global Environmental', accuracy: 85.4, confidence: 82, rank: 6, trend: '-0.1%', trendUp: false, description: 'Environment Canada', color: '#fb923c' },
  ];

  return (
    <section className="section-container pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-5 h-5" style={{ color: '#f97316' }} strokeWidth={1.5} />
            <div>
              <h2 className="font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, color: '#e4e4e7' }}>
                Forecast Battle Arena
              </h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#52525b' }}>
                Model accuracy rankings · 30-day rolling window
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {MODELS.map((m) => (
              <div
                key={m.name}
                className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:bg-white/[0.04] cursor-default group"
                style={{
                  background: m.rank === 1 ? 'rgba(249,115,22,0.04)' : 'rgba(255,255,255,0.015)',
                  border: `1px solid ${m.rank === 1 ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.04)'}`,
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{
                    background: m.rank === 1 ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.05)',
                    color: m.rank === 1 ? '#f97316' : '#52525b',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {m.rank === 1 ? <Star className="w-3.5 h-3.5" fill="currentColor" strokeWidth={0} /> : m.rank}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#e4e4e7' }}>
                      {m.name}
                    </span>
                    {m.badge && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${m.badgeColor}18`, border: `1px solid ${m.badgeColor}35`, color: m.badgeColor, fontFamily: 'Inter, sans-serif' }}>
                        {m.isAI && <Cpu className="w-2.5 h-2.5 inline mr-1" />}
                        {m.badge}
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#52525b' }}>{m.description}</p>
                </div>

                <div className="w-28 hidden sm:block">
                  <div className="flex justify-between mb-1">
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#52525b' }}>Accuracy</span>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: m.color, fontWeight: 600 }}>{m.accuracy}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${((m.accuracy - 80) / 20) * 100}%`, background: `linear-gradient(90deg, ${m.color}80, ${m.color})` }} />
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#e4e4e7' }}>{m.confidence}%</div>
                  <div className="text-xs flex items-center justify-end gap-0.5" style={{ color: m.trendUp ? '#4ade80' : '#f87171', fontFamily: 'Inter, sans-serif' }}>
                    <TrendingUp className="w-3 h-3" style={{ transform: m.trendUp ? 'none' : 'scaleY(-1)' }} />
                    {m.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-6 flex flex-col" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="font-semibold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, color: '#e4e4e7' }}>
            Model Consensus
          </h3>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#52525b', marginBottom: 20 }}>
            Agreement across all 6 models
          </p>

          <div className="space-y-5 flex-1">
            {CONSENSUS.map(({ label, value, agreement }) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-2">
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#71717a' }}>{label}</span>
                  <span className="font-semibold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#e4e4e7' }}>{value}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${agreement}%`,
                      background: agreement > 90
                        ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                        : agreement > 80
                        ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                        : 'linear-gradient(90deg, #f87171, #ef4444)',
                    }}
                  />
                </div>
                <div className="flex justify-end mt-1">
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#52525b' }}>{agreement}% agreement</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-4 rounded-xl" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#86efac', lineHeight: 1.6 }}>
              <strong>High consensus:</strong> All 6 models agree the main precipitation event arrives between 18:00–20:00.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
