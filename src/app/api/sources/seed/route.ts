import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Source from '@/models/Source';

const INITIAL_SOURCES = [
  { key: 'ecmwf_ifs_hres', name: 'ECMWF IFS HRES', type: 'global_model' as const, provider: 'ECMWF', url: 'https://www.ecmwf.int', region: 'global', description: 'European Centre for Medium-Range Weather Forecasts — High-Resolution Forecast', resolution: '9 km', updateFreq: '12-hourly', accuracy: 94 },
  { key: 'ecmwf_aifs', name: 'ECMWF AIFS', type: 'global_model' as const, provider: 'ECMWF', url: 'https://www.ecmwf.int', region: 'global', description: 'ECMWF Artificial Intelligence/Integrated Forecasting System', resolution: '28 km', updateFreq: '6-hourly', accuracy: 92 },
  { key: 'noaa_gfs', name: 'NOAA GFS', type: 'global_model' as const, provider: 'NOAA', url: 'https://www.ncei.noaa.gov', region: 'global', description: 'National Oceanic and Atmospheric Administration — Global Forecast System', resolution: '13 km', updateFreq: '6-hourly', accuracy: 90 },
  { key: 'noaa_hrrr', name: 'NOAA HRRR', type: 'regional_model' as const, provider: 'NOAA', url: 'https://rapidrefresh.noaa.gov', region: 'north_america', description: 'High-Resolution Rapid Refresh — North America only', resolution: '3 km', updateFreq: 'hourly', accuracy: 91 },
  { key: 'dwd_icon', name: 'DWD ICON', type: 'global_model' as const, provider: 'DWD', url: 'https://www.dwd.de', region: 'europe', description: 'Deutscher Wetterdienst — Icosahedral Nonhydrostatic Model', resolution: '13 km', updateFreq: '6-hourly', accuracy: 89 },
  { key: 'jma_gsm', name: 'JMA GSM', type: 'global_model' as const, provider: 'JMA', url: 'https://www.jma.go.jp', region: 'asia', description: 'Japan Meteorological Agency — Global Spectral Model', resolution: '20 km', updateFreq: '6-hourly', accuracy: 88 },
  { key: 'meteo_france_arome', name: 'Météo-France AROME', type: 'regional_model' as const, provider: 'Météo-France', url: 'https://www.meteofrance.fr', region: 'europe', description: 'Applications of Research to Operations at MEsoscale — France focused', resolution: '1.3 km', updateFreq: '3-hourly', accuracy: 90 },
  { key: 'ukmo_mogreps', name: 'UK Met Office MOGREPS', type: 'ensemble' as const, provider: 'UK Met Office', url: 'https://www.metoffice.gov.uk', region: 'europe', description: 'Met Office Global and Regional Ensemble Prediction System', resolution: '20 km', updateFreq: '6-hourly', accuracy: 87 },
  { key: 'eccc_gem', name: 'Environment Canada GEM', type: 'global_model' as const, provider: 'ECCC', url: 'https://weather.gc.ca', region: 'north_america', description: 'Environment and Climate Change Canada — Global Environmental Multiscale Model', resolution: '15 km', updateFreq: '6-hourly', accuracy: 86 },
  { key: 'bom_access', name: 'BOM ACCESS', type: 'global_model' as const, provider: 'BOM', url: 'https://www.bom.gov.au', region: 'australia', description: 'Australian Bureau of Meteorology — Australian Community Climate and Earth-System Simulator', resolution: '12 km', updateFreq: '6-hourly', accuracy: 85 },
];

export async function POST() {
  try {
    await connectDB();
    let inserted = 0;
    try {
      const result = await Source.insertMany(INITIAL_SOURCES, { ordered: false });
      inserted = result.length;
    } catch (e: any) {
      if (e.code === 11000) {
        inserted = 0;
      } else {
        throw e;
      }
    }
    return NextResponse.json({
      message: inserted > 0 ? `Seeded ${inserted} new sources` : `All ${INITIAL_SOURCES.length} sources already exist`,
      inserted,
      total: INITIAL_SOURCES.length,
    }, { status: inserted > 0 ? 201 : 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to seed sources' }, { status: 500 });
  }
}
