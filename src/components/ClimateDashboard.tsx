'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { getClimateProfile, ClimateProfile } from '../utils/climateClassifier';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Globe, AlertTriangle, ArrowUpRight, ArrowDownRight, 
  Activity, Info, Compass, Flame, ShieldAlert, Thermometer, CloudRain
} from 'lucide-react';

interface ClimateDashboardProps {
  lat: number;
  lon: number;
}

export default function ClimateDashboard({ lat, lon }: ClimateDashboardProps) {
  const profile = getClimateProfile(lat, lon);

  // Format data for Recharts
  const chartData = profile.monthlyAverages;

  const getRiskColor = (risk: 'Low' | 'Medium' | 'High') => {
    if (risk === 'High') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (risk === 'Medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  };

  const getAnomalyColor = (val: number) => {
    if (val > 0) return 'text-rose-400';
    if (val < 0) return 'text-sky-blue';
    return 'text-white/60';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Köppen Header Card */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan">
              <Globe className="w-6 h-6 animate-spin" style={{ animationDuration: '30s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-cyan tracking-wider">{profile.koppenCode}</span>
                <span className="text-lg font-bold text-white">— {profile.koppenName}</span>
              </div>
              <p className="text-xs text-white/50">Köppen-Geiger Climate Classification • Zone: {profile.zone}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-right">
              <span className="text-white/40 block uppercase text-[10px]">ENSO Status</span>
              <span className="font-bold text-cyan mt-0.5 block">{profile.ensoStatus}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-right">
              <span className="text-white/40 block uppercase text-[10px]">Annual Precip Norm</span>
              <span className="font-bold text-white mt-0.5 block">{profile.annualPrecipitation} mm</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-white/80 leading-relaxed bg-white/[0.02] border border-white/5 p-4 rounded-xl">
          {profile.description}
        </p>
      </div>

      {/* Grid: Climatology Chart & Anomalies / Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monthly Climatology Chart */}
        <div className="glass-card p-6 lg:col-span-8 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Climatology Averages (Historical)</h3>
            <p className="text-xs text-white/40 mb-6">30-Year Base Normal normals for temperature and precipitation</p>
          </div>
          
          <div className="h-[280px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 10, bottom: 0, left: -15 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255, 255, 255, 0.4)" 
                  tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 11 }}
                />
                <YAxis 
                  yAxisId="left" 
                  stroke="rgba(0, 212, 255, 0.4)" 
                  tick={{ fill: '#00D4FF', fontSize: 11 }}
                  unit="°C"
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="rgba(63, 169, 245, 0.4)" 
                  tick={{ fill: '#3FA9F5', fontSize: 11 }}
                  unit="mm"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(8, 27, 51, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: 12
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }} />
                <Bar 
                  yAxisId="right" 
                  dataKey="precip" 
                  name="Precipitation" 
                  fill="#3FA9F5" 
                  opacity={0.35} 
                  radius={[4, 4, 0, 0]} 
                />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="temp" 
                  name="Temperature" 
                  stroke="#00D4FF" 
                  strokeWidth={3} 
                  dot={{ r: 3, fill: '#00D4FF' }} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Climate Risks & Trends */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Anomalies Card */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan" />
              Climate Anomalies
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <span className="text-[10px] text-white/40 block uppercase">Temp Anomaly</span>
                  <span className={`text-base font-extrabold flex items-center gap-1 mt-0.5 ${getAnomalyColor(profile.tempAnomaly)}`}>
                    {profile.tempAnomaly >= 0 ? '+' : ''}{profile.tempAnomaly}°C
                    {profile.tempAnomaly >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/10">
                  <Thermometer className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <span className="text-[10px] text-white/40 block uppercase">Precip Anomaly</span>
                  <span className={`text-base font-extrabold flex items-center gap-1 mt-0.5 ${getAnomalyColor(profile.precipAnomaly)}`}>
                    {profile.precipAnomaly >= 0 ? '+' : ''}{profile.precipAnomaly}%
                    {profile.precipAnomaly >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-sky-blue/10 text-sky-blue border border-sky-blue/10">
                  <CloudRain className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="glass-card p-6 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Environmental Risks
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Heatwave Risk', risk: profile.heatwaveRisk },
                  { name: 'Coldwave Risk', risk: profile.coldwaveRisk },
                  { name: 'Drought Risk', risk: profile.droughtRisk },
                  { name: 'Flooding Risk', risk: profile.floodRisk }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                    <span className="block text-[10px] text-white/40 uppercase mb-1">{item.name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border inline-block ${getRiskColor(item.risk)}`}>
                      {item.risk}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Info label */}
            <div className="mt-4 p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-lg text-[11px] leading-relaxed text-cyan-300/90 flex gap-2">
              <Info className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
              <span>Risks are estimated based on local Köppen classifications and decadal anomaly spreads.</span>
            </div>
          </div>

        </div>

      </div>

      {/* Climate Trends Text Card */}
      <div className="glass-card p-5 bg-gradient-to-r from-cyan-500/5 to-sky-blue/5 border-cyan-500/15">
        <h4 className="text-xs font-extrabold text-cyan uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
          <Activity className="w-4 h-4" />
          Climate Trend Projection
        </h4>
        <p className="text-xs text-white/80 leading-relaxed">
          {profile.climateTrend}
        </p>
      </div>
    </motion.div>
  );
}
