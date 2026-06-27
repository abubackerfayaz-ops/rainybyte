'use client';

import { Sun, Wind, Star, Telescope, MapPin } from 'lucide-react';

const RANKINGS = [
  {
    title: 'Best Weather Today',
    subtitle: 'Highest comfort & sunshine',
    icon: Sun,
    accentColor: '#f97316',
    items: [
      { rank: 1, city: 'Barcelona', country: 'ES', value: '27°C · Clear', score: 96, badge: '🏆' },
      { rank: 2, city: 'Lisbon', country: 'PT', value: '24°C · Sunny', score: 93, badge: '' },
      { rank: 3, city: 'Nice', country: 'FR', value: '25°C · Sunny', score: 91, badge: '' },
      { rank: 4, city: 'Athens', country: 'GR', value: '30°C · Hot', score: 88, badge: '' },
      { rank: 5, city: 'Seville', country: 'ES', value: '34°C · Clear', score: 85, badge: '' },
    ],
  },
  {
    title: 'Best Stargazing',
    subtitle: 'Darkest skies tonight',
    icon: Telescope,
    accentColor: '#a78bfa',
    items: [
      { rank: 1, city: 'Atacama', country: 'CL', value: 'Bortle 1 · Seeing 98%', score: 99, badge: '🔭' },
      { rank: 2, city: 'Canary Islands', country: 'ES', value: 'Bortle 2 · Seeing 95%', score: 97, badge: '' },
      { rank: 3, city: 'Queenstown', country: 'NZ', value: 'Bortle 2 · Seeing 92%', score: 94, badge: '' },
      { rank: 4, city: 'Sahara Desert', country: 'MA', value: 'Bortle 1 · Seeing 90%', score: 93, badge: '' },
      { rank: 5, city: 'Iceland', country: 'IS', value: 'Aurora 80% · Bortle 3', score: 89, badge: '' },
    ],
  },
  {
    title: 'Worst Air Quality',
    subtitle: 'PM2.5 alerts active',
    icon: Wind,
    accentColor: '#f87171',
    items: [
      { rank: 1, city: 'Delhi', country: 'IN', value: 'AQI 312 · Hazardous', score: 312, badge: '⚠️' },
      { rank: 2, city: 'Lahore', country: 'PK', value: 'AQI 267 · Very Unhealthy', score: 267, badge: '' },
      { rank: 3, city: 'Dhaka', country: 'BD', value: 'AQI 211 · Very Unhealthy', score: 211, badge: '' },
      { rank: 4, city: 'Karachi', country: 'PK', value: 'AQI 186 · Unhealthy', score: 186, badge: '' },
      { rank: 5, city: 'Beijing', country: 'CN', value: 'AQI 158 · Unhealthy', score: 158, badge: '' },
    ],
  },
  {
    title: 'Best Sunset Spots',
    subtitle: 'Golden hour quality score',
    icon: Star,
    accentColor: '#fbbf24',
    items: [
      { rank: 1, city: 'Santorini', country: 'GR', value: 'Score 98 · Thin clouds', score: 98, badge: '🌅' },
      { rank: 2, city: 'Maldives', country: 'MV', value: 'Score 96 · Clear horizon', score: 96, badge: '' },
      { rank: 3, city: 'Sedona', country: 'US', value: 'Score 94 · Red rock glow', score: 94, badge: '' },
      { rank: 4, city: 'Cape Town', country: 'ZA', value: 'Score 91 · Ocean view', score: 91, badge: '' },
      { rank: 5, city: 'Bali', country: 'ID', value: 'Score 89 · Partly cloudy', score: 89, badge: '' },
    ],
  },
];

export default function GlobalRankingsSection() {
  return (
    <section className="section-container pb-10">
      <div className="flex items-center gap-3 mb-5">
        <MapPin className="w-5 h-5" style={{ color: '#52525b' }} strokeWidth={1.5} />
        <div>
          <h2 className="font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, color: '#e4e4e7' }}>
            Global Weather Rankings
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#52525b' }}>
            Live intelligence across 40,000+ stations worldwide
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {RANKINGS.map(({ title, subtitle, icon: Icon, accentColor, items }) => (
          <div
            key={title}
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-2.5 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}>
                <Icon className="w-3.5 h-3.5" style={{ color: accentColor }} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#e4e4e7' }}>{title}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#52525b' }}>{subtitle}</p>
              </div>
            </div>

            <div className="px-3 py-2">
              {items.map(({ rank, city, country, value, score, badge }) => (
                <div key={city} className="flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all duration-200 hover:bg-white/[0.04] cursor-default group">
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: rank === 1 ? accentColor : '#3f3f46', fontWeight: rank === 1 ? 700 : 400, width: 16, textAlign: 'center', flexShrink: 0 }}>
                    {badge || rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: '#e4e4e7', fontWeight: 500 }}>{city}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#3f3f46' }}>{country}</span>
                    </div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#52525b', marginTop: 1 }}>{value}</p>
                  </div>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: rank === 1 ? accentColor : '#52525b', fontWeight: rank === 1 ? 600 : 400, flexShrink: 0 }}>
                    {score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
