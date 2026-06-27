'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// CIRCULAR GAUGE
// ============================================================
interface CircularGaugeProps {
  value: number;       // 0–100
  max?: number;
  label: string;
  sublabel?: string;
  color?: string;      // hex / rgb string
  trailColor?: string;
  size?: number;
  strokeWidth?: number;
  unit?: string;
  showValue?: boolean;
  glowColor?: string;
}

export function CircularGauge({
  value,
  max = 100,
  label,
  sublabel,
  color = '#22D3EE',
  trailColor = 'rgba(255,255,255,0.04)',
  size = 120,
  strokeWidth = 7,
  unit = '',
  showValue = true,
  glowColor,
}: CircularGaugeProps) {
  const normalised = Math.min(Math.max(value / max, 0), 1);
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const dashoffset = circumference * (1 - normalised * 0.75); // 270° arc
  const glow = glowColor ?? color;
  const viewBox = size;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${viewBox} ${viewBox}`}
          style={{ transform: 'rotate(135deg)' }}
        >
          {/* Drop shadow filter */}
          <defs>
            <filter id={`glow-${label}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id={`arc-grad-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </linearGradient>
          </defs>
          {/* Trail */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={trailColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          />
          {/* Progress arc */}
          <motion.circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={`url(#arc-grad-${label})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashoffset }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            filter={`url(#glow-${label})`}
            style={{ filter: `drop-shadow(0 0 6px ${glow}88)` }}
          />
        </svg>
        {/* Center content */}
        {showValue && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ paddingBottom: 4 }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="font-number text-white leading-none"
              style={{ fontSize: size * 0.22, fontWeight: 300 }}
            >
              {Math.round(value)}{unit}
            </motion.span>
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">{label}</p>
        {sublabel && <p className="text-[10px] text-white/25 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

// ============================================================
// WIND COMPASS
// ============================================================
interface WindCompassProps {
  direction: number; // 0–360 degrees
  speed: number;     // km/h
  gust?: number;
  size?: number;
}

export function WindCompass({ direction, speed, gust, size = 140 }: WindCompassProps) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(direction / 45) % 8;
  const cardinalDir = dirs[idx];

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

  const needleLength = r * 0.72;
  const angleRad = ((direction - 90) * Math.PI) / 180;
  const arrowX = cx + needleLength * Math.cos(angleRad);
  const arrowY = cy + needleLength * Math.sin(angleRad);
  const tailX  = cx - (needleLength * 0.4) * Math.cos(angleRad);
  const tailY  = cy - (needleLength * 0.4) * Math.sin(angleRad);

  const speedPct = Math.min(speed / 80, 1);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <radialGradient id="compassBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="rgba(34,211,238,0.04)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          {/* Outer ring */}
          <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          {/* Background */}
          <circle cx={cx} cy={cy} r={r} fill="url(#compassBg)" />
          {/* Ring */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
          {/* Speed ring */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="rgba(34,211,238,0.4)"
            strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * r * speedPct} ${2 * Math.PI * r * (1 - speedPct)}`}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, filter: 'drop-shadow(0 0 4px rgba(34,211,238,0.5))' }}
          />
          {/* Cardinal ticks */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const a = ((deg - 90) * Math.PI) / 180;
            const isMajor = deg % 90 === 0;
            const r1 = r - (isMajor ? 14 : 8);
            const r2 = r - 2;
            return (
              <line key={deg}
                x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)}
                x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)}
                stroke={isMajor ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}
                strokeWidth={isMajor ? 1.5 : 1}
              />
            );
          })}
          {/* Cardinal labels */}
          {['N', 'E', 'S', 'W'].map((d, i) => {
            const a = ((i * 90 - 90) * Math.PI) / 180;
            const lr = r - 22;
            return (
              <text key={d}
                x={cx + lr * Math.cos(a)} y={cy + lr * Math.sin(a) + 4}
                textAnchor="middle"
                fill="rgba(255,255,255,0.3)"
                fontSize="10"
                fontFamily="var(--font-heading)"
                fontWeight="600"
              >{d}</text>
            );
          })}
          {/* Center dot */}
          <circle cx={cx} cy={cy} r={5} fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          {/* Needle tail */}
          <motion.line
            x1={cx} y1={cy}
            x2={tailX} y2={tailY}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          />
          {/* Needle head */}
          <motion.line
            x1={cx} y1={cy}
            x2={arrowX} y2={arrowY}
            stroke="#22D3EE"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 5px rgba(34,211,238,0.7))' }}
            initial={{ rotate: 0, originX: `${cx}px`, originY: `${cy}px` }}
            animate={{ rotate: direction - 45 }}
            transition={{ type: 'spring', stiffness: 60, damping: 14, delay: 0.2 }}
          />
          {/* Arrow tip */}
          <motion.circle
            cx={arrowX} cy={arrowY} r={3.5}
            fill="#22D3EE"
            style={{ filter: 'drop-shadow(0 0 5px rgba(34,211,238,0.8))' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-number text-white text-lg font-light leading-none">{Math.round(speed)}</span>
          <span className="text-[9px] text-white/30 uppercase tracking-wider mt-0.5">km/h</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-white/70">{cardinalDir} · {direction}°</p>
        {gust !== undefined && (
          <p className="text-[10px] text-white/35 mt-0.5">Gusts {Math.round(gust)} km/h</p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SUN PATH ARC
// ============================================================
interface SunPathArcProps {
  sunrise: string; // "06:30"
  sunset: string;  // "20:15"
  goldenHourMorning?: string;
  goldenHourEvening?: string;
  width?: number;
  height?: number;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function SunPathArc({
  sunrise,
  sunset,
  goldenHourMorning,
  goldenHourEvening,
  width = 320,
  height = 130,
}: SunPathArcProps) {
  const pad = 28;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const sunriseMin = timeToMinutes(sunrise);
  const sunsetMin  = timeToMinutes(sunset);

  const totalSpan  = sunsetMin - sunriseMin;
  const progress   = Math.max(0, Math.min(1, (nowMin - sunriseMin) / totalSpan));

  const arcW = width - pad * 2;
  const arcH = height - 30;

  const getX = (t: number) => pad + ((t - sunriseMin) / totalSpan) * arcW;
  const getY = (p: number) => {
    const curve = 4 * p * (1 - p);
    return height - 24 - curve * arcH;
  };

  const sunX = pad + progress * arcW;
  const sunY = getY(progress);

  // Build arc path
  const steps = 60;
  const pts = Array.from({ length: steps + 1 }, (_, i) => {
    const p = i / steps;
    return `${getX(sunriseMin + p * totalSpan)},${getY(p)}`;
  });
  const pastPts = pts.slice(0, Math.round(progress * steps) + 1);

  return (
    <div className="w-full">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="sunPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="rgba(245,158,11,0.2)" />
            <stop offset="50%"  stopColor="rgba(249,115,22,0.35)" />
            <stop offset="100%" stopColor="rgba(239,68,68,0.15)" />
          </linearGradient>
          <linearGradient id="sunPathPast" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="rgba(251,191,36,0.6)" />
            <stop offset="100%" stopColor="rgba(249,115,22,0.8)" />
          </linearGradient>
          <filter id="sunGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Ground line */}
        <line x1={pad} y1={height - 18} x2={width - pad} y2={height - 18}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />

        {/* Full arc (future) */}
        <polyline
          points={pts.join(' ')}
          fill="none"
          stroke="url(#sunPathGrad)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.5"
        />
        {/* Past arc */}
        {pastPts.length > 1 && (
          <polyline
            points={pastPts.join(' ')}
            fill="none"
            stroke="url(#sunPathPast)"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.8"
          />
        )}

        {/* Golden hour markers */}
        {goldenHourMorning && (() => {
          const ghx = getX(timeToMinutes(goldenHourMorning));
          return (
            <g>
              <line x1={ghx} y1={height - 22} x2={ghx} y2={height - 10}
                stroke="rgba(251,191,36,0.3)" strokeWidth="1" />
              <text x={ghx} y={height - 4} textAnchor="middle"
                fill="rgba(251,191,36,0.5)" fontSize="8" fontFamily="var(--font-body)">
                ✦
              </text>
            </g>
          );
        })()}
        {goldenHourEvening && (() => {
          const ghx = getX(timeToMinutes(goldenHourEvening));
          return (
            <g>
              <line x1={ghx} y1={height - 22} x2={ghx} y2={height - 10}
                stroke="rgba(251,191,36,0.3)" strokeWidth="1" />
              <text x={ghx} y={height - 4} textAnchor="middle"
                fill="rgba(251,191,36,0.5)" fontSize="8" fontFamily="var(--font-body)">
                ✦
              </text>
            </g>
          );
        })()}

        {/* Sunrise label */}
        <text x={pad} y={height - 4} fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="middle"
          fontFamily="var(--font-body)">{sunrise}</text>
        {/* Sunset label */}
        <text x={width - pad} y={height - 4} fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="middle"
          fontFamily="var(--font-body)">{sunset}</text>

        {/* Sun disc */}
        {progress > 0 && progress < 1 && (
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 80 }}
            filter="url(#sunGlow)"
          >
            {/* Outer glow ring */}
            <circle cx={sunX} cy={sunY} r={11}
              fill="rgba(251,191,36,0.12)"
              stroke="rgba(251,191,36,0.2)"
              strokeWidth="1"
            />
            {/* Sun body */}
            <circle cx={sunX} cy={sunY} r={6.5}
              fill="rgb(251,191,36)"
              style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.9))' }}
            />
          </motion.g>
        )}
      </svg>
    </div>
  );
}

// ============================================================
// TEMPERATURE RANGE BAR
// ============================================================
interface TempRangeBarProps {
  min: number;
  max: number;
  current: number;
  absoluteMin?: number;
  absoluteMax?: number;
  unit?: string;
}

export function TempRangeBar({
  min, max, current,
  absoluteMin = -20,
  absoluteMax = 50,
  unit = '°C',
}: TempRangeBarProps) {
  const span = absoluteMax - absoluteMin;
  const toPercent = (v: number) => Math.max(0, Math.min(100, ((v - absoluteMin) / span) * 100));

  const minPct = toPercent(min);
  const maxPct = toPercent(max);
  const curPct = toPercent(current);
  const rangePct = maxPct - minPct;

  const getColor = (v: number) => {
    if (v <= 0) return '#38bdf8';
    if (v <= 15) return '#34d399';
    if (v <= 28) return '#facc15';
    if (v <= 38) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs font-number text-white/40">
        <span>{min}{unit}</span>
        <span className="text-white/70 font-medium">{current}{unit}</span>
        <span>{max}{unit}</span>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {/* Gradient track */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(90deg, #38bdf8 0%, #34d399 25%, #facc15 50%, #f97316 75%, #ef4444 100%)',
          opacity: 0.12,
        }} />
        {/* Range segment */}
        <motion.div
          className="absolute h-full rounded-full"
          style={{
            left: `${minPct}%`,
            background: `linear-gradient(90deg, ${getColor(min)}, ${getColor(max)})`,
            opacity: 0.7,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${rangePct}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Current position marker */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2"
          style={{
            left: `calc(${curPct}% - 6px)`,
            background: getColor(current),
            borderColor: 'rgba(255,255,255,0.9)',
            boxShadow: `0 0 10px ${getColor(current)}99`,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 120 }}
        />
      </div>
    </div>
  );
}

// ============================================================
// AQI GAUGE (horizontal pill)
// ============================================================
interface AqiGaugeProps {
  aqi: number;
}

export function AqiGauge({ aqi }: AqiGaugeProps) {
  const bands = [
    { label: 'Good',        max: 50,  color: '#22c55e' },
    { label: 'Moderate',    max: 100, color: '#facc15' },
    { label: 'Unhealthy*',  max: 150, color: '#f97316' },
    { label: 'Unhealthy',   max: 200, color: '#ef4444' },
    { label: 'Very Unhlt.', max: 300, color: '#a78bfa' },
    { label: 'Hazardous',   max: 500, color: '#7f1d1d' },
  ];

  const pct = Math.min(aqi / 300, 1) * 100;
  const activeBand = bands.find(b => aqi <= b.max) ?? bands[bands.length - 1];

  return (
    <div className="w-full space-y-2">
      <div className="flex items-end justify-between">
        <div>
          <span className="font-number text-3xl text-white font-light">{aqi}</span>
          <span className="text-xs text-white/30 ml-1.5">AQI</span>
        </div>
        <span className="text-sm font-medium" style={{ color: activeBand.color }}>{activeBand.label}</span>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="absolute inset-0 rounded-full" style={{
          background: 'linear-gradient(90deg, #22c55e 0%, #facc15 33%, #f97316 55%, #ef4444 70%, #a78bfa 88%, #7f1d1d 100%)',
          opacity: 0.25,
        }} />
        <motion.div
          className="absolute h-full rounded-full"
          style={{ background: activeBand.color, boxShadow: `0 0 8px ${activeBand.color}88` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-white/20">
        <span>0</span><span>100</span><span>200</span><span>300+</span>
      </div>
    </div>
  );
}
