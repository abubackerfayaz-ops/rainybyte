export interface ClimateProfile {
  koppenCode: string;
  koppenName: string;
  description: string;
  zone: 'Tropical' | 'Arid' | 'Temperate' | 'Continental' | 'Polar';
  monthlyAverages: {
    month: string;
    temp: number; // °C
    precip: number; // mm
    humidity: number; // %
  }[];
  annualPrecipitation: number;
  tempAnomaly: number;
  precipAnomaly: number;
  heatwaveRisk: 'Low' | 'Medium' | 'High';
  coldwaveRisk: 'Low' | 'Medium' | 'High';
  droughtRisk: 'Low' | 'Medium' | 'High';
  floodRisk: 'Low' | 'Medium' | 'High';
  ensoStatus: 'El Niño' | 'La Niña' | 'Neutral';
  climateTrend: string;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function getClimateProfile(lat: number, lon: number): ClimateProfile {
  const absLat = Math.abs(lat);
  
  // 1. Determine Climate Zone & Köppen Classification based on latitude and longitude heuristics
  let koppenCode = 'Cfb';
  let koppenName = 'Temperate Oceanic';
  let zone: ClimateProfile['zone'] = 'Temperate';
  let description = 'Warm summers and mild winters, with precipitation distributed relatively evenly throughout the year.';
  
  // Base temperature profile based on latitude (Equator is ~27C, Poles are ~-20C)
  // Shift curves based on hemisphere (Northern vs Southern)
  const isNorthernHemisphere = lat >= 0;
  
  if (absLat < 10) {
    // Equatorial / Tropical
    zone = 'Tropical';
    if (absLat < 5) {
      koppenCode = 'Af';
      koppenName = 'Tropical Rainforest';
      description = 'Hot, very wet, and humid all year round. No distinct dry season.';
    } else {
      koppenCode = 'Am';
      koppenName = 'Tropical Monsoon';
      description = 'Hot all year round with a short dry season and heavy monsoon rains.';
    }
  } else if (absLat >= 10 && absLat < 23.5) {
    // Savanna or Dry / Desert boundary
    const isDryRegion = (lon > -20 && lon < 50) || (lon > 115 && lon < 145 && lat < 0) || (lon > -110 && lon < -95 && lat > 0);
    if (isDryRegion) {
      koppenCode = 'BSh';
      koppenName = 'Hot Semi-Arid';
      zone = 'Arid';
      description = 'Hot, dry climate with low and highly variable seasonal rainfall.';
    } else {
      koppenCode = 'Aw';
      koppenName = 'Tropical Savanna';
      zone = 'Tropical';
      description = 'Warm all year with a pronounced dry winter season and wet summer season.';
    }
  } else if (absLat >= 23.5 && absLat < 35) {
    // Deserts and Mediterranean
    const isWestCoastOrDry = (lon > -15 && lon < 15) || (lon > 10 && lon < 60) || (lon > -120 && lon < -100);
    if (isWestCoastOrDry) {
      koppenCode = 'BWh';
      koppenName = 'Hot Desert';
      zone = 'Arid';
      description = 'Extremely hot and dry. Very little precipitation, high evaporation rates.';
    } else {
      koppenCode = 'Cfa';
      koppenName = 'Humid Subtropical';
      zone = 'Temperate';
      description = 'Hot, humid summers and mild winters. Rainfall is moderate and occurs year-round.';
    }
  } else if (absLat >= 35 && absLat < 50) {
    // Mediterranean, Marine, Continental
    const isMediterranean = (lon > -10 && lon < 36 && lat > 0) || (lon > 115 && lon < 125 && lat < 0);
    const isContinental = (lon > 30 && lon < 130 && lat > 0) || (lon > -100 && lon < -70 && lat > 0);
    
    if (isMediterranean) {
      koppenCode = 'Csa';
      koppenName = 'Hot-Summer Mediterranean';
      zone = 'Temperate';
      description = 'Hot, dry summers and cool, wet winters. Highly seasonal rainfall.';
    } else if (isContinental) {
      koppenCode = 'Dfa';
      koppenName = 'Humid Continental (Hot Summer)';
      zone = 'Continental';
      description = 'Large seasonal temperature variance, with hot summers and cold, snowy winters.';
    } else {
      koppenCode = 'Cfb';
      koppenName = 'Marine West Coast';
      zone = 'Temperate';
      description = 'Cool summers, mild winters, and abundant precipitation year-round.';
    }
  } else if (absLat >= 50 && absLat < 65) {
    // Subarctic / Humid Continental
    const isDryWinter = lon > 90 && lon < 140;
    if (isDryWinter) {
      koppenCode = 'Dwc';
      koppenName = 'Subarctic (Dry Winter)';
      zone = 'Continental';
      description = 'Extremely cold winters and short, cool summers. Precipitation is concentrated in summer.';
    } else {
      koppenCode = 'Dfb';
      koppenName = 'Humid Continental (Warm Summer)';
      zone = 'Continental';
      description = 'Severe winters, warm summers, and uniform precipitation throughout the year.';
    }
  } else {
    // Polar / Tundra
    zone = 'Polar';
    if (absLat < 75) {
      koppenCode = 'ET';
      koppenName = 'Tundra';
      description = 'Long, dark, freezing winters and short, cold summers where only mosses and lichens grow.';
    } else {
      koppenCode = 'EF';
      koppenName = 'Ice Cap';
      description = 'Perpetual frost. Average temperature of every month is below freezing.';
    }
  }

  // 2. Generate monthly temperature & precipitation averages
  // We model temperatures as a sine wave with a phase shift depending on the hemisphere
  const monthlyAverages = MONTHS.map((month, idx) => {
    let tBase = 25 - (absLat * 0.7); // Base temperature at this latitude
    
    // Seasonal temperature variation (amplitude increases with latitude)
    const amplitude = absLat * 0.35;
    
    // Northern hemisphere peaks in Jul (idx 6), Southern hemisphere in Jan (idx 0)
    const phaseShift = isNorthernHemisphere ? -Math.PI / 2 : Math.PI / 2;
    const rad = (idx / 12) * 2 * Math.PI + phaseShift;
    const temp = Math.round((tBase + amplitude * Math.sin(rad)) * 10) / 10;
    
    // Precipitation modeling based on Köppen zone
    let precip = 50; // default baseline
    let humidity = 65;
    
    if (koppenCode === 'Af') {
      precip = 180 + Math.random() * 60;
      humidity = 82;
    } else if (koppenCode === 'Am') {
      // Monsoon peak in Jun-Sep (Northern) or Dec-Mar (Southern)
      const isMonsoonMonth = isNorthernHemisphere 
        ? (idx >= 5 && idx <= 8) 
        : (idx <= 2 || idx >= 11);
      precip = isMonsoonMonth ? 350 + Math.random() * 150 : 20;
      humidity = isMonsoonMonth ? 88 : 65;
    } else if (koppenCode === 'Aw') {
      const isSummer = isNorthernHemisphere 
        ? (idx >= 4 && idx <= 9) 
        : (idx <= 3 || idx >= 10);
      precip = isSummer ? 150 + Math.random() * 50 : 5;
      humidity = isSummer ? 75 : 50;
    } else if (koppenCode === 'BWh') {
      precip = Math.random() > 0.8 ? 8 : 1;
      humidity = 25;
    } else if (koppenCode === 'BSh') {
      const isWet = isNorthernHemisphere ? (idx >= 6 && idx <= 8) : (idx >= 0 && idx <= 2);
      precip = isWet ? 40 : 5;
      humidity = 40;
    } else if (koppenCode === 'Csa') {
      const isWinter = isNorthernHemisphere 
        ? (idx <= 2 || idx >= 10) 
        : (idx >= 5 && idx <= 8);
      precip = isWinter ? 80 + Math.random() * 30 : 5;
      humidity = isWinter ? 70 : 45;
    } else if (koppenCode === 'Cfb') {
      precip = 65 + Math.random() * 25;
      humidity = 78;
    } else if (koppenCode.startsWith('D')) {
      const isWinter = isNorthernHemisphere 
        ? (idx <= 2 || idx >= 11) 
        : (idx >= 5 && idx <= 8);
      precip = isWinter ? 40 : 80; // snow in winter, rain in summer
      humidity = 72;
    } else if (zone === 'Polar') {
      precip = 10 + Math.random() * 10;
      humidity = 80;
    }
    
    return {
      month,
      temp,
      precip: Math.max(0, Math.round(precip)),
      humidity: Math.min(100, Math.max(10, Math.round(humidity)))
    };
  });

  const annualPrecipitation = monthlyAverages.reduce((sum, m) => sum + m.precip, 0);

  // 3. Simulated ENSO cycle and climate trends
  // 2026 is modeled as slightly warm/wet due to global climate trends
  const tempAnomaly = Math.round((0.8 + (Math.sin(lon + lat) * 0.4)) * 10) / 10; // +0.4C to +1.2C
  const precipAnomaly = Math.round((Math.cos(lat) * 15)); // -15% to +15%
  
  // Determine risks
  const heatwaveRisk = absLat < 55 ? (tempAnomaly > 0.9 ? 'High' : 'Medium') : 'Low';
  const coldwaveRisk = absLat > 40 ? 'High' : (absLat > 25 ? 'Medium' : 'Low');
  const droughtRisk = koppenCode.startsWith('B') || koppenCode === 'Csa' ? 'High' : 'Low';
  const floodRisk = koppenCode.startsWith('A') || koppenCode === 'Cfb' ? 'High' : 'Low';
  
  // ENSO Status (cycles between El Niño / La Niña / Neutral)
  const ensoVal = Math.sin(new Date().getFullYear() + new Date().getMonth() / 12);
  const ensoStatus = ensoVal > 0.3 ? 'El Niño' : (ensoVal < -0.3 ? 'La Niña' : 'Neutral');

  const climateTrend = `Under global warming scenarios, the ${koppenName} zone here is experiencing a significant shift. Average temperatures have risen by ${tempAnomaly}°C over the 1991–2020 base normal, leading to ${annualPrecipitation > 1000 ? 'more intense precipitation events' : 'longer dry spells'} and a ${Math.abs(precipAnomaly)}% anomaly in annual averages.`;

  return {
    koppenCode,
    koppenName,
    description,
    zone,
    monthlyAverages,
    annualPrecipitation,
    tempAnomaly,
    precipAnomaly,
    heatwaveRisk,
    coldwaveRisk,
    droughtRisk,
    floodRisk,
    ensoStatus,
    climateTrend
  };
}
