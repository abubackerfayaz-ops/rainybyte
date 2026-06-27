'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Shield, Thermometer, Droplets, Wind, Sun,
  Activity, AlertTriangle, CheckCircle, XCircle,
  TrendingUp, BarChart3, Target, Sword, Zap,
  CloudRain, Cloud, CloudLightning, Eye,
} from 'lucide-react';
import {
  calculateMetricConfidence,
  calculateHumanComfort,
  getActivityRecommendations,
  generateWeatherStory,
  getForecastArena,
  getCityComfortScores,
  HumanComfortResult,
  MetricConfidence,
  ActivityRecommendation,
  WeatherStory,
  ModelArenaEntry,
  MODE_PROFILES,
} from '../utils/weatherIntelligence';

interface WeatherIntelligencePanelProps {
  weatherData: any;
  current: any;
  activeModel: any;
  modelComparisons: any[];
  hourlyForecast: any[];
  dailyForecast: any[];
  airQuality: any;
  agriculture: any;
  astronomy: any;
  travel: any;
  location: any;
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.05 },
  }),
};

export default function WeatherIntelligencePanel({
  weatherData, current, activeModel, modelComparisons,
  hourlyForecast, dailyForecast, airQuality, agriculture,
  astronomy, travel, location,
}: WeatherIntelligencePanelProps) {
  const confidences = calculateMetricConfidence(current, activeModel, hourlyForecast, dailyForecast);
  const comfort = calculateHumanComfort(current.temp, current.humidity, current.windSpeed, current.uvIndex);
  const activities = getActivityRecommendations(current, hourlyForecast, dailyForecast, airQuality, astronomy);
  const story = generateWeatherStory(current, hourlyForecast, dailyForecast);
  const arena = getForecastArena(modelComparisons);
  const cityScores = getCityComfortScores(location.name, current.temp, current.humidity, current.windSpeed, current.uvIndex);

  const todayScore = Math.round(
    activities.reduce((s: number, a: any) => s + a.score, 0) / activities.length
  );

  return (
    <div className="space-y-8">
      {/* Feature 5: What Should I Do Today? + Day Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 relative overflow-hidden"
      >
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.04) 0%, transparent 70%)' }} />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-3">
              <div className="icon-badge icon-badge-md icon-badge-cyan">
                <Brain className="w-5 h-5" style={{ color: '#22D3EE' }} />
              </div>
              <div>
                <h2 className="text-lg font-display text-white">What Should I Do Today?</h2>
                <p className="text-xs text-white/30 mt-0.5">AI-powered activity recommendations</p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-number text-5xl font-light text-white/90" style={{ textShadow: '0 0 30px rgba(255,255,255,0.1)' }}>
                {todayScore}
                <span className="text-xl text-white/25 font-light">/100</span>
              </div>
              <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">Day Score</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activities.map((a: ActivityRecommendation, i: number) => (
              <motion.div
                key={a.activity}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="relative p-4 rounded-2xl border cursor-default group transition-all duration-300"
                style={{
                  background: a.verdict === '✅'
                    ? 'rgba(34,197,94,0.04)'
                    : a.verdict === '☑️'
                    ? 'rgba(245,158,11,0.04)'
                    : 'rgba(239,68,68,0.03)',
                  borderColor: a.verdict === '✅'
                    ? 'rgba(34,197,94,0.12)'
                    : a.verdict === '☑️'
                    ? 'rgba(245,158,11,0.1)'
                    : 'rgba(239,68,68,0.08)',
                }}
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
                  boxShadow: a.verdict === '✅'
                    ? '0 0 30px rgba(34,197,94,0.08)'
                    : a.verdict === '☑️'
                    ? '0 0 30px rgba(245,158,11,0.07)'
                    : '0 0 30px rgba(239,68,68,0.06)'
                }} />

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl">{a.verdict}</span>
                  <span className={`stat-chip text-[9px] ${
                    a.score >= 70 ? 'stat-chip-emerald' : a.score >= 40 ? 'stat-chip-amber' : 'stat-chip-rose'
                  }`}>{a.score}/100</span>
                </div>
                <p className="text-sm font-medium text-white/80 mb-1">{a.activity}</p>
                <p className="text-[10px] text-white/25 mb-2">{a.timing}</p>
                <p className="text-[11px] text-white/40 leading-relaxed">{a.detail}</p>

                {/* Score bar */}
                <div className="mt-3 progress-bar-track">
                  <motion.div
                    className={`progress-bar-fill ${
                      a.score >= 70 ? 'emerald' : a.score >= 40 ? 'amber' : 'rose'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${a.score}%` }}
                    transition={{ duration: 1, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Feature 1: AI Confidence Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card glass-card-emerald p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="icon-badge icon-badge-md icon-badge-emerald">
              <Shield className="w-5 h-5" style={{ color: '#22C55E' }} />
            </div>
            <div>
              <h3 className="text-sm font-display text-white">AI Confidence Score</h3>
              <p className="text-[10px] text-white/30 mt-0.5">Per-metric forecast reliability</p>
            </div>
          </div>

          <div className="space-y-5">
            {confidences.map((m: MetricConfidence, i: number) => (
              <motion.div
                key={m.label}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {m.label === 'Temperature' ? <Thermometer className="w-3.5 h-3.5 text-white/30" /> :
                     m.label === 'Rain Probability' ? <CloudRain className="w-3.5 h-3.5 text-white/30" /> :
                     m.label === 'Wind Speed' ? <Wind className="w-3.5 h-3.5 text-white/30" /> :
                     m.label === 'Humidity' ? <Droplets className="w-3.5 h-3.5 text-white/30" /> :
                     <Sun className="w-3.5 h-3.5 text-white/30" />}
                    <span className="text-white/50">{m.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-number text-white/60 text-xs">
                      {m.label === 'Temperature' ? `${Math.round(m.value)}°C` :
                       m.label === 'Rain Probability' ? `${Math.round(m.value)}%` :
                       m.label === 'Wind Speed' ? `${Math.round(m.value)} km/h` :
                       m.label === 'Humidity' ? `${Math.round(m.value)}%` :
                       `${m.value}`}
                    </span>
                    <span className={`stat-chip text-[9px] ${
                      m.confidence >= 85 ? 'stat-chip-emerald' : m.confidence >= 65 ? 'stat-chip-amber' : 'stat-chip-rose'
                    }`}>{m.confidence}%</span>
                  </div>
                </div>
                <div className="progress-bar-track">
                  <motion.div
                    className={`progress-bar-fill ${
                      m.confidence >= 85 ? 'emerald' : m.confidence >= 65 ? 'amber' : 'rose'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${m.confidence}%` }}
                    transition={{ duration: 1.1, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <p className="text-[10px] text-white/20 leading-relaxed">{m.explanation}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feature 3: AI Weather Storytelling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="glass-card p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-display text-white">AI Weather Story</h3>
              <p className="text-[10px] text-white/30">Natural language forecast</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="p-5 rounded-xl bg-gradient-to-br from-white/[0.02] to-white/[0.01] border border-white/[0.04]">
              <p className="text-sm text-white/80 leading-relaxed font-light">
                {story.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { time: 'Morning', text: story.morning, icon: '🌅' },
                { time: 'Afternoon', text: story.afternoon, icon: '☀️' },
                { time: 'Evening', text: story.evening, icon: '🌇' },
                { time: 'Night', text: story.night, icon: '🌙' },
              ].map((p, i) => (
                <motion.div
                  key={p.time}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="flex gap-3 p-3 rounded-lg bg-white/[0.01] border border-white/[0.03]"
                >
                  <span className="text-lg shrink-0">{p.icon}</span>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-white/30 font-medium">{p.time}</span>
                    <p className="text-xs text-white/60 leading-relaxed mt-0.5">{p.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Feature 2: Human Comfort Index */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-display text-white">Human Comfort Index</h3>
              <p className="text-[10px] text-white/30">How the weather actually feels</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/20 mb-1">Comfort Score</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-display text-white">{comfort.comfortScore}</span>
                <span className="text-sm text-white/30 mb-1">/100</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                comfort.category === 'Excellent' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                comfort.category === 'Comfortable' ? 'bg-cyan/10 text-cyan border border-cyan/20' :
                comfort.category === 'Moderate' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                comfort.category === 'Uncomfortable' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                'bg-red-500/15 text-red-400 border border-red-500/20'
              }`}>{comfort.category}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 rounded-lg bg-white/[0.01] border border-white/[0.03]">
              <p className="text-[10px] text-white/20 uppercase tracking-wider">Outside</p>
              <p className="text-lg font-light text-white mt-0.5">{Math.round(current.temp)}°C</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.01] border border-white/[0.03]">
              <p className="text-[10px] text-white/20 uppercase tracking-wider">Feels Like</p>
              <p className="text-lg font-light text-white mt-0.5">{comfort.feelsLike}°C</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Outdoor Work', value: comfort.outdoorWork, icon: '🏗️' },
              { label: 'Walking', value: comfort.walking, icon: '🚶' },
              { label: 'Running', value: comfort.running, icon: '🏃' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.01] border border-white/[0.03]">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-xs text-white/40">{item.label}</span>
                </div>
                <span className={`text-xs font-medium ${
                  item.value === 'Safe' || item.value === 'Recommended' || item.value === 'Comfortable' ? 'text-emerald-400' :
                  item.value === 'Moderate Risk' || item.value === 'Caution' || item.value === 'Tolerable' ? 'text-amber-400' :
                  'text-rose-400'
                }`}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Feature 4: Forecast Battle Arena */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="glass-card p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="icon-badge icon-badge-md icon-badge-rose">
              <Sword className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-display text-white">Forecast Battle Arena</h3>
              <p className="text-[10px] text-white/30 mt-0.5">Model vs model — who wins today?</p>
            </div>
          </div>

          {arena.length > 0 ? (
            <div className="space-y-2">
              {arena.map((m: ModelArenaEntry, i: number) => (
                <motion.div
                  key={m.name}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="relative group p-3.5 rounded-xl transition-all duration-300 overflow-hidden"
                  style={{
                    background: m.rank === 1 ? 'rgba(34,211,238,0.05)' : 'rgba(255,255,255,0.015)',
                    border: m.rank === 1 ? '1px solid rgba(34,211,238,0.12)' : '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  {/* Rank 1 glow */}
                  {m.rank === 1 && (
                    <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ boxShadow: '0 0 30px rgba(34,211,238,0.06)' }} />
                  )}

                  <div className="flex items-center gap-3">
                    {/* Rank badge */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                      m.rank === 1 ? 'bg-cyan/15 text-cyan border border-cyan/25' :
                      m.rank === 2 ? 'bg-white/8 text-white/50 border border-white/10' :
                      'bg-white/4 text-white/25 border border-white/6'
                    }`} style={m.rank === 1 ? { color: '#22D3EE', boxShadow: '0 0 10px rgba(34,211,238,0.2)' } : {}}>
                      {m.rank}
                    </div>

                    {/* Model name + color dot */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.color, boxShadow: `0 0 6px ${m.color}88` }} />
                      <span className={`text-sm truncate ${
                        m.rank === 1 ? 'text-white font-medium' : 'text-white/40'
                      }`}>{m.name}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-center hidden sm:block">
                        <span className="font-number text-xs text-white/40">{Math.round(m.temp)}°</span>
                      </div>
                      <div className="text-center hidden sm:block">
                        <span className="font-number text-xs text-white/40">{Math.round(m.rain)}%</span>
                      </div>
                      {/* Accuracy bar */}
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: m.rank === 1 ? '#22D3EE' : m.color, boxShadow: m.rank === 1 ? '0 0 6px rgba(34,211,238,0.5)' : 'none' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${m.accuracy}%` }}
                            transition={{ duration: 1, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </div>
                        <span className={`font-number text-xs font-bold ${
                          m.rank === 1 ? 'text-cyan' : 'text-white/30'
                        }`} style={m.rank === 1 ? { color: '#22D3EE' } : {}}>
                          {m.accuracy}%
                        </span>
                      </div>
                      {m.rank === 1 && <Zap className="w-3.5 h-3.5" style={{ color: '#22D3EE' }} />}
                    </div>
                  </div>
                </motion.div>
              ))}
              <p className="text-[10px] text-white/15 mt-4 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                Accuracy based on historical performance vs actuals in this region.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-white/20 text-sm">
              Model comparison data not available
            </div>
          )}

          {/* City Comfort Comparison */}
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-white/25" />
              <span className="text-[10px] uppercase tracking-wider text-white/25 font-medium">City Comfort Comparison</span>
            </div>
            <div className="space-y-3">
              {cityScores.map((city, i) => (
                <div key={city.name} className="flex items-center gap-3 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    i === 0 ? 'bg-cyan' : 'bg-white/10'
                  }`} style={i === 0 ? { backgroundColor: '#22D3EE', boxShadow: '0 0 6px rgba(34,211,238,0.6)' } : {}} />
                  <span className={`flex-1 ${ i === 0 ? 'text-white/70 font-medium' : 'text-white/35'}`}>{city.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: i === 0 ? '#22D3EE' : `rgba(255,255,255,0.12)`, boxShadow: i === 0 ? '0 0 5px rgba(34,211,238,0.4)' : 'none' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${city.comfortScore}%` }}
                        transition={{ duration: 1, delay: 0.05 * i }}
                      />
                    </div>
                    <span className={`font-number ${ i === 0 ? 'text-cyan font-medium' : 'text-white/35'}`}
                      style={i === 0 ? { color: '#22D3EE' } : {}}>
                      {city.comfortScore}<span className="text-white/15">/100</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
