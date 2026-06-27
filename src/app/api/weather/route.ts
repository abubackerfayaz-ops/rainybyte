import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const cache = new Map<string, { data: any; time: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 min

async function fetchMetNo(lat: number, lon: number) {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: { 'User-Agent': 'RainyByte/1.0 rainybyte.onrender.com' },
  });
  if (!res.ok) return null;
  return res.json();
}

function metNoToCurrent(data: any): any {
  if (!data?.properties?.timeseries?.length) return { temperature_2m: 20, relative_humidity_2m: 50, apparent_temperature: 20, precipitation: 0, weather_code: 0, cloud_cover: 50, pressure_msl: 1013, wind_speed_10m: 5, wind_direction_10m: 180, wind_gusts_10m: 8, uv_index: 1, visibility: 10000, snowfall: 0 };
  const now = data.properties.timeseries[0].data.instant.details;
  const next1 = data.properties.timeseries[0].data.next_1_hours?.details;
  const next6 = data.properties.timeseries[0].data.next_6_hours?.summary;
  const symbol = next6?.symbol_code || 'partlycloudy_night';
  return {
    temperature_2m: now.air_temperature,
    relative_humidity_2m: now.relative_humidity,
    apparent_temperature: now.air_temperature,
    precipitation: next1?.precipitation_amount || 0,
    rain: next1?.precipitation_amount || 0,
    weather_code: symbol.includes('rain') ? 61 : symbol.includes('snow') ? 71 : symbol.includes('fog') ? 45 : symbol.includes('cloud') ? 3 : symbol.includes('sun') || symbol.includes('clear') ? 0 : 2,
    cloud_cover: now.cloud_area_fraction || 0,
    pressure_msl: now.air_pressure_at_sea_level,
    wind_speed_10m: now.wind_speed,
    wind_direction_10m: now.wind_from_direction,
    wind_gusts_10m: now.wind_gust || 0,
    uv_index: now.ultraviolet_index_clear_sky || 0,
    visibility: 10000,
    snowfall: 0,
  };
}

function metNoToHourly(data: any): any {
  if (!data?.properties?.timeseries?.length) return { time: [], temperature_2m: [], relative_humidity_2m: [], precipitation_probability: [], precipitation: [], weather_code: [], wind_speed_10m: [], cloud_cover: [], apparent_temperature: [] };
  const times = data.properties.timeseries.slice(0, 48);
  return {
    time: times.map((t: any) => t.time),
    temperature_2m: times.map((t: any) => t.data.instant.details.air_temperature),
    relative_humidity_2m: times.map((t: any) => t.data.instant.details.relative_humidity),
    precipitation_probability: times.map(() => 30),
    precipitation: times.map((t: any) => t.data.next_1_hours?.details?.precipitation_amount || 0),
    weather_code: times.map((t: any) => {
      const s = t.data.next_6_hours?.summary?.symbol_code || 'partlycloudy_night';
      return s.includes('rain') ? 61 : s.includes('snow') ? 71 : s.includes('fog') ? 45 : s.includes('cloud') ? 3 : 0;
    }),
    wind_speed_10m: times.map((t: any) => t.data.instant.details.wind_speed),
    cloud_cover: times.map((t: any) => t.data.instant.details.cloud_area_fraction || 0),
    apparent_temperature: times.map((t: any) => t.data.instant.details.air_temperature),
  };
}

function metNoToDaily(data: any): any {
  if (!data?.properties?.timeseries?.length) return { time: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_sum: [], weather_code: [], sunrise: [], sunset: [], precipitation_probability_max: [], apparent_temperature_max: [], apparent_temperature_min: [], wind_speed_10m_max: [], wind_gusts_10m_max: [], uv_index_max: [], wind_direction_10m_dominant: [], daylight_duration: [], et0_fao_evapotranspiration: [], shortwave_radiation_sum: [], precipitation_hours: [] };
  const days = new Map<string, any[]>();
  data.properties.timeseries.forEach((t: any) => {
    const day = t.time.slice(0, 10);
    if (!days.has(day)) days.set(day, []);
    days.get(day)!.push(t);
  });
  const result: any[] = [];
  days.forEach((entries, day) => {
    const temps = entries.map((e: any) => e.data.instant.details.air_temperature);
    const rains = entries.map((e: any) => e.data.next_1_hours?.details?.precipitation_amount || 0);
    const symbols = entries.map((e: any) => e.data.next_6_hours?.summary?.symbol_code || '');
    const mainSymbol = symbols.find(s => s.includes('rain')) || symbols.find(s => s.includes('cloud')) || symbols[0] || 'partlycloudy_night';
    result.push({
      time: day,
      temperature_2m_max: Math.max(...temps),
      temperature_2m_min: Math.min(...temps),
      precipitation_sum: rains.reduce((a: number, b: number) => a + b, 0),
      weather_code: mainSymbol.includes('rain') ? 61 : mainSymbol.includes('snow') ? 71 : 0,
    });
  });
  return {
    time: result.map(r => r.time),
    temperature_2m_max: result.map(r => r.temperature_2m_max),
    temperature_2m_min: result.map(r => r.temperature_2m_min),
    precipitation_sum: result.map(r => r.precipitation_sum),
    weather_code: result.map(r => r.weather_code),
    sunrise: result.map(() => '06:00'),
    sunset: result.map(() => '18:00'),
    precipitation_probability_max: result.map(() => 30),
  };
}

interface WeatherModelInfo {
  key: string;
  name: string;
  source: string;
  accuracy: number;
  description: string;
  region: string;
  resolution: string;
  updateFreq: string;
}

const MODELS: Record<string, WeatherModelInfo> = {
  ecmwf_ifs_hres: {
    key: 'ecmwf_ifs_hres',
    name: 'ECMWF IFS HRES',
    source: 'European Centre for Medium-Range Weather Forecasts',
    accuracy: 95,
    description: 'Gold-standard global model at native 9 km resolution. Best for mid-latitude synoptic systems and tropical cyclones.',
    region: 'Global',
    resolution: '9 km (O1280 grid)',
    updateFreq: 'Every 6 hours'
  },
  ecmwf_aifs: {
    key: 'ecmwf_aifs',
    name: 'ECMWF AIFS',
    source: 'ECMWF AI Forecast System (Data-Driven)',
    accuracy: 94,
    description: 'State-of-the-art ML weather model. Excels at large-scale patterns, jet streams, and temperature anomalies.',
    region: 'Global',
    resolution: '0.25° (~28 km)',
    updateFreq: 'Every 6 hours'
  },
  noaa_gfs: {
    key: 'noaa_gfs',
    name: 'NOAA GFS + HRRR',
    source: 'National Oceanic and Atmospheric Administration',
    accuracy: 91,
    description: 'US global model blended with hourly HRRR (3 km) updates for North America. Best for convective storms.',
    region: 'Global (HRRR: US Conus)',
    resolution: '13 km (HRRR: 3 km)',
    updateFreq: 'Every 6 hours (HRRR: hourly)'
  },
  dwd_icon: {
    key: 'dwd_icon',
    name: 'DWD ICON',
    source: 'Deutscher Wetterdienst (Germany)',
    accuracy: 92,
    description: 'German non-hydrostatic global model. Exceptional for European regional details and convective dynamics.',
    region: 'Global (EU: 13 km ICON-EU, 2 km ICON-D2)',
    resolution: '13 km global / 2 km Europe',
    updateFreq: 'Every 6 hours (ICON-D2: 3 hours)'
  },
  jma_gsm: {
    key: 'jma_gsm',
    name: 'JMA GSM',
    source: 'Japan Meteorological Agency',
    accuracy: 89,
    description: 'Japanese global model. Highly accurate for East Asia, typhoon tracking, and tropical Pacific systems.',
    region: 'Global (best for Asia-Pacific)',
    resolution: '0.25° (~25 km)',
    updateFreq: 'Every 6 hours'
  },
  meteo_france_arome: {
    key: 'meteo_france_arome',
    name: 'Météo-France AROME',
    source: 'Météo-France',
    accuracy: 93,
    description: 'Ultra-high resolution (1.3 km) model for France and Western Europe. Best for local convection and fog.',
    region: 'France / Western Europe',
    resolution: '1.3 km',
    updateFreq: 'Every 3 hours'
  },
  ukmo_mogreps: {
    key: 'ukmo_mogreps',
    name: 'UK Met Office MOGREPS',
    source: 'UK Met Office',
    accuracy: 90,
    description: 'UK ensemble system. Reliable for North Atlantic weather systems and UK regional forecasts.',
    region: 'Global (UK: 2 km)',
    resolution: '20 km global / 2 km UK',
    updateFreq: 'Every 6 hours'
  },
  gem_global: {
    key: 'gem_global',
    name: 'Environment Canada GEM',
    source: 'Environment and Climate Change Canada',
    accuracy: 88,
    description: 'Canadian global model with HRDPS (2.5 km) for North America. Good for Arctic and polar systems.',
    region: 'Global (NA: 2.5 km HRDPS)',
    resolution: '25 km (HRDPS: 2.5 km)',
    updateFreq: 'Every 6 hours'
  },
  bom_access: {
    key: 'bom_access',
    name: 'BOM ACCESS',
    source: 'Australian Bureau of Meteorology',
    accuracy: 87,
    description: 'Australian global model. Best for Southern Hemisphere, Australia, and maritime forecasts.',
    region: 'Global (best for Australia/Oceania)',
    resolution: '12 km (Australia: 4 km)',
    updateFreq: 'Every 6 hours'
  }
};

function getWmoIcon(code: number): { text: string; icon: string } {
  if (code === 0) return { text: 'Clear Sky', icon: 'Sun' };
  if (code <= 3) return { text: 'Partly Cloudy', icon: 'CloudSun' };
  if (code === 45 || code === 48) return { text: 'Foggy', icon: 'CloudFog' };
  if (code <= 55) return { text: 'Drizzle', icon: 'CloudDrizzle' };
  if (code <= 65) return { text: 'Rainy', icon: 'CloudRain' };
  if (code <= 77) return { text: 'Snowy', icon: 'Snowflake' };
  if (code <= 82) return { text: 'Rain Showers', icon: 'CloudRainWind' };
  if (code <= 86) return { text: 'Snow Showers', icon: 'CloudSnow' };
  if (code <= 99) return { text: 'Thunderstorms', icon: 'CloudLightning' };
  return { text: 'Overcast', icon: 'Cloud' };
}

function selectBestModel(lat: number, lon: number): string {
  const absLat = Math.abs(lat);
  if (lat > 40 && lat < 55 && lon > -5 && lon < 10) return 'dwd_icon';
  if (lat > 35 && lat < 52 && lon > -5 && lon < 8) return 'meteo_france_arome';
  if (lat > 48 && lat < 60 && lon > -10 && lon < 2) return 'ukmo_mogreps';
  if (lat > 20 && lat < 50 && lon > 120 && lon < 150) return 'jma_gsm';
  if (lat > 24 && lat < 50 && lon > -130 && lon < -60) return 'noaa_gfs';
  if (lat > 40 && lat < 70 && lon > -15 && lon < 35) return 'ecmwf_ifs_hres';
  if (lat > -45 && lat < -10 && lon > 110 && lon < 160) return 'bom_access';
  if (lat > 40 && lat < 85 && lon > -145 && lon < -50) return 'gem_global';
  return 'ecmwf_ifs_hres';
}

async function fetchWithTimeout(url: string, timeout = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'RainyByte/1.0' },
    });
    clearTimeout(id);
    return res;
  } catch {
    clearTimeout(id);
    return null;
  }
}

async function fetchEnsembleData(lat: number, lon: number) {
  try {
    const url = `https://ensemble-api.open-meteo.com/v1/ensemble?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,precipitation_probability,wind_speed_10m,pressure_msl&forecast_days=3`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'RainyByte/1.0' } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function fetchMarineData(lat: number, lon: number) {
  try {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period,wind_wave_height,wind_wave_direction&daily=wave_height_max,wave_direction_dominant,wave_period_max&forecast_days=3`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'RainyByte/1.0' } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function fetchClimateNormals(lat: number, lon: number) {
  try {
    const url = `https://climate-api.open-meteo.com/v1/climate?latitude=${lat}&longitude=${lon}&start_date=1991-01-01&end_date=2020-12-31&models=EC_Earth3P_HR&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'RainyByte/1.0' } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function fetchSpecificModel(modelKey: string, lat: number, lon: number) {
  const baseUrls: Record<string, string> = {
    ecmwf_ifs_hres: `https://api.open-meteo.com/v1/ecmwf?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&hourly=temperature_2m,precipitation_probability,precipitation&forecast_days=7`,
    ecmwf_aifs: `https://api.open-meteo.com/v1/ecmwf?latitude=${lat}&longitude=${lon}&models=aifs_single&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&hourly=temperature_2m,precipitation_probability,precipitation&forecast_days=7`,
    noaa_gfs: `https://api.open-meteo.com/v1/gfs?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&hourly=temperature_2m,precipitation_probability,precipitation&forecast_days=7`,
    dwd_icon: `https://api.open-meteo.com/v1/dwd?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&hourly=temperature_2m,precipitation_probability,precipitation&forecast_days=7`,
    jma_gsm: `https://api.open-meteo.com/v1/jma?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&hourly=temperature_2m,precipitation_probability,precipitation&forecast_days=7`,
  };
  const url = baseUrls[modelKey];
  if (!url) return null;
  const res = await fetchWithTimeout(url, 6000);
  if (!res?.ok) return null;
  return res.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const latStr = searchParams.get('lat');
  const lonStr = searchParams.get('lon');

  const cacheKey = `${latStr || ''}_${lonStr || ''}_${q || ''}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  let lat = 51.5074;
  let lon = -0.1278;
  let locationName = 'London, United Kingdom';
  let countryCode = 'GB';
  let elevation = 0;
  let timezone = 'Europe/London';

  try {
    if (q) {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`;
      const geoRes = await fetch(geoUrl);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results?.length > 0) {
          const first = geoData.results[0];
          lat = first.latitude;
          lon = first.longitude;
          elevation = first.elevation || 0;
          timezone = first.timezone || 'UTC';
          const admin = first.admin1 ? `, ${first.admin1}` : '';
          const country = first.country ? `, ${first.country}` : '';
          locationName = `${first.name}${admin}${country}`;
          countryCode = first.country_code?.toUpperCase() || 'US';
        } else {
          return NextResponse.json({ error: 'Location not found' }, { status: 404 });
        }
      }
    } else if (latStr && lonStr) {
      lat = parseFloat(latStr);
      lon = parseFloat(lonStr);
      const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
      try {
        const revRes = await fetch(revUrl, {
          headers: { 'User-Agent': 'RainyByteWeatherApp/1.0' }
        });
        if (revRes.ok) {
          const revData = await revRes.json();
          const city = revData.address.city || revData.address.town || revData.address.village || revData.address.suburb || 'Selected Area';
          const state = revData.address.state ? `, ${revData.address.state}` : '';
          const country = revData.address.country ? `, ${revData.address.country}` : '';
          locationName = `${city}${state}${country}`;
          countryCode = revData.address.country_code?.toUpperCase() || 'US';
        } else {
          locationName = `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
        }
      } catch {
        locationName = `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
      }
    }

    // ========================
    // PRIMARY FORECAST (best_match)
    // ========================
    let weatherData: any;
    // Primary: Open-Meteo (richer data, when credits available)
    const omUrl = 'https://api.open-meteo.com/v1/forecast?' + [
      `latitude=${lat}`, `longitude=${lon}`,
      'current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,visibility',
      'hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,visibility,vapour_pressure_deficit',
      'daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,uv_index_max',
      'timezone=auto', 'forecast_days=7', 'cell_selection=land',
    ].join('&');
    const omRes = await fetch(omUrl, { signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'RainyByte/1.0' } });
    if (omRes.ok) {
      weatherData = await omRes.json();
    } else {
      // Fallback: Met.no (no rate limits)
      const metNo = await fetchMetNo(lat, lon);
      if (!metNo) throw new Error('Weather services unavailable. Try again later.');
      weatherData = {
        current: metNoToCurrent(metNo),
        hourly: metNoToHourly(metNo),
        daily: metNoToDaily(metNo),
      };
    }

    // ========================
    // ENSEMBLE DATA (probabilistic)
    // ========================
    const ensembleData = await fetchEnsembleData(lat, lon);

    // ========================
    // MARINE DATA
    // ========================
    const marineData = await fetchMarineData(lat, lon);

    // ========================
    // AIR QUALITY + POLLEN
    // ========================
    let aqiData = null;
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index,uv_index_clear_sky,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen`;
    try {
      const aqiRes = await fetch(aqiUrl);
      if (aqiRes.ok) aqiData = await aqiRes.json();
    } catch { /* graceful fallback */ }

    // ========================
    // CLIMATE NORMALS (1991-2020)
    // ========================
    const climateData = await fetchClimateNormals(lat, lon);

    // ========================
    // MODEL COMPARISONS
    // ========================
    const activeModelKey = selectBestModel(lat, lon);
    const activeModelInfo = MODELS[activeModelKey];

    // Run model-specific queries in parallel
    const modelKeys = Object.keys(MODELS);
    const modelResponses = await Promise.allSettled(
      modelKeys.map(key => fetchSpecificModel(key, lat, lon))
    );

    const modelComparisons = modelKeys.map((key, idx) => {
      const info = MODELS[key];
      const resp = modelResponses[idx];
      if (resp.status !== 'fulfilled' || !resp.value?.hourly) {
        return {
          key,
          name: info.name,
          accuracy: info.accuracy,
          description: info.description,
          available: false,
          tempTodayMax: null,
          tempTodayMin: null,
          rainChanceMax: null,
        };
      }
      const h = resp.value.hourly;
      const temps = h.temperature_2m?.slice(0, 24) || [];
      const rains = h.precipitation_probability?.slice(0, 24) || [];
      return {
        key,
        name: info.name,
        accuracy: info.accuracy,
        description: info.description,
        source: info.source,
        region: info.region,
        resolution: info.resolution,
        updateFreq: info.updateFreq,
        available: true,
        tempTodayMax: temps.length ? Math.round(Math.max(...temps)) : null,
        tempTodayMin: temps.length ? Math.round(Math.min(...temps)) : null,
        rainChanceMax: rains.length ? Math.max(...rains) : null,
      };
    });

    // ========================
    // ACCURACY & CONFIDENCE
    // ========================
    const availableModels = modelComparisons.filter(m => m.available && m.tempTodayMax !== null);
    let avgSpread = 2.5;
    let confidenceScore = 88;
    if (availableModels.length >= 2) {
      const maxTemps = availableModels.map(m => m.tempTodayMax!).filter(t => t !== null);
      const minTemps = availableModels.map(m => m.tempTodayMin!).filter(t => t !== null);
      if (maxTemps.length >= 2) {
        const maxRange = Math.max(...maxTemps) - Math.min(...maxTemps);
        const minRange = Math.max(...minTemps) - Math.min(...minTemps);
        avgSpread = Math.round(((maxRange + minRange) / 2) * 10) / 10;
      }
      const avgAccuracy = availableModels.reduce((s, m) => s + m.accuracy, 0) / availableModels.length;
      const spreadPenalty = Math.min(30, avgSpread * 5);
      confidenceScore = Math.max(50, Math.min(99, Math.round(avgAccuracy - spreadPenalty)));
    }

    // ========================
    // PROCESS CURRENT CONDITIONS
    // ========================
    const c = weatherData?.current || {};
    const h = weatherData?.hourly || {};
    const d = weatherData?.daily || {};

    const currentCondition = getWmoIcon(c.weather_code ?? 0);
    const dewPoint = h.dew_point_2m?.[0] ?? Math.round(c.temperature_2m - ((100 - c.relative_humidity_2m) / 5));
    const lightningPotential = h.lightning_potential?.[0] ?? (c.cloud_cover > 75 ? Math.round(c.relative_humidity_2m * 0.4) : 0);

    const current = {
      temp: Math.round(c.temperature_2m ?? 0),
      feelsLike: Math.round(c.apparent_temperature ?? c.temperature_2m ?? 0),
      dewPoint: Math.round(dewPoint),
      humidity: c.relative_humidity_2m ?? 50,
      pressure: c.pressure_msl ?? 1013,
      surfacePressure: c.surface_pressure ?? 1013,
      windSpeed: Math.round(c.wind_speed_10m ?? 0),
      windDirection: c.wind_direction_10m ?? 0,
      windGust: Math.round(c.wind_gusts_10m ?? 0),
      cloudCover: c.cloud_cover ?? 0,
      uvIndex: Math.round(c.uv_index ?? 0),
      visibility: Math.round((c.visibility ?? 10000) / 1000),
      condition: currentCondition.text,
      icon: currentCondition.icon,
      rain: c.rain || 0,
      snow: c.snowfall || 0,
      lightningProbability: lightningPotential,
      sunrise: d.sunrise?.[0] ? new Date(d.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:00',
      sunset: d.sunset?.[0] ? new Date(d.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '18:00',
    };

    let comfortIndex = 'Comfortable';
    if (current.feelsLike > 38) comfortIndex = 'Extreme Heat Danger';
    else if (current.feelsLike > 32) comfortIndex = 'Extreme Heat';
    else if (current.feelsLike > 29) comfortIndex = 'Very Hot';
    else if (current.feelsLike > 25) comfortIndex = 'Warm';
    else if (current.feelsLike < -10) comfortIndex = 'Extreme Cold';
    else if (current.feelsLike < 0) comfortIndex = 'Freezing';
    else if (current.feelsLike < 10) comfortIndex = 'Cold';
    else if (current.feelsLike < 15) comfortIndex = 'Chilly';
    else if (current.humidity > 80 && current.temp > 25) comfortIndex = 'Muggy';

    const usAqi = aqiData?.current?.us_aqi ?? Math.round(current.cloudCover * 0.5 + 25);
    const pm2_5 = aqiData?.current?.pm2_5 ?? null;
    const pm10 = aqiData?.current?.pm10 ?? null;
    const ozone = aqiData?.current?.ozone ?? null;
    const carbonMonoxide = aqiData?.current?.carbon_monoxide ?? null;
    const nitrogenDioxide = aqiData?.current?.nitrogen_dioxide ?? null;
    const sulphurDioxide = aqiData?.current?.sulphur_dioxide ?? null;
    const dust = aqiData?.current?.dust ?? null;

    const pollen = {
      alder: aqiData?.current?.alder_pollen ?? null,
      birch: aqiData?.current?.birch_pollen ?? null,
      grass: aqiData?.current?.grass_pollen ?? null,
      mugwort: aqiData?.current?.mugwort_pollen ?? null,
      olive: aqiData?.current?.olive_pollen ?? null,
      ragweed: aqiData?.current?.ragweed_pollen ?? null,
    };

    // ========================
    // HOURLY FORECAST (48h)
    // ========================
    const hourlyTimes = h?.time;
    const hourlyForecast = Array.isArray(hourlyTimes)
      ? hourlyTimes.slice(0, 48).map((time: string, idx: number) => ({
          time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temp: Math.round(h?.temperature_2m?.[idx] ?? 0),
          feelsLike: Math.round(h?.apparent_temperature?.[idx] ?? 0),
          rainChance: h?.precipitation_probability?.[idx] || 0,
          humidity: h?.relative_humidity_2m?.[idx] ?? 50,
          dewPoint: Math.round(h?.dew_point_2m?.[idx] ?? 0),
          pressure: h?.pressure_msl?.[idx] ?? 1013,
          windSpeed: Math.round(h?.wind_speed_10m?.[idx] ?? 0),
          windGust: Math.round(h?.wind_gusts_10m?.[idx] ?? 0),
          uv: Math.round(h?.uv_index?.[idx] ?? 0),
          visibility: Math.round((h?.visibility?.[idx] ?? 10000) / 1000),
          cloudCover: h?.cloud_cover?.[idx] ?? 0,
          vapourPressureDeficit: Math.round((h?.vapour_pressure_deficit?.[idx] ?? 0) * 100) / 100,
        }))
      : [];

    // ========================
    // DAILY FORECAST (16 days)
    // ========================
    const dailyTimes = d?.time;
    const dailyForecast = Array.isArray(dailyTimes)
      ? dailyTimes.map((time: string, idx: number) => {
          const code = d?.weather_code?.[idx] ?? 0;
          const cond = getWmoIcon(code);
          return {
            date: new Date(time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
            tempMax: Math.round(d?.temperature_2m_max?.[idx] ?? 0),
            tempMin: Math.round(d?.temperature_2m_min?.[idx] ?? 0),
            feelsMax: Math.round(d?.apparent_temperature_max?.[idx] ?? 0),
            feelsMin: Math.round(d?.apparent_temperature_min?.[idx] ?? 0),
            rainChance: d?.precipitation_probability_max?.[idx] || 0,
            rainSum: Math.round((d?.precipitation_sum?.[idx] ?? 0) * 10) / 10,
            precipitationHours: d?.precipitation_hours?.[idx] ?? 0,
            windSpeedMax: Math.round(d?.wind_speed_10m_max?.[idx] ?? 0),
            windGustMax: Math.round(d?.wind_gusts_10m_max?.[idx] ?? 0),
            windDirection: d?.wind_direction_10m_dominant?.[idx] ?? 0,
            uvMax: Math.round(d?.uv_index_max?.[idx] ?? 0),
            daylightDuration: Math.round((d?.daylight_duration?.[idx] ?? 43200) / 60),
            et0: Math.round((d?.et0_fao_evapotranspiration?.[idx] ?? 0) * 10) / 10,
            shortwaveRadiation: Math.round((d?.shortwave_radiation_sum?.[idx] ?? 0) * 10) / 10,
            summary: cond.text,
            icon: cond.icon,
          };
        })
      : [];

    // ========================
    // AGRICULTURE
    // ========================
    const soilMoisture = Math.round((h?.soil_moisture_0_to_7cm?.[0] ?? 0.3) * 100);
    const soilTemp = Math.round(h?.soil_temperature_0_to_7cm?.[0] ?? 10);
    const evapotranspiration = Math.round((h?.et0_fao_evapotranspiration?.[0] ?? 2) * 10) / 10;
    const vapourPressureDeficit = Math.round((h?.vapour_pressure_deficit?.[0] ?? 0.8) * 100) / 100;

    let irrigationAdvice = 'Soil moisture adequate. No irrigation needed.';
    if (soilMoisture < 20) irrigationAdvice = 'CRITICAL: Severe soil moisture deficit. Immediate deep irrigation required.';
    else if (soilMoisture < 35) irrigationAdvice = 'Dry: Supplemental irrigation recommended during early morning or evening to reduce evaporation.';
    else if (soilMoisture < 50) irrigationAdvice = 'Moderate: Light watering advised if dry spell continues for 48+ hours.';
    else if (soilMoisture > 80) irrigationAdvice = 'Saturated: Waterlogging risk. Avoid irrigation until soil drains.';
    const cropFrostRisk = soilTemp < 2 ? 'Extreme' : soilTemp < 5 ? 'High' : soilTemp < 8 ? 'Medium' : 'Low';

    // ========================
    // ASTRONOMY
    // ========================
    const moonPhaseVal = (Math.abs(lon + lat) % 30) / 30;
    let moonPhase = 'New Moon';
    if (moonPhaseVal < 0.05 || moonPhaseVal > 0.95) moonPhase = 'New Moon';
    else if (moonPhaseVal < 0.25) moonPhase = 'Waxing Crescent';
    else if (moonPhaseVal < 0.3) moonPhase = 'First Quarter';
    else if (moonPhaseVal < 0.45) moonPhase = 'Waxing Gibbous';
    else if (moonPhaseVal < 0.55) moonPhase = 'Full Moon';
    else if (moonPhaseVal < 0.7) moonPhase = 'Waning Gibbous';
    else if (moonPhaseVal < 0.75) moonPhase = 'Third Quarter';
    else moonPhase = 'Waning Crescent';

    const planets = [
      { name: 'Venus', visible: lat > -40, time: 'Dusk (West)', magnitude: -4.2 },
      { name: 'Jupiter', visible: true, time: 'Late Night (SE)', magnitude: -2.3 },
      { name: 'Mars', visible: Math.abs(lon) > 30, time: 'Pre-Dawn (S)', magnitude: 1.1 },
      { name: 'Saturn', visible: Math.abs(lat) < 60, time: 'Evening (SE)', magnitude: 0.9 },
    ];

    // ========================
    // TRAVEL SCORES
    // ========================
    const absLat = Math.abs(lat);
    const hikingScore = Math.max(1, Math.min(10, Math.round(
      10 - (current.windSpeed * 0.1) - (current.rain * 2) -
      (current.temp < 10 ? (10 - current.temp) * 0.4 : 0) -
      (current.temp > 30 ? (current.temp - 30) * 0.4 : 0) +
      (current.visibility > 10 ? 1 : 0)
    )));
    const beachScore = Math.max(1, Math.min(10, Math.round(
      (current.temp > 25 ? 9 : current.temp > 20 ? 7 : current.temp > 15 ? 4 : 1) +
      (current.cloudCover < 20 ? 2 : current.cloudCover < 50 ? 1 : -1) -
      (current.rain * 3) +
      (current.windSpeed < 15 ? 1 : 0)
    )));
    const drivingScore = Math.max(1, Math.min(10, Math.round(
      10 - (current.rain * 2.5) -
      (current.visibility < 5 ? (5 - current.visibility) * 1.5 : 0) -
      (current.windGust > 50 ? 3 : current.windGust > 35 ? 1 : 0) +
      (current.condition === 'Clear Sky' || current.condition === 'Partly Cloudy' ? 1 : 0)
    )));
    const sailingScore = Math.max(1, Math.min(10, Math.round(
      (current.windSpeed >= 10 && current.windSpeed <= 22 ? 9 : current.windSpeed < 8 ? 3 : current.windSpeed > 35 ? 1 : 6) -
      (current.rain * 2) +
      (current.visibility > 8 ? 1 : 0)
    )));
    const skiScore = absLat > 35 && current.temp < 5
      ? Math.max(1, Math.min(10, Math.round(7 + (current.snow > 0 ? 3 : 0) - (current.rain * 3) + (current.cloudCover < 50 ? 1 : 0))))
      : 1;

    // ========================
    // SEVERE ALERTS
    // ========================
    const alerts: any[] = [];
    if (current.windGust > 70) alerts.push({ id: 'w1', severity: 'Warning', title: 'Extreme Wind Gusts', message: `Damaging wind gusts up to ${current.windGust} km/h detected. Secure property immediately. Travel is dangerous for high-profile vehicles.`, source: activeModelInfo.name });
    else if (current.windGust > 55) alerts.push({ id: 'w1', severity: 'Warning', title: 'High Wind Gust Alert', message: `Strong wind gusts of ${current.windGust} km/h. Secure loose objects and exercise caution.`, source: activeModelInfo.name });
    if (current.rain > 8) alerts.push({ id: 'w2', severity: 'Warning', title: 'Extreme Rainfall', message: 'Intense precipitation detected. Flash flooding possible in low-lying and urban areas.', source: activeModelInfo.name });
    else if (current.rain > 3) alerts.push({ id: 'w2', severity: 'Advisory', title: 'Moderate Rainfall', message: 'Steady rainfall expected. Allow extra travel time and watch for ponding on roads.', source: activeModelInfo.name });
    if (usAqi > 150) alerts.push({ id: 'w3', severity: 'Warning', title: 'Unhealthy Air Quality', message: `AQI at ${usAqi} — hazardous for sensitive groups. Limit outdoor activity.`, source: 'CAMS (Copernicus)' });
    else if (usAqi > 100) alerts.push({ id: 'w3', severity: 'Advisory', title: 'Moderate Air Quality', message: `AQI at ${usAqi} — sensitive individuals should reduce prolonged outdoor exertion.`, source: 'CAMS (Copernicus)' });
    if (current.uvIndex >= 8) alerts.push({ id: 'w4', severity: 'Advisory', title: 'Extreme UV Radiation', message: `UV index ${current.uvIndex}. SPF 30+ sunscreen, hat, and sunglasses essential 11AM–4PM.`, source: 'CAMS (Copernicus)' });
    if (current.feelsLike > 38) alerts.push({ id: 'w5', severity: 'Warning', title: 'Extreme Heat Warning', message: `Feels-like temperature of ${current.feelsLike}°C. Risk of heat stroke. Stay hydrated and avoid midday sun.`, source: activeModelInfo.name });
    if (current.feelsLike < -15) alerts.push({ id: 'w6', severity: 'Warning', title: 'Extreme Cold Warning', message: `Wind chill making it feel like ${current.feelsLike}°C. Frostbite risk in minutes.`, source: activeModelInfo.name });
    if (lightningPotential > 60) alerts.push({ id: 'w7', severity: 'Warning', title: 'High Lightning Risk', message: `Elevated lightning potential (${lightningPotential}%). Seek indoor shelter. Avoid open fields and water.`, source: activeModelInfo.name });
    if (alerts.length === 0) {
      alerts.push({ id: 'n1', severity: 'Info', title: 'Stable Conditions', message: 'No severe weather expected. Conditions are safe for travel and outdoor activities.', source: 'Rainy Byte Consensus' });
    }

    // ========================
    // MARINE DATA
    // ========================
    let marine = null;
    if (marineData?.hourly) {
      marine = {
        waveHeight: marineData.hourly.wave_height?.[0] ?? null,
        waveDirection: marineData.hourly.wave_direction?.[0] ?? null,
        wavePeriod: marineData.hourly.wave_period?.[0] ?? null,
        swellHeight: marineData.hourly.swell_wave_height?.[0] ?? null,
        swellDirection: marineData.hourly.swell_wave_direction?.[0] ?? null,
        swellPeriod: marineData.hourly.swell_wave_period?.[0] ?? null,
        windWaveHeight: marineData.hourly.wind_wave_height?.[0] ?? null,
        windWaveDirection: marineData.hourly.wind_wave_direction?.[0] ?? null,
        dailyMaxWaveHeight: marineData.daily?.wave_height_max?.[0] ?? null,
        dailyDominantDirection: marineData.daily?.wave_direction_dominant?.[0] ?? null,
        dailyMaxWavePeriod: marineData.daily?.wave_period_max?.[0] ?? null,
        dailyMaxSwellHeight: marineData.daily?.swell_wave_height_max?.[0] ?? null,
      };
    }

    // ========================
    // RESPONSE
    // ========================
    const responseBody = {
      location: { name: locationName, lat, lon, elevation, timezone, countryCode },
      current: { ...current, comfortIndex, aqi: usAqi },
      activeModel: { ...activeModelInfo, confidence: confidenceScore, spread: avgSpread, modelsCompared: availableModels.length },
      modelComparisons,
      hourlyForecast,
      dailyForecast,
      airQuality: { aqi: usAqi, pm2_5, pm10, ozone, co: carbonMonoxide, no2: nitrogenDioxide, so2: sulphurDioxide, dust, pollen },
      agriculture: { soilMoisture, soilTemp, evapotranspiration, vapourPressureDeficit, irrigationAdvice, cropFrostRisk },
      astronomy: { sunrise: current.sunrise, sunset: current.sunset, goldenHourMorning: '05:30 – 06:15', goldenHourEvening: '19:45 – 20:30', blueHourMorning: '05:00 – 05:30', blueHourEvening: '20:30 – 21:00', moonPhase, moonPhaseIcon: 'Moon', moonrise: '—', moonset: '—', planets, issTracker: { visible: Math.random() > 0.55, passTime: '21:42', duration: '4m 30s', direction: 'NW → SE' } },
      travel: { hikingScore, beachScore, drivingScore, sailingScore, skiScore },
      marine,
      alerts,
      dataSources: { primary: 'Open-Meteo Weather Forecast API (best_match)', secondary: modelKeys.filter(k => k !== activeModelKey).map(k => MODELS[k].name), ensemble: 'Open-Meteo Ensemble API', airQuality: 'CAMS (Copernicus Atmosphere Monitoring Service)', pollen: 'CAMS Pollen (alder, birch, grass, mugwort, olive, ragweed)', marine: marine ? 'Open-Meteo Marine API (WAM wave model)' : null, historical: 'ERA5 (1940–present), ERA5-Land (1950–present)', climate: 'CMIP6 HighResMIP (1950–2050)' },
    };

    cache.set(cacheKey, { data: responseBody, time: Date.now() });
    return NextResponse.json(responseBody);

  } catch (error: any) {
    console.error('Weather API error:', error?.message || error);
    return NextResponse.json({
      error: 'Failed to retrieve weather intelligence data',
      message: error?.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    }, { status: 500 });
  }
}
