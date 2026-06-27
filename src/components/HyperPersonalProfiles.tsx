'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Book, Plane, Navigation, Sprout, Bike, Camera, Zap, HardHat,
  Footprints, Umbrella, Sun, Heart, Eye, Thermometer, Map, Compass,
  Cloud, CloudRain, Droplets, Snowflake, Waves, Wind, Sunrise, Sunset,
  Activity, AlertTriangle, Gauge, Ruler, Clock, Star, Search,
  Shield, Signal, Target, Leaf, Trees, Luggage
} from 'lucide-react';

interface HyperPersonalProfilesProps {
  current: any;
  hourlyForecast: any[];
  dailyForecast: any[];
  astronomy: any;
  agriculture: any;
}

type ProfileMode = 'student' | 'traveler' | 'pilot' | 'farmer' | 'cyclist' | 'photographer' | 'athlete' | 'construction';

interface ProfileConfig {
  id: ProfileMode;
  label: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
}

const PROFILES: ProfileConfig[] = [
  { id: 'student', label: 'Student', description: 'Campus & commute weather', icon: Book, color: '#6366f1', bgColor: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.2)' },
  { id: 'traveler', label: 'Traveler', description: 'Trip & flight conditions', icon: Plane, color: '#06b6d4', bgColor: 'rgba(6,182,212,0.1)', borderColor: 'rgba(6,182,212,0.2)' },
  { id: 'pilot', label: 'Pilot', description: 'Aviation-grade weather', icon: Navigation, color: '#0ea5e9', bgColor: 'rgba(14,165,233,0.1)', borderColor: 'rgba(14,165,233,0.2)' },
  { id: 'farmer', label: 'Farmer', description: 'Soil & crop meteorology', icon: Sprout, color: '#22c55e', bgColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.2)' },
  { id: 'cyclist', label: 'Cyclist', description: 'Bike-optimized routes', icon: Bike, color: '#f97316', bgColor: 'rgba(249,115,22,0.1)', borderColor: 'rgba(249,115,22,0.2)' },
  { id: 'photographer', label: 'Photographer', description: 'Sunlight & framing', icon: Camera, color: '#a855f7', bgColor: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.2)' },
  { id: 'athlete', label: 'Athlete', description: 'Performance conditioning', icon: Zap, color: '#f43f5e', bgColor: 'rgba(244,63,94,0.1)', borderColor: 'rgba(244,63,94,0.2)' },
  { id: 'construction', label: 'Construction', description: 'Jobsite safety hazards', icon: HardHat, color: '#eab308', bgColor: 'rgba(234,179,8,0.1)', borderColor: 'rgba(234,179,8,0.2)' },
];

function getWindDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function computeHeatIndex(temp: number, humidity: number): number {
  if (temp < 27) return temp;
  return -8.7847 + 1.6114 * temp + 2.3385 * humidity - 0.1461 * temp * humidity
    - 0.0123 * temp * temp - 0.0164 * humidity * humidity
    + 0.0022 * temp * temp * humidity + 0.0007 * temp * humidity * humidity
    - 0.000001 * temp * temp * humidity * humidity;
}

function safeVal(val: any, fallback: number): number {
  return val != null && !isNaN(Number(val)) ? Number(val) : fallback;
}

function ProfileCard({ config, active, onClick }: { config: ProfileConfig; active: boolean; onClick: () => void }) {
  const Icon = config.icon;
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 min-w-fit"
      style={{
        background: active ? config.bgColor : 'rgba(255,255,255,0.02)',
        border: `1px solid ${active ? config.borderColor : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      <div className="p-2 rounded-lg" style={{ background: `${config.color}15`, border: `1px solid ${config.borderColor}` }}>
        <Icon className="w-4 h-4" style={{ color: config.color }} strokeWidth={1.5} />
      </div>
      <div className="text-left">
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600, color: active ? '#e4e4e7' : '#71717a' }}>
          {config.label}
        </span>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#52525b', marginTop: 1 }}>
          {config.description}
        </p>
      </div>
      {active && <div className="w-1.5 h-1.5 rounded-full ml-auto" style={{ background: config.color }} />}
    </motion.button>
  );
}

function MetricCard({ icon: Icon, label, value, unit, color, subtitle }: { icon: any; label: string; value: string | number; unit?: string; color: string; subtitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl flex flex-col"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5" style={{ color }} strokeWidth={1.5} />
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#71717a' }}>{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 700, color: '#e4e4e7', lineHeight: 1 }}>
          {value}
        </span>
        {unit && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#52525b', fontWeight: 500 }}>{unit}</span>}
      </div>
      {subtitle && (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#3f3f46', marginTop: 4, lineHeight: 1.3 }}>{subtitle}</p>
      )}
    </motion.div>
  );
}

function InsightBanner({ color, icon: Icon, title, children }: { color: string; icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl flex items-start gap-3 text-xs leading-relaxed" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color }} strokeWidth={1.5} />
      <div>
        <h4 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#e4e4e7', marginBottom: 2, fontSize: 11 }}>{title}</h4>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#a1a1aa', lineHeight: 1.5 }}>{children}</p>
      </div>
    </div>
  );
}

function StudentDashboard({ current, hourlyForecast, dailyForecast }: { current: any; hourlyForecast: any[]; dailyForecast: any[] }) {
  const rainChance = safeVal(dailyForecast?.[0]?.rainChance || dailyForecast?.[0]?.pop, 10);
  const uv = safeVal(current?.uvIndex, 3);
  const temp = safeVal(current?.temp, 22);
  const humidity = safeVal(current?.humidity, 50);
  const walkingScore = Math.round(Math.max(0, Math.min(100,
    90
    - (rainChance > 50 ? 30 : rainChance > 20 ? 15 : 0)
    - (uv > 7 ? 20 : uv > 4 ? 10 : 0)
    - (temp > 38 ? 35 : temp > 32 ? 20 : temp < 0 ? 25 : temp < 10 ? 10 : 0)
  )));
  const comfortScore = Math.round(Math.max(0, Math.min(100,
    100
    - Math.abs(temp - 22) * 2
    - Math.abs(humidity - 45) * 0.5
    - (uv > 6 ? 15 : 0)
  )));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={Footprints} label="Walking Score" value={walkingScore} unit="/100" color="#6366f1" subtitle={walkingScore >= 70 ? 'Great for walking to class' : walkingScore >= 40 ? 'Consider indoor routes' : 'Uncomfortable walking conditions'} />
        <MetricCard icon={Umbrella} label="Rain Chance" value={rainChance} unit="%" color="#60a5fa" subtitle={rainChance > 50 ? 'Bring an umbrella!' : rainChance > 20 ? 'Light rain possible' : 'No rain expected'} />
        <MetricCard icon={Sun} label="UV Index" value={uv} unit={uv >= 8 ? 'Extreme' : uv >= 6 ? 'High' : uv >= 3 ? 'Moderate' : 'Low'} color="#f97316" subtitle={uv >= 6 ? 'Wear sunscreen' : 'Safe exposure'} />
        <MetricCard icon={Heart} label="Comfort Score" value={comfortScore} unit="/100" color="#22c55e" subtitle={comfortScore >= 75 ? 'Perfect for outdoor study' : comfortScore >= 50 ? 'Moderately comfortable' : 'Stay indoors'} />
      </div>
      <InsightBanner color="#6366f1" icon={Book} title="Campus Advice">
        {walkingScore >= 70
          ? 'Ideal conditions for walking between classes. Light jacket recommended.'
          : walkingScore >= 40
            ? 'Conditions are fair but check the radar before heading out without protection.'
            : 'Consider indoor transit options or wait for conditions to improve before commute.'}
      </InsightBanner>
    </div>
  );
}

function TravelerDashboard({ current, dailyForecast, astronomy }: { current: any; dailyForecast: any[]; astronomy: any }) {
  const windSpeed = safeVal(current?.windSpeed, 10);
  const visibility = safeVal(current?.visibility, 10);
  const temp = safeVal(current?.temp, 22);
  const rainChance = safeVal(dailyForecast?.[0]?.rainChance || dailyForecast?.[0]?.pop, 10);
  const turbulenceRisk = windSpeed > 40 ? 'Severe' : windSpeed > 25 ? 'High' : windSpeed > 15 ? 'Moderate' : 'Low';
  const turbulenceColor = turbulenceRisk === 'Low' ? '#22c55e' : turbulenceRisk === 'Moderate' ? '#f97316' : '#ef4444';
  const destComfort = temp > 35 ? 'Uncomfortable' : temp > 28 ? 'Warm' : temp > 15 ? 'Pleasant' : temp > 5 ? 'Cool' : 'Cold';
  const destColor = destComfort === 'Pleasant' ? '#22c55e' : destComfort === 'Warm' || destComfort === 'Cool' ? '#f97316' : '#ef4444';

  let packingAdvice = 'Pack light layers and a versatile wardrobe.';
  if (temp > 30) packingAdvice = 'Pack lightweight breathable fabrics, sunscreen, sunglasses, and a hat. Stay hydrated.';
  else if (temp < 5) packingAdvice = 'Pack heavy winter coat, thermal layers, gloves, scarf, and insulated boots.';
  else if (rainChance > 40) packingAdvice = 'Bring a waterproof jacket, umbrella, and quick-dry clothing. Pack a travel umbrella.';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={Compass} label="Flight Turbulence" value={turbulenceRisk} color={turbulenceColor} subtitle={turbulenceRisk === 'Low' ? 'Smooth flight expected' : turbulenceRisk === 'Moderate' ? 'Some bumps possible' : 'Prepare for rough air'} />
        <MetricCard icon={Eye} label="Airport Visibility" value={visibility} unit="km" color="#0ea5e9" subtitle={visibility > 8 ? 'Clear conditions' : visibility > 4 ? 'Moderate visibility' : 'Low visibility delays possible'} />
        <MetricCard icon={Thermometer} label="Destination Comfort" value={destComfort} color={destColor} subtitle={`Feels like ${Math.round(temp)}°C at destination`} />
        <MetricCard icon={Map} label="Rain at Destination" value={rainChance} unit="%" color="#60a5fa" subtitle={rainChance > 50 ? 'Pack rain gear' : rainChance > 20 ? 'Light showers possible' : 'Dry conditions'} />
      </div>
      <InsightBanner color="#06b6d4" icon={Luggage} title="Packing Advice">
        {packingAdvice}
      </InsightBanner>
    </div>
  );
}

function PilotDashboard({ current }: { current: any }) {
  const windSpeed = safeVal(current?.windSpeed, 8);
  const windDeg = safeVal(current?.windDirection ?? current?.windDeg, 180);
  const visibility = safeVal(current?.visibility, 10);
  const clouds = safeVal(current?.clouds ?? current?.cloudCover, 20);
  const ceiling = clouds > 80 ? 'Low' : clouds > 50 ? 'Moderate' : clouds > 20 ? 'High' : 'Unlimited';
  const ceilingColor = ceiling === 'Unlimited' ? '#22c55e' : ceiling === 'High' ? '#06b6d4' : ceiling === 'Moderate' ? '#f97316' : '#ef4444';
  const crosswind = Math.round(windSpeed * Math.abs(Math.sin((windDeg - 90) * Math.PI / 180)) * 10) / 10;
  const crosswindRisk = crosswind > 20 ? 'Severe' : crosswind > 12 ? 'High' : crosswind > 5 ? 'Moderate' : 'Low';
  const crosswindColor = crosswindRisk === 'Low' ? '#22c55e' : crosswindRisk === 'Moderate' ? '#f97316' : '#ef4444';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={Wind} label="Wind" value={`${windSpeed} km/h ${getWindDirection(windDeg)}`} color="#0ea5e9" subtitle={`Gusts up to ${safeVal(current?.windGust, windSpeed + 5)} km/h`} />
        <MetricCard icon={Eye} label="Visibility" value={visibility} unit="km" color="#06b6d4" subtitle={visibility > 8 ? 'VFR conditions' : visibility > 5 ? 'MVFR' : 'IFR conditions'} />
        <MetricCard icon={Target} label="Cloud Ceiling" value={ceiling} color={ceilingColor} subtitle={`Cloud cover at ${clouds}%`} />
        <MetricCard icon={Gauge} label="Crosswind" value={`${crosswind} km/h`} color={crosswindColor} subtitle={`Risk level: ${crosswindRisk}`} />
      </div>
      <InsightBanner color="#0ea5e9" icon={Navigation} title="Pilot Briefing">
        {visibility < 5 || ceiling === 'Low'
          ? 'Low IFR conditions reported. Check NOTAMs and consider instrument approach procedures.'
          : crosswind > 12
            ? 'Significant crosswind component. Review crosswind landing technique and consider alternative runways.'
            : 'VFR conditions prevail. Visual approaches recommended. No significant weather advisories.'}
      </InsightBanner>
    </div>
  );
}

function FarmerDashboard({ agriculture }: { agriculture: any }) {
  const soilMoisture = safeVal(agriculture?.soilMoisture, 45);
  const evapotranspiration = safeVal(agriculture?.evapotranspiration, 3.5);
  const frostRisk = agriculture?.cropFrostRisk || 'Low';
  const irrigationAdvice = agriculture?.irrigationAdvice || 'Monitor soil conditions regularly.';
  const frostColor = frostRisk === 'High' ? '#ef4444' : frostRisk === 'Medium' ? '#f97316' : '#22c55e';
  const soilColor = soilMoisture > 70 ? '#60a5fa' : soilMoisture > 40 ? '#22c55e' : '#f97316';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={Droplets} label="Soil Moisture" value={soilMoisture} unit="%" color={soilColor} subtitle={soilMoisture > 70 ? 'Saturated – delay irrigation' : soilMoisture > 40 ? 'Adequate moisture levels' : 'Dry – irrigation needed'} />
        <MetricCard icon={Activity} label="Evapotranspiration" value={evapotranspiration} unit="mm/day" color="#06b6d4" subtitle={evapotranspiration > 5 ? 'High water loss' : evapotranspiration > 2 ? 'Moderate rate' : 'Low evaporation rate'} />
        <MetricCard icon={Snowflake} label="Frost Risk" value={frostRisk} color={frostColor} subtitle={frostRisk === 'High' ? 'Protect vulnerable crops tonight' : frostRisk === 'Medium' ? 'Monitor temperatures overnight' : 'No frost threat'} />
        <MetricCard icon={Thermometer} label="Soil Temp" value={safeVal(agriculture?.soilTemp, 18)} unit="°C" color="#f97316" subtitle={safeVal(agriculture?.soilTemp, 18) > 20 ? 'Good for planting' : 'Below optimal for germination'} />
      </div>
      <InsightBanner color="#22c55e" icon={Sprout} title="Irrigation Strategy">
        {irrigationAdvice}
      </InsightBanner>
    </div>
  );
}

function CyclistDashboard({ current, dailyForecast }: { current: any; dailyForecast: any[] }) {
  const windSpeed = safeVal(current?.windSpeed, 10);
  const rainChance = safeVal(dailyForecast?.[0]?.rainChance || dailyForecast?.[0]?.pop, 10);
  const temp = safeVal(current?.temp, 20);
  const roadTemp = Math.round(temp + (safeVal(current?.isDay ?? 1, 1) ? 8 : -2));
  const cyclingScore = Math.round(Math.max(0, Math.min(100,
    100
    - (windSpeed > 30 ? 40 : windSpeed > 20 ? 25 : windSpeed > 12 ? 12 : 0)
    - (rainChance > 50 ? 35 : rainChance > 20 ? 15 : 0)
    - (temp > 38 ? 40 : temp > 32 ? 25 : temp < 0 ? 35 : temp < 10 ? 15 : 0)
  )));
  const scoreColor = cyclingScore >= 70 ? '#22c55e' : cyclingScore >= 40 ? '#f97316' : '#ef4444';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={Wind} label="Wind Speed" value={windSpeed} unit="km/h" color="#0ea5e9" subtitle={windSpeed > 20 ? 'Strong headwinds on open roads' : windSpeed > 10 ? 'Moderate breeze' : 'Light winds'} />
        <MetricCard icon={Umbrella} label="Rain Chance" value={rainChance} unit="%" color="#60a5fa" subtitle={rainChance > 50 ? 'Wet roads – reduce speed' : rainChance > 20 ? 'Light drizzle possible' : 'Dry ride'} />
        <MetricCard icon={Thermometer} label="Road Surface" value={roadTemp} unit="°C" color="#f97316" subtitle={roadTemp > 40 ? 'Hot tarmac – tire pressure check' : roadTemp < 2 ? 'Icy patches possible' : 'Safe road temps'} />
        <MetricCard icon={Heart} label="Cycling Score" value={cyclingScore} unit="/100" color={scoreColor} subtitle={cyclingScore >= 70 ? 'Perfect day for a ride!' : cyclingScore >= 40 ? 'Rideable with caution' : 'Consider indoor training'} />
      </div>
      <InsightBanner color="#f97316" icon={Bike} title="Route Recommendation">
        {cyclingScore >= 70
          ? 'Optimal cycling conditions. Ideal for long-distance routes. Pack light layers.'
          : cyclingScore >= 40
            ? 'Acceptable conditions for short to medium rides. Use fenders if rain expected. Wear high-vis gear.'
            : 'Adverse conditions – consider indoor trainer or rest day. High winds or extreme temps make cycling unsafe.'}
      </InsightBanner>
    </div>
  );
}

function PhotographerDashboard({ current, astronomy }: { current: any; astronomy: any }) {
  const clouds = safeVal(current?.clouds ?? current?.cloudCover, 30);
  const visibility = safeVal(current?.visibility, 10);
  const goldenHourMorning = astronomy?.goldenHourMorning || '06:30 – 07:15';
  const goldenHourEvening = astronomy?.goldenHourEvening || '18:45 – 19:30';
  const sunsetQuality = clouds < 20 ? 'Excellent' : clouds < 50 ? 'Good' : clouds < 75 ? 'Fair' : 'Poor';
  const sunsetColor = sunsetQuality === 'Excellent' ? '#22c55e' : sunsetQuality === 'Good' ? '#06b6d4' : sunsetQuality === 'Fair' ? '#f97316' : '#ef4444';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={Clock} label="Golden Hour AM" value={goldenHourMorning} color="#f97316" subtitle="Morning golden light window" />
        <MetricCard icon={Clock} label="Golden Hour PM" value={goldenHourEvening} color="#eab308" subtitle="Evening golden light window" />
        <MetricCard icon={Cloud} label="Cloud Cover" value={clouds} unit="%" color="#71717a" subtitle={clouds < 30 ? 'Clear skies – vibrant colors' : clouds < 60 ? 'Some texture in sky' : 'Overcast – diffused light'} />
        <MetricCard icon={Star} label="Sunset Quality" value={sunsetQuality} color={sunsetColor} subtitle={sunsetQuality === 'Excellent' ? 'Vibrant sunset expected' : sunsetQuality === 'Poor' ? 'Clouds may block view' : 'Decent conditions'} />
      </div>
      <InsightBanner color="#a855f7" icon={Camera} title="Photo Planning">
        {sunsetQuality === 'Excellent'
          ? `Prime conditions for landscape photography. Golden hour starts at ${goldenHourEvening}. Use graduated ND filters for dynamic range.`
          : sunsetQuality === 'Good'
            ? `Moderate cloud cover adds texture. ${goldenHourEvening} is the optimal window. Consider long exposure if wind is calm.`
            : 'Overcast skies limit golden hour quality. Consider macro, portrait, or street photography instead. Diffusion is excellent for close-ups.'}
      </InsightBanner>
    </div>
  );
}

function AthleteDashboard({ current }: { current: any }) {
  const temp = safeVal(current?.temp, 22);
  const humidity = safeVal(current?.humidity, 50);
  const uv = safeVal(current?.uvIndex, 4);
  const heatIndex = Math.round(computeHeatIndex(temp, humidity));
  const heatColor = heatIndex > 40 ? '#ef4444' : heatIndex > 32 ? '#f97316' : heatIndex > 26 ? '#eab308' : '#22c55e';
  const runningScore = Math.round(Math.max(0, Math.min(100,
    100
    - (heatIndex > 40 ? 50 : heatIndex > 32 ? 30 : heatIndex > 26 ? 15 : 0)
    - (uv > 8 ? 20 : uv > 5 ? 10 : 0)
    - (temp < 0 ? 30 : temp < 5 ? 15 : 0)
  )));
  const hydrationNeed = heatIndex > 38 ? 'Critical' : heatIndex > 30 ? 'High' : heatIndex > 25 ? 'Moderate' : 'Low';
  const hydrationColor = hydrationNeed === 'Critical' ? '#ef4444' : hydrationNeed === 'High' ? '#f97316' : hydrationNeed === 'Moderate' ? '#eab308' : '#22c55e';
  const uvRisk = uv >= 8 ? 'Extreme' : uv >= 6 ? 'High' : uv >= 3 ? 'Moderate' : 'Low';
  const uvColor = uvRisk === 'Extreme' ? '#ef4444' : uvRisk === 'High' ? '#f97316' : uvRisk === 'Moderate' ? '#eab308' : '#22c55e';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={Thermometer} label="Heat Index" value={`${heatIndex}°C`} color={heatColor} subtitle={heatIndex > 32 ? 'Risk of heat exhaustion' : heatIndex > 26 ? 'Warm – pace yourself' : 'Safe for exertion'} />
        <MetricCard icon={Activity} label="Running Score" value={runningScore} unit="/100" color={runningScore >= 70 ? '#22c55e' : runningScore >= 40 ? '#f97316' : '#ef4444'} subtitle={runningScore >= 70 ? 'Ideal for outdoor runs' : runningScore >= 40 ? 'Run with precautions' : 'Consider indoor training'} />
        <MetricCard icon={Droplets} label="Hydration Need" value={hydrationNeed} color={hydrationColor} subtitle={hydrationNeed === 'Critical' ? '3-4L water recommended' : hydrationNeed === 'High' ? '2-3L recommended' : hydrationNeed === 'Moderate' ? '1-2L sufficient' : 'Normal intake fine'} />
        <MetricCard icon={Sun} label="UV Exposure Risk" value={uvRisk} color={uvColor} subtitle={uv >= 6 ? 'SPF 50+ required, avoid peak hours' : 'Standard protection advised'} />
      </div>
      <InsightBanner color="#f43f5e" icon={Zap} title="Performance Advisory">
        {runningScore >= 70
          ? `Excellent conditions for training. Heat index at ${heatIndex}°C – maintain your normal pace with proper hydration.`
          : runningScore >= 40
            ? `Moderate conditions. Heat index ${heatIndex}°C – reduce intensity by 20-30%. Run early morning or evening to avoid peak heat.`
            : `Warning: Extreme conditions (HI ${heatIndex}°C). Outdoor exercise not recommended. Opt for gym, pool, or rest day.`}
      </InsightBanner>
    </div>
  );
}

function ConstructionDashboard({ current, dailyForecast }: { current: any; dailyForecast: any[] }) {
  const temp = safeVal(current?.temp, 22);
  const humidity = safeVal(current?.humidity, 50);
  const windSpeed = safeVal(current?.windSpeed, 10);
  const rainChance = safeVal(dailyForecast?.[0]?.rainChance || dailyForecast?.[0]?.pop, 10);
  const heatStress = temp > 40 ? 'Extreme' : temp > 35 ? 'High' : temp > 30 ? 'Moderate' : 'Low';
  const heatColor = heatStress === 'Extreme' ? '#ef4444' : heatStress === 'High' ? '#f97316' : heatStress === 'Moderate' ? '#eab308' : '#22c55e';
  const gustRisk = windSpeed > 40 ? 'Critical' : windSpeed > 25 ? 'High' : windSpeed > 15 ? 'Moderate' : 'Low';
  const gustColor = gustRisk === 'Critical' ? '#ef4444' : gustRisk === 'High' ? '#f97316' : gustRisk === 'Moderate' ? '#eab308' : '#22c55e';
  const precipProb = rainChance;
  const lightningRisk = (temp > 30 && humidity > 70 && rainChance > 40) ? 'Elevated' : (rainChance > 60) ? 'Moderate' : 'Low';
  const lightningColor = lightningRisk === 'Elevated' ? '#ef4444' : lightningRisk === 'Moderate' ? '#f97316' : '#22c55e';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={Thermometer} label="Heat Stress" value={heatStress} color={heatColor} subtitle={heatStress === 'Low' ? 'Safe for full workday' : heatStress === 'Moderate' ? 'Schedule breaks in shade' : heatStress === 'High' ? 'Limit exertion – early start advised' : 'Halt outdoor work – extreme danger'} />
        <MetricCard icon={Wind} label="Wind Gust Risk" value={gustRisk} color={gustColor} subtitle={gustRisk === 'Critical' ? 'Secure all equipment, halt crane ops' : gustRisk === 'High' ? 'Caution with elevated work' : gustRisk === 'Moderate' ? 'Monitor wind-sensitive tasks' : 'Safe for all operations'} />
        <MetricCard icon={CloudRain} label="Precipitation Prob." value={precipProb} unit="%" color="#60a5fa" subtitle={precipProb > 60 ? 'Work suspension likely' : precipProb > 30 ? 'Monitor radar closely' : 'Minimal disruption expected'} />
        <MetricCard icon={AlertTriangle} label="Lightning Risk" value={lightningRisk} color={lightningColor} subtitle={lightningRisk === 'Elevated' ? 'Halt all outdoor activities' : lightningRisk === 'Moderate' ? 'Monitor sky, have shelter ready' : 'No immediate concern'} />
      </div>
      <InsightBanner color="#eab308" icon={HardHat} title="Jobsite Safety Briefing">
        {heatStress === 'Extreme' || lightningRisk === 'Elevated'
          ? 'CRITICAL: Extreme heat + lightning risk detected. Implement heat illness protocol. Suspend all outdoor work until conditions improve. Move crew to designated shelter.'
          : gustRisk === 'Critical' || precipProb > 60
            ? 'WARNING: High winds or heavy precipitation expected. Secure loose materials, halt crane operations, and prepare for potential site closure.'
            : 'Conditions acceptable for normal operations. Continue with standard heat/cold safety measures. Monitor changing weather every 2 hours.'}
      </InsightBanner>
    </div>
  );
}

export default function HyperPersonalProfiles({ current, hourlyForecast, dailyForecast, astronomy, agriculture }: HyperPersonalProfilesProps) {
  const [mode, setMode] = useState<ProfileMode>('student');

  const activeProfile = PROFILES.find((p) => p.id === mode)!;

  function renderDashboard() {
    switch (mode) {
      case 'student': return <StudentDashboard current={current} hourlyForecast={hourlyForecast} dailyForecast={dailyForecast} />;
      case 'traveler': return <TravelerDashboard current={current} dailyForecast={dailyForecast} astronomy={astronomy} />;
      case 'pilot': return <PilotDashboard current={current} />;
      case 'farmer': return <FarmerDashboard agriculture={agriculture} />;
      case 'cyclist': return <CyclistDashboard current={current} dailyForecast={dailyForecast} />;
      case 'photographer': return <PhotographerDashboard current={current} astronomy={astronomy} />;
      case 'athlete': return <AthleteDashboard current={current} />;
      case 'construction': return <ConstructionDashboard current={current} dailyForecast={dailyForecast} />;
    }
  }

  const ActiveIcon = activeProfile.icon;

  return (
    <section className="section-container pb-6">
      <div className="rounded-2xl p-4 sm:p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 600, color: '#e4e4e7' }}>
              Hyper-Personal Profiles
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#52525b', marginTop: 2 }}>
              Role-based weather intelligence
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: `${activeProfile.color}10`, border: `1px solid ${activeProfile.color}25` }}>
            <ActiveIcon className="w-4 h-4" style={{ color: activeProfile.color }} strokeWidth={1.5} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: activeProfile.color }}>
              {activeProfile.label} Mode
            </span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-thin" style={{ scrollbarWidth: 'thin' }}>
          {PROFILES.map((profile) => (
            <ProfileCard key={profile.id} config={profile} active={mode === profile.id} onClick={() => setMode(profile.id)} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {renderDashboard()}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
