'use client';

import { useEffect, useRef, useState } from 'react';
import { Wind, Droplets, Eye, ArrowDown } from 'lucide-react';
import { useUnit } from '@/lib/unit-context';

interface HeroSectionProps {
  location: any;
  current: any;
  loading: boolean;
}

export default function HeroSection({ location, current, loading }: HeroSectionProps) {
  const { unit, convertTemp } = useUnit();
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!current) return;
    let frame = 0;
    const celsius = current.temp || 0;
    const target = unit === 'F' ? Math.round(celsius * 9 / 5 + 32) : Math.round(celsius);
    const duration = 60;
    const id = setInterval(() => {
      frame++;
      setCount(Math.round((frame / duration) * target));
      if (frame >= duration) clearInterval(id);
    }, 16);
  }, [current, unit]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.5 - 0.1,
        life: Math.random() * 200,
        maxLife: 150 + Math.random() * 100,
        size: Math.random() * 1.5 + 0.3,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (p.life > p.maxLife) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 10;
          p.life = 0;
        }
        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.35;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249,115,22,${alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  if (loading || !current) {
    return (
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20" style={{ background: '#09090B' }}>
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border border-white/[0.04] border-t-cyan/70 animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20"
      style={{ background: '#09090B' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.7 }}
      />

      <div
        className="absolute pointer-events-none"
        style={{
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-60%, -55%)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
          bottom: '10%', right: '10%',
        }}
      />

      <div
        className="relative z-10 max-w-6xl mx-auto px-6 w-full transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.25)',
              color: '#4ade80',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live · Updated 2 min ago
          </div>
          <span style={{ color: '#52525b', fontFamily: 'Inter, sans-serif', fontSize: 12 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        <h1
          className="font-semibold tracking-tight mb-2"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(28px, 5vw, 36px)',
            color: '#A1A1AA',
            fontWeight: 400,
          }}
        >
          {location?.name || 'Earth'}
        </h1>

        <div className="flex items-start gap-6 mb-4">
          <div
            className="font-semibold leading-none select-none"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(72px, 12vw, 108px)',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #f97316 0%, #fb923c 40%, #fbbf24 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {count}°{unit}
          </div>
          <div className="flex flex-col gap-2 mt-6">
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#A1A1AA', fontWeight: 400 }}>
              Feels like <span style={{ color: '#e4e4e7', fontWeight: 500 }}>{convertTemp(current.feelsLike || current.temp)}</span>
            </span>
            <span
              className="px-3 py-1.5 rounded-xl text-sm font-medium"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                color: '#e4e4e7',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {current.condition === 'Clear' ? '☀️' : current.condition === 'Partly Cloudy' ? '⛅' : current.condition === 'Overcast' ? '☁️' : current.condition === 'Rain' ? '🌧' : current.condition === 'Snow' ? '🌨' : '⛅'} {current.condition}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-10">
          {[
            { icon: Droplets, label: 'Humidity', value: `${current.humidity}%`, color: '#60a5fa' },
            { icon: Wind, label: 'Wind', value: `${current.windSpeed} km/h ${(['N','NE','E','SE','S','SW','W','NW'][Math.round(current.windDirection/45)%8])}`, color: '#22d3ee' },
            { icon: Eye, label: 'Visibility', value: `${current.visibility} km`, color: '#a78bfa' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.5} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#71717a' }}>{label}</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: '#e4e4e7' }}>{value}</span>
            </div>
          ))}
        </div>

        <div
          className="relative max-w-2xl p-6 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="absolute -top-3 left-5 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
            style={{
              background: '#09090B',
              border: '1px solid rgba(249,115,22,0.3)',
              color: '#fb923c',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#f97316' }} />
            AI Weather Intelligence
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#A1A1AA', lineHeight: 1.7, fontWeight: 400 }}>
            {current.condition === 'Clear'
              ? `Clear skies over ${location.name.split(',')[0]} today with excellent outdoor conditions. Air quality remains moderate. The golden-hour light arriving in the evening makes tonight an exceptional time for photography.`
              : current.condition === 'Rain'
              ? `Rain expected throughout the day in ${location.name.split(',')[0]}. The heaviest precipitation arrives mid-afternoon. Carry an umbrella if heading out. Conditions improve toward evening with clearing skies by late night.`
              : current.condition === 'Cloudy' || current.condition === 'Overcast' || current.condition === 'Partly Cloudy'
              ? `Cloudy conditions over ${location.name.split(',')[0]} with mild temperatures. Air quality is moderate. Occasional breaks in the clouds possible by late afternoon. A comfortable day for indoor and covered outdoor activities.`
              : `Current conditions in ${location.name.split(',')[0]} show ${current.condition?.toLowerCase() || 'variable weather'}. Stay updated with the hourly forecast for precise timing of weather changes.`}
          </p>
        </div>

        <div className="flex justify-center mt-16">
          <div className="flex flex-col items-center gap-2 animate-bounce" style={{ color: '#3f3f46' }}>
            <ArrowDown className="w-5 h-5" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </section>
  );
}
