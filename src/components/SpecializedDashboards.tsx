'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sprout, Thermometer, Droplets, Compass, Moon, Sun, 
  Car, Eye, Activity, Wind, Sunrise, Sunset, Radio, 
  Navigation, Snowflake, Waves, CloudRain, AlertTriangle
} from 'lucide-react';

interface AgricultureProps {
  data: {
    soilMoisture: number;
    soilTemp: number;
    evapotranspiration: number;
    irrigationAdvice: string;
    cropFrostRisk: string;
  };
}

export function AgricultureDashboard({ data }: AgricultureProps) {
  const isFrostRisk = data.cropFrostRisk === 'High' || data.cropFrostRisk === 'Medium';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-6 h-full flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sprout className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Agro-Meteorology</h3>
              <p className="text-xs text-white/50">Soil dynamics & irrigation science</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Live Sensors
          </span>
        </div>

        {/* Sensory Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <Droplets className="w-4 h-4 mx-auto mb-1.5 text-sky-blue" />
            <span className="block text-[10px] text-white/40 uppercase">Soil Moisture</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{data.soilMoisture}%</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <Thermometer className="w-4 h-4 mx-auto mb-1.5 text-amber-400" />
            <span className="block text-[10px] text-white/40 uppercase">Soil Temp</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{data.soilTemp}°C</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <Activity className="w-4 h-4 mx-auto mb-1.5 text-cyan" />
            <span className="block text-[10px] text-white/40 uppercase">ET Rate</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{data.evapotranspiration} mm</span>
          </div>
        </div>

        {/* Frost Risk Card */}
        <div className={`p-4 rounded-xl border mb-5 flex items-start gap-3 ${
          isFrostRisk 
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' 
            : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-300'
        }`}>
          {isFrostRisk ? (
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 animate-bounce" />
          ) : (
            <Sprout className="w-5 h-5 shrink-0 text-emerald-400" />
          )}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide">
              Crop Frost Threat Level: {data.cropFrostRisk}
            </h4>
            <p className="text-xs text-white/70 mt-1">
              {isFrostRisk 
                ? 'Critically low soil temperatures detected. Implement row covers or wind machines to prevent radiative frost damage.'
                : 'Thermal conditions remain safe for crop growth. No immediate threat of cold cell damage.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Advisory Section */}
      <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-cyan-300">
        <h4 className="text-xs font-bold uppercase tracking-wide mb-1 flex items-center gap-1.5">
          <Waves className="w-3.5 h-3.5 text-cyan" />
          Irrigation Strategy Advice
        </h4>
        <p className="text-xs text-white/80 leading-relaxed">
          {data.irrigationAdvice}
        </p>
      </div>
    </motion.div>
  );
}

interface AstronomyProps {
  data: {
    sunrise: string;
    sunset: string;
    goldenHourMorning: string;
    goldenHourEvening: string;
    blueHourMorning: string;
    blueHourEvening: string;
    moonPhase: string;
    moonPhaseIcon: string;
    moonrise: string;
    moonset: string;
    planets: { name: string; visible: boolean; time: string; magnitude: number }[];
    issTracker: { visible: boolean; passTime: string; duration: string; direction: string };
  };
}

export function AstronomyDashboard({ data }: AstronomyProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-card p-6 h-full flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Astronomy & Stargazing</h3>
              <p className="text-xs text-white/50">Luminance, orbits, and flyovers</p>
            </div>
          </div>
          <span className="text-[10px] bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Celestial Chart
          </span>
        </div>

        {/* Sunrise/Sunset/Hours */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
            <Sunrise className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] text-white/40 block">Sunrise</span>
              <span className="text-sm font-bold">{data.sunrise}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
            <Sunset className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="text-[10px] text-white/40 block">Sunset</span>
              <span className="text-sm font-bold">{data.sunset}</span>
            </div>
          </div>
        </div>

        {/* Photography Solar Hours */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5 text-xs">
            <span className="text-white/60">Golden Hours</span>
            <span className="font-medium text-amber-300">{data.goldenHourMorning} | {data.goldenHourEvening}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5 text-xs">
            <span className="text-white/60">Blue Hours</span>
            <span className="font-medium text-sky-400">{data.blueHourMorning} | {data.blueHourEvening}</span>
          </div>
        </div>

        {/* Moon details */}
        <div className="flex items-center justify-between p-3 bg-purple-900/10 border border-purple-950/25 rounded-xl mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-purple-500/20 text-purple-300">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-white/40 block">Moon Phase</span>
              <span className="text-xs font-semibold text-white">{data.moonPhase}</span>
            </div>
          </div>
          <div className="text-right text-[10px] text-white/50">
            <div>Rise: {data.moonrise}</div>
            <div>Set: {data.moonset}</div>
          </div>
        </div>

        {/* Planets tracker */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Planet Visibility Today</h4>
          <div className="grid grid-cols-3 gap-2">
            {data.planets.map((p) => (
              <div key={p.name} className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                <span className="text-xs font-bold block text-white">{p.name}</span>
                <span className={`text-[10px] font-semibold ${p.visible ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {p.visible ? 'Visible' : 'Hidden'}
                </span>
                <span className="text-[8px] text-white/40 block mt-0.5">{p.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ISS Tracker */}
      <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-between text-xs mt-5">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
          <div>
            <span className="font-semibold text-purple-300 block">Space Station (ISS)</span>
            <span className="text-[10px] text-white/50">
              {data.issTracker.visible ? `Visible for ${data.issTracker.duration}` : 'No visible passes today'}
            </span>
          </div>
        </div>
        {data.issTracker.visible && (
          <div className="text-right">
            <span className="font-bold text-white block">{data.issTracker.passTime}</span>
            <span className="text-[9px] text-purple-300">{data.issTracker.direction}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface TravelProps {
  data: {
    hikingScore: number;
    beachScore: number;
    drivingScore: number;
    sailingScore: number;
    skiScore: number;
  };
}

export function TravelDashboard({ data }: TravelProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25';
    if (score >= 5) return 'text-amber-400 bg-amber-500/10 border-amber-500/25';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/25';
  };

  const getAdvice = () => {
    const scores = [
      { name: 'Hiking', val: data.hikingScore },
      { name: 'Beach', val: data.beachScore },
      { name: 'Driving', val: data.drivingScore },
      { name: 'Sailing', val: data.sailingScore },
      { name: 'Skiing', val: data.skiScore }
    ];
    const sorted = [...scores].sort((a, b) => b.val - a.val);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    if (best.val >= 8) {
      return `Outstanding weather for ${best.name.toLowerCase()}! Ideal meteorology makes this the peak recommendation for outdoor plans today.`;
    }
    if (worst.val <= 3) {
      return `Caution: Outdoor ${worst.name.toLowerCase()} is highly discouraged due to active environmental barriers (winds, heavy rains, or poor visibility).`;
    }
    return 'Weather conditions are stable and moderate across most categories. Plan standard outdoor routes normally.';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-card p-6 h-full flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-blue/10 border border-sky-blue/20 text-sky-blue">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Travel & Recreation</h3>
              <p className="text-xs text-white/50">Suitability indices for sports & travel</p>
            </div>
          </div>
          <span className="text-[10px] bg-sky-blue/20 border border-sky-blue/30 text-sky-blue font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Recreational
          </span>
        </div>

        {/* Scores Stack */}
        <div className="space-y-3.5 mb-6">
          {[
            { name: 'Hiking & Trails', score: data.hikingScore, icon: FootprintsIcon },
            { name: 'Beach & Swimming', score: data.beachScore, icon: Sun },
            { name: 'Driving & Roadtrip', score: data.drivingScore, icon: Car },
            { name: 'Sailing & Water sports', score: data.sailingScore, icon: Waves },
            { name: 'Ski & Winter sports', score: data.skiScore, icon: Snowflake }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-md bg-white/5 border border-white/5 text-white/60">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-white/95">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Progress bar */}
                  <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.score >= 8 ? 'bg-emerald-500' : item.score >= 5 ? 'bg-amber-400' : 'bg-rose-500'
                      }`}
                      style={{ width: `${item.score * 10}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border min-w-8 text-center ${getScoreColor(item.score)}`}>
                    {item.score}/10
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Travel Summary Alert */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-3 text-xs leading-relaxed text-white/80">
        <Wind className="w-5 h-5 text-sky-blue shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-white mb-0.5">Tactical Recreation Advice</h4>
          <p>{getAdvice()}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Custom simple icons for missing ones
function FootprintsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 16v-2.38C4 11.5 5.88 9.85 6 7c.12-2.85-2-5-2-5S2 4.15 2 7c0 2.85 2 4.5 2 6.62V16" />
      <path d="M20 16v-2.38c0-2.12-1.88-3.77-2-6.62-.12-2.85 2-5 2-5s2 2.15 2 5c0 2.85-2 4.5-2 6.62V16" />
      <path d="M12 20v-2.38c0-2.12-1.88-3.77-2-6.62-.12-2.85 2-5 2-5s2 2.15 2 5c0 2.85-2 4.5-2 6.62V20" />
    </svg>
  );
}
