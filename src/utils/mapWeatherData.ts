import type { WeatherSummaryData } from './aiAssistant';

export function mapWeatherToSummary(weatherData: any): WeatherSummaryData {
  const current = weatherData?.current || {};
  const dailyForecast = weatherData?.dailyForecast || [];
  const hourlyForecast = weatherData?.hourlyForecast || [];
  const agriculture = weatherData?.agriculture || {};

  const todayRainChance = dailyForecast[0]?.rainChance || 0;
  const hourlyRainMax = hourlyForecast.length > 0
    ? Math.max(...hourlyForecast.map((h: any) => h.rainChance || 0))
    : 0;
  const rainProbability = Math.max(todayRainChance, hourlyRainMax);

  return {
    currentTemp: current.temp ?? 22,
    feelsLike: current.feelsLike ?? current.temp ?? 22,
    condition: current.condition ?? 'Clear',
    rainProbability,
    windSpeed: current.windSpeed ?? 10,
    humidity: current.humidity ?? 50,
    uvIndex: current.uvIndex ?? 5,
    soilMoisture: agriculture.soilMoisture ?? 50,
    hourlyForecast: hourlyForecast.map((h: any) => ({
      time: h.time ?? '',
      temp: h.temp ?? 22,
      rainChance: h.rainChance ?? 0,
    })),
    dailyForecast: dailyForecast.map((d: any) => ({
      date: d.date ?? '',
      tempMax: d.tempMax ?? 25,
      tempMin: d.tempMin ?? 15,
      rainChance: d.rainChance ?? 0,
      summary: d.summary ?? d.condition ?? 'Clear',
    })),
  };
}
