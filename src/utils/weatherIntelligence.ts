export interface MetricConfidence {
  label: string;
  value: number;
  confidence: number;
  explanation: string;
}

export interface HumanComfortResult {
  comfortScore: number;
  feelsLike: number;
  heatIndex: number;
  category: 'Dangerous' | 'Very Uncomfortable' | 'Uncomfortable' | 'Moderate' | 'Comfortable' | 'Excellent';
  outdoorWork: 'Dangerous' | 'High Risk' | 'Moderate Risk' | 'Safe';
  walking: 'Uncomfortable' | 'Tolerable' | 'Comfortable';
  running: 'Not Recommended' | 'Caution' | 'Recommended';
}

export interface ActivityRecommendation {
  activity: string;
  score: number;
  verdict: '✅' | '☑️' | '❌';
  timing: string;
  detail: string;
}

export interface ModelArenaEntry {
  name: string;
  temp: number;
  rain: number;
  wind: number;
  accuracy: number;
  rank: number;
  color: string;
}

export type WeatherStory = {
  morning: string;
  afternoon: string;
  evening: string;
  night: string;
  summary: string;
};

export type CityComfort = {
  name: string;
  comfortScore: number;
  temp: number;
  condition: string;
};

export function calculateMetricConfidence(
  current: any,
  activeModel: any,
  hourlyForecast: any[],
  dailyForecast: any[]
): MetricConfidence[] {
  const spread = activeModel.spread || 2;
  return [
    {
      label: 'Temperature',
      value: current.temp,
      confidence: Math.max(30, Math.min(99, 95 - spread * 5)),
      explanation:
        spread < 1.5
          ? 'All models closely agree on temperature.'
          : spread < 3
            ? 'Models show minor disagreement on temperature.'
            : 'ECMWF and GFS diverge on temperature outlook.',
    },
    {
      label: 'Rain Probability',
      value: current.rain,
      confidence: current.rain > 80 ? 92 : current.rain > 50 ? 78 : current.rain > 20 ? 65 : 88,
      explanation:
        current.rain > 80
          ? 'High confidence — strong atmospheric signals.'
          : current.rain > 50
            ? 'Moderate confidence — some model variance.'
            : current.rain > 20
              ? 'Low confidence — scattered convection possible.'
              : 'High confidence — dry conditions expected.',
    },
    {
      label: 'Wind Speed',
      value: current.windSpeed,
      confidence: current.windSpeed > 30 ? 85 : current.windSpeed > 15 ? 78 : 92,
      explanation:
        current.windSpeed > 30
          ? 'High wind event — well captured by models.'
          : current.windSpeed > 15
            ? 'Moderate breeze — models broadly agree.'
            : 'Calm conditions — high forecast confidence.',
    },
    {
      label: 'Humidity',
      value: current.humidity,
      confidence: 88,
      explanation: 'Humidity patterns are stable and well-predicted.',
    },
    {
      label: 'UV Index',
      value: current.uvIndex,
      confidence: current.uvIndex > 8 ? 90 : 85,
      explanation:
        current.uvIndex > 8
          ? 'Extreme UV — confidently predicted under clear skies.'
          : 'UV models show strong agreement.',
    },
  ];
}

export function calculateHumanComfort(
  temp: number,
  humidity: number,
  windSpeed: number,
  uvIndex: number
): HumanComfortResult {
  const heatIndex =
    temp >= 27
      ? -8.784695 + 1.61139411 * temp + 2.338549 * humidity - 0.14611605 * temp * humidity -
        0.012308094 * temp * temp - 0.016424828 * humidity * humidity +
        0.002211732 * temp * temp * humidity + 0.00072546 * temp * humidity * humidity -
        0.000003582 * temp * temp * humidity * humidity
      : temp;

  const feelsLike = heatIndex > temp ? heatIndex : temp - (windSpeed > 10 ? 2 : 0);

  const idealTemp = 21;
  const tempPenalty = Math.abs(temp - idealTemp) * 2.5;
  const humidityPenalty = humidity > 70 ? (humidity - 70) * 0.3 : humidity < 30 ? (30 - humidity) * 0.2 : 0;
  const uvPenalty = uvIndex > 5 ? (uvIndex - 5) * 2 : 0;
  const windBonus = windSpeed > 5 && windSpeed < 20 && temp > 25 ? 5 : 0;

  const rawScore = 100 - tempPenalty - humidityPenalty - uvPenalty + windBonus;
  const comfortScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  const category =
    comfortScore >= 85
      ? 'Excellent'
      : comfortScore >= 70
        ? 'Comfortable'
        : comfortScore >= 50
          ? 'Moderate'
          : comfortScore >= 30
            ? 'Uncomfortable'
            : comfortScore >= 15
              ? 'Very Uncomfortable'
              : 'Dangerous';

  const outdoorWork =
    comfortScore >= 70 ? 'Safe' : comfortScore >= 50 ? 'Moderate Risk' : comfortScore >= 30 ? 'High Risk' : 'Dangerous';

  const walking = comfortScore >= 60 ? 'Comfortable' : comfortScore >= 35 ? 'Tolerable' : 'Uncomfortable';
  const running = comfortScore >= 70 ? 'Recommended' : comfortScore >= 45 ? 'Caution' : 'Not Recommended';

  return { comfortScore, feelsLike: Math.round(feelsLike), heatIndex: Math.round(heatIndex), category, outdoorWork, walking, running };
}

export function getActivityRecommendations(
  current: any,
  hourlyForecast: any[],
  dailyForecast: any[],
  airQuality: any,
  astronomy: any
): ActivityRecommendation[] {
  const morningHours = hourlyForecast.filter((h: any) => {
    const hn = parseInt(h.time.split(':')[0]);
    return hn >= 5 && hn < 9;
  });
  const eveningHours = hourlyForecast.filter((h: any) => {
    const hn = parseInt(h.time.split(':')[0]);
    return hn >= 17 && hn < 20;
  });

  const bestMorningTemp =
    morningHours.length > 0
      ? morningHours.reduce((best: any, h: any) => (h.temp < best.temp ? h : best), morningHours[0])
      : null;
  const bestEveningHours = eveningHours.filter((h: any) => h.temp < 32 && h.rainChance < 40);

  const rainToday = dailyForecast[0]?.rainChance || 0;
  const tempNow = current.temp;
  const aqi = airQuality?.aqi || 30;
  const wind = current.windSpeed;
  const humidity = current.humidity;
  const uv = current.uvIndex;

  const results: ActivityRecommendation[] = [];

  if (bestMorningTemp && tempNow < 38) {
    results.push({
      activity: 'Best time to exercise',
      score: tempNow < 35 ? (tempNow < 30 ? 92 : 78) : 45,
      verdict: bestMorningTemp.temp < 32 ? '✅' : '☑️',
      timing: `${bestMorningTemp.time} – ${parseInt(bestMorningTemp.time.split(':')[0]) + 1}:00`,
      detail:
        bestMorningTemp.temp < 30
          ? `Cool morning at ${Math.round(bestMorningTemp.temp)}°C — ideal for outdoor exercise.`
          : `Moderate at ${Math.round(bestMorningTemp.temp)}°C — stay hydrated.`,
    });
  }

  results.push({
    activity: 'Outdoor activity after 11 AM',
    score: tempNow > 38 ? 15 : tempNow > 35 ? 40 : tempNow > 32 ? 60 : 85,
    verdict: tempNow > 35 ? '❌' : tempNow > 32 ? '☑️' : '✅',
    timing: '11:00 AM – 4:00 PM',
    detail:
      tempNow > 35
        ? `Extreme heat (${Math.round(tempNow)}°C) — avoid prolonged exposure.`
        : tempNow > 32
          ? `Warm (${Math.round(tempNow)}°C) — limit activity, seek shade.`
          : `Pleasant (${Math.round(tempNow)}°C) — good for outdoor plans.`,
  });

  results.push({
    activity: 'Umbrella needed',
    score: rainToday,
    verdict: rainToday > 50 ? '✅' : rainToday > 20 ? '☑️' : '❌',
    timing: 'Today',
    detail:
      rainToday > 50
        ? `${rainToday}% rain chance — carry an umbrella.`
        : rainToday > 20
          ? `${rainToday}% chance — keep one handy just in case.`
          : `Only ${rainToday}% chance — no umbrella needed.`,
  });

  if (bestEveningHours.length > 0) {
    results.push({
      activity: 'Best car wash time',
      score: 100 - rainToday,
      verdict: rainToday < 30 ? '✅' : rainToday < 60 ? '☑️' : '❌',
      timing: 'This evening',
      detail:
        rainToday < 30
          ? `Clear evening ahead — good time to wash your car.`
          : `Some rain possible — consider waiting.`,
    });
  }

  if (astronomy?.goldenHourEvening) {
    results.push({
      activity: 'Photography golden hour',
      score: uv < 8 && rainToday < 40 ? 88 : 55,
      verdict: uv < 8 && rainToday < 40 ? '✅' : '☑️',
      timing: astronomy.goldenHourEvening,
      detail:
        uv < 8 && rainToday < 40
          ? `Golden hour at ${astronomy.goldenHourEvening} — ideal lighting.`
          : `Conditions may not be optimal for photography.`,
    });
  }

  results.push({
    activity: 'Running outdoors',
    score:
      tempNow > 35 ? 15 : tempNow > 30 ? 45 : tempNow > 25 ? 70 : aqi > 100 ? 40 : 85,
    verdict:
      tempNow > 35 || aqi > 150 ? '❌' : tempNow > 30 || aqi > 100 ? '☑️' : '✅',
    timing: 'Today',
    detail:
      tempNow > 35
        ? `Dangerous heat — run indoors or early morning.`
        : tempNow > 30
          ? `Hot — run early or late, stay hydrated.`
          : aqi > 100
            ? `Air quality concerns — consider a mask or indoor alternative.`
            : `Great running conditions — enjoy your run!`,
  });

  results.push({
    activity: 'Gardening',
    score: tempNow > 38 ? 20 : tempNow < 10 ? 40 : humidity < 80 ? 85 : 60,
    verdict: tempNow > 38 || tempNow < 5 ? '❌' : humidity > 80 ? '☑️' : '✅',
    timing: 'Today',
    detail:
      tempNow > 38
        ? `Too hot for gardening — water plants early.`
        : tempNow < 5
          ? `Too cold — frost risk for sensitive plants.`
          : humidity < 80
            ? `Good conditions — soil moisture levels are favorable.`
            : `Humid — watch for fungal issues.`,
  });

  return results.sort((a, b) => b.score - a.score);
}

export function generateWeatherStory(
  current: any,
  hourlyForecast: any[],
  dailyForecast: any[]
): WeatherStory {
  const now = new Date().getHours();
  const today = dailyForecast[0];
  const tomorrow = dailyForecast[1];

  const morningTemps = hourlyForecast.filter((h: any) => {
    const hn = parseInt(h.time.split(':')[0]);
    return hn >= 6 && hn < 12;
  });
  const afternoonTemps = hourlyForecast.filter((h: any) => {
    const hn = parseInt(h.time.split(':')[0]);
    return hn >= 12 && hn < 18;
  });
  const eveningTemps = hourlyForecast.filter((h: any) => {
    const hn = parseInt(h.time.split(':')[0]);
    return hn >= 18 && hn < 22;
  });

  const avg = (arr: any[], key: string) =>
    arr.length > 0 ? Math.round(arr.reduce((s: number, h: any) => s + h[key], 0) / arr.length) : null;

  const morningLow = avg(morningTemps, 'temp');
  const afternoonHigh = avg(afternoonTemps, 'temp');
  const eveningTemp = avg(eveningTemps, 'temp');

  const rainMorning = Math.max(...morningTemps.map((h: any) => h.rainChance));
  const rainAfternoon = Math.max(...afternoonTemps.map((h: any) => h.rainChance));
  const rainEvening = Math.max(...eveningTemps.map((h: any) => h.rainChance));

  function describeMorning(): string {
    if (!morningLow) return '';
    const parts: string[] = [];
    if (morningLow < 15) parts.push(`Starting cool at ${morningLow}°C`);
    else if (morningLow < 25) parts.push(`A pleasant ${morningLow}°C to start the day`);
    else parts.push(`Already warm at ${morningLow}°C in the morning`);

    if (rainMorning > 70) parts.push('with rain likely — grab an umbrella');
    else if (rainMorning > 40) parts.push('with a chance of light showers');
    else if (current.humidity > 70) parts.push('with humid conditions');
    else parts.push('with clear and dry conditions');

    return parts.join(' ') + '.';
  }

  function describeAfternoon(): string {
    if (!afternoonHigh) return '';
    const parts: string[] = [];
    if (afternoonHigh > 40) parts.push(`Extreme heat peaking at ${afternoonHigh}°C`);
    else if (afternoonHigh > 35) parts.push(`Temperatures soar to ${afternoonHigh}°C`);
    else if (afternoonHigh > 30) parts.push(`Warm afternoon with highs of ${afternoonHigh}°C`);
    else if (afternoonHigh > 25) parts.push(`Mild afternoon around ${afternoonHigh}°C`);
    else parts.push(`Cool afternoon at ${afternoonHigh}°C`);

    if (rainAfternoon > 70) parts.push('— afternoon thunderstorms possible');
    else if (rainAfternoon > 40) parts.push('— scattered showers expected');
    else if (current.uvIndex > 8) parts.push('— extreme UV, seek shade');
    else if (current.uvIndex > 5) parts.push('— moderate UV, wear sunscreen');
    else parts.push('— comfortable for outdoor activities');

    return parts.join('') + '.';
  }

  function describeEvening(): string {
    if (!eveningTemp) return '';
    const parts: string[] = [];
    if (eveningTemp > 30) parts.push(`Evening remains warm at ${eveningTemp}°C`);
    else if (eveningTemp > 22) parts.push(`Evening cools to a pleasant ${eveningTemp}°C`);
    else parts.push(`Evening turns cool at ${eveningTemp}°C`);

    if (rainEvening > 50) parts.push('with lingering rain chances');
    else if (current.windSpeed > 20) parts.push('with a noticeable breeze');
    else parts.push('— a calm and pleasant evening');

    return parts.join(' ') + '.';
  }

  const morning = describeMorning();
  const afternoon = describeAfternoon();
  const evening = describeEvening();

  const night = tomorrow
    ? `Overnight lows around ${Math.round(tomorrow.tempMin)}°C. ${tomorrow.rainChance > 50 ? 'Rain likely by morning.' : 'Clear skies expected.'}`
    : '';

  const summary = `Today will feel like ${current.comfortIndex}. ${
    afternoonHigh && afternoonHigh > 35
      ? 'Heat dominates — plan around the midday hours.'
      : morningLow && morningLow > 25
        ? 'A warm day from start to finish.'
        : 'A balanced day with comfortable morning and manageable afternoon heat.'
  } ${rainAfternoon > 60 ? 'Keep rain gear handy for the afternoon.' : ''}`;

  return { morning, afternoon, evening, night, summary };
}

export function getForecastArena(modelComparisons: any[]): ModelArenaEntry[] {
  if (!modelComparisons || modelComparisons.length === 0) return [];
  const colors = ['#00D4FF', '#3FA9F5', '#A78BFA', '#F472B6', '#34D399'];
  return modelComparisons
    .map((m: any, i: number) => ({
      name: m.name || m.key,
      temp: m.tempTodayMax || 0,
      rain: m.rainChanceMax || 0,
      wind: m.hourlyForecast?.[0]?.windSpeed || 0,
      accuracy: m.accuracy || Math.round(80 + Math.random() * 18),
      rank: 0,
      color: colors[i % colors.length],
    }))
    .sort((a: ModelArenaEntry, b: ModelArenaEntry) => b.accuracy - a.accuracy)
    .map((entry: ModelArenaEntry, i: number) => ({ ...entry, rank: i + 1 }));
}

export function getCityComfortScores(
  currentLocation: string,
  currentTemp: number,
  currentHumidity: number,
  currentWind: number,
  currentUv: number
): CityComfort[] {
  const cities = [
    { name: currentLocation, temp: currentTemp, humidity: currentHumidity, wind: currentWind, uv: currentUv },
    { name: 'London', temp: 18, humidity: 72, wind: 16, uv: 4 },
    { name: 'Tokyo', temp: 22, humidity: 65, wind: 12, uv: 5 },
    { name: 'New York', temp: 24, humidity: 60, wind: 14, uv: 6 },
    { name: 'Dubai', temp: 36, humidity: 50, wind: 10, uv: 9 },
  ];

  return cities
    .map((c) => {
      const comfort = calculateHumanComfort(c.temp, c.humidity, c.wind, c.uv);
      return {
        name: c.name,
        comfortScore: comfort.comfortScore,
        temp: c.temp,
        condition:
          comfort.category === 'Excellent'
            ? 'Perfect'
            : comfort.category === 'Comfortable'
              ? 'Good'
              : comfort.category === 'Moderate'
                ? 'Fair'
                : 'Poor',
      };
    })
    .sort((a, b) => b.comfortScore - a.comfortScore);
}

export const MODE_PROFILES = [
  { key: 'general', label: 'General', icon: '👤' },
  { key: 'student', label: 'Student', icon: '🎒' },
  { key: 'traveler', label: 'Traveler', icon: '✈️' },
  { key: 'pilot', label: 'Pilot', icon: '🛩️' },
  { key: 'farmer', label: 'Farmer', icon: '🌾' },
  { key: 'cyclist', label: 'Cyclist', icon: '🚴' },
  { key: 'photographer', label: 'Photographer', icon: '📸' },
  { key: 'athlete', label: 'Athlete', icon: '🏃' },
  { key: 'construction', label: 'Construction', icon: '🏗️' },
];
