'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Database, Activity, Globe, RefreshCw, AlertTriangle,
  CheckCircle, XCircle, Clock, ArrowUpRight, ArrowDownRight,
  BarChart3, Target, Zap, Shield,
} from 'lucide-react';

interface Source {
  _id: string;
  key: string;
  name: string;
  type: string;
  provider: string;
  region: string;
  description: string;
  resolution: string;
  updateFreq: string;
  accuracy: number;
  reportsCount: number;
  status: string;
  lastAccuracyUpdate: string;
}

interface AccuracyReport {
  _id: string;
  sourceKey: string;
  sourceName: string;
  overallAccuracy: number;
  tempAccuracy: number;
  rainAccuracy: number;
  windAccuracy: number;
  date: string;
}

const typeLabels: Record<string, string> = {
  global_model: 'Global Model',
  regional_model: 'Regional Model',
  ensemble: 'Ensemble',
  satellite: 'Satellite',
  station: 'Station',
  reanalysis: 'Reanalysis',
};

const regionLabels: Record<string, string> = {
  global: 'Global',
  north_america: 'North America',
  europe: 'Europe',
  asia: 'Asia',
  australia: 'Australia',
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.3, delay: i * 0.04 } }),
};

export default function SourcesPanel() {
  const [sources, setSources] = useState<Source[]>([]);
  const [reports, setReports] = useState<AccuracyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [activeReport, setActiveReport] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [srcRes, repRes] = await Promise.all([
        fetch('/api/sources'),
        fetch('/api/sources/accuracy'),
      ]);
      if (srcRes.ok) {
        const srcData = await srcRes.json();
        setSources(srcData.sources || []);
      }
      if (repRes.ok) {
        const repData = await repRes.json();
        setReports(repData.reports || []);
      }
    } catch (err) {
      console.error('Failed to fetch sources data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/sources/seed', { method: 'POST' });
      const data = await res.json();
      await fetchData();
    } finally {
      setSeeding(false);
    }
  };

  const bestModel = sources.length > 0
    ? sources.reduce((best, s) => (s.accuracy > best.accuracy ? s : best), sources[0])
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-cyan/10 border border-cyan/20">
              <Database className="w-6 h-6 text-cyan" />
            </div>
            <div>
              <h2 className="text-xl font-heading text-white">Weather Source Registry</h2>
              <p className="text-sm text-white/40 mt-1">
                {sources.length > 0
                  ? `${sources.length} sources tracked · Best: ${bestModel?.name} (${bestModel?.accuracy}%)`
                  : 'No sources loaded'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSeed}
              disabled={seeding || sources.length > 0}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/10 disabled:opacity-30 transition-all"
            >
              {seeding ? 'Seeding...' : sources.length > 0 ? `${sources.length} loaded` : 'Seed sources'}
            </button>
            <button
              onClick={fetchData}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white/70 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sources List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-heading text-white/60 uppercase tracking-wider px-1">Active Models</h3>
          {loading ? (
            <div className="glass-card p-12 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 animate-spin text-white/20" />
            </div>
          ) : sources.length === 0 ? (
            <div className="glass-card p-12 text-center space-y-3">
              <Database className="w-8 h-8 mx-auto text-white/20" />
              <p className="text-white/30 text-sm">No sources in database</p>
              <button onClick={handleSeed} className="text-xs text-cyan hover:text-cyan/80 transition-colors">
                Seed with default models
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sources.map((source, i) => (
                <motion.div
                  key={source.key}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="glass-card p-5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        source.accuracy >= 90 ? 'bg-emerald-500/10 text-emerald-400' :
                        source.accuracy >= 80 ? 'bg-cyan/10 text-cyan' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        <Globe className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white truncate">{source.name}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            source.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                            source.status === 'degraded' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-rose-500/10 text-rose-400'
                          }`}>{source.status}</span>
                        </div>
                        <p className="text-xs text-white/30 mt-0.5 truncate">{source.description}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-white/20">
                          <span>{typeLabels[source.type] || source.type}</span>
                          <span>·</span>
                          <span>{regionLabels[source.region] || source.region}</span>
                          <span>·</span>
                          <span>{source.resolution}</span>
                          <span>·</span>
                          <span>{source.updateFreq}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-number ${
                          source.accuracy >= 90 ? 'text-emerald-400' :
                          source.accuracy >= 80 ? 'text-cyan' :
                          'text-amber-400'
                        }`}>{source.accuracy}%</span>
                        <button
                          onClick={() => setActiveReport(activeReport === source.key ? null : source.key)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/30 hover:text-white/60 transition-all"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-white/20 mt-0.5">{source.reportsCount} reports</p>
                    </div>
                  </div>

                  {/* Accuracy History */}
                  {activeReport === source.key && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 pt-4 border-t border-white/[0.03]"
                    >
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Temp', key: 'tempAccuracy' as const },
                          { label: 'Rain', key: 'rainAccuracy' as const },
                          { label: 'Wind', key: 'windAccuracy' as const },
                        ].map((m) => {
                          const sourceReports = reports.filter(r => r.sourceKey === source.key);
                          const latest = sourceReports[0];
                          const val = latest ? latest[m.key] : source.accuracy;
                          return (
                            <div key={m.label} className="p-3 rounded-xl bg-white/[0.01] border border-white/[0.03] text-center">
                              <p className="text-[10px] text-white/20 uppercase tracking-wider">{m.label}</p>
                              <p className="text-lg font-number text-white mt-1">{Math.round(val)}%</p>
                            </div>
                          );
                        })}
                      </div>
                      {reports.filter(r => r.sourceKey === source.key).length > 0 && (
                        <p className="text-[10px] text-white/15 mt-3">
                          Last report: {new Date(reports.filter(r => r.sourceKey === source.key)[0]?.date).toLocaleDateString()}
                        </p>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-heading text-white/60 uppercase tracking-wider px-1">Registry Summary</h3>
          <div className="glass-card p-6 space-y-5">
            <div className="text-center pb-5 border-b border-white/[0.03]">
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Total Sources</p>
              <p className="text-4xl font-number text-white mt-2">{sources.length}</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Global Models', count: sources.filter(s => s.type === 'global_model').length, color: 'text-cyan' },
                { label: 'Regional Models', count: sources.filter(s => s.type === 'regional_model').length, color: 'text-emerald-400' },
                { label: 'Ensembles', count: sources.filter(s => s.type === 'ensemble').length, color: 'text-purple-400' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-white/40">{item.label}</span>
                  <span className={`font-number ${item.color}`}>{item.count}</span>
                </div>
              ))}
            </div>
            <div className="pt-5 border-t border-white/[0.03] space-y-3">
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Top Performer</p>
              {bestModel ? (
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{bestModel.name}</p>
                      <p className="text-[10px] text-white/30">{bestModel.provider}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-lg font-number text-emerald-400">{bestModel.accuracy}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white/20">No data</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
