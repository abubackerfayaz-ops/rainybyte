export interface FavoriteLocation {
  name: string;
  lat: number;
  lon: number;
}

export interface Location {
  name: string;
  lat: number;
  lon: number;
  countryCode: string;
}

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGust: number;
  cloudCover: number;
  uvIndex: number;
  visibility: number;
  condition: string;
  icon: string;
  rain: number;
  snow: number;
  lightningProbability: number;
  sunrise: string;
  sunset: string;
  comfortIndex: string;
  aqi: number;
}

export interface ActiveModel {
  key: string;
  name: string;
  source: string;
  accuracy: number;
  description: string;
  confidence: number;
  spread: number;
}

export interface ModelComparison {
  key: string;
  name: string;
  accuracy: number;
  description: string;
  tempTodayMax: number;
  tempTodayMin: number;
  rainChanceMax: number;
  hourlyForecast: { time: string; temp: number; rainChance: number }[];
}

export interface HourlyForecast {
  time: string;
  temp: number;
  feelsLike: number;
  rainChance: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  uv: number;
  visibility: number;
}

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  feelsMax: number;
  feelsMin: number;
  rainChance: number;
  rainSum: number;
  windSpeedMax: number;
  uvMax: number;
  summary: string;
  icon: string;
}

export interface AirQuality {
  aqi: number;
  pm2_5: number;
  pm10: number;
  ozone: number;
  co: number;
  no2: number;
  so2: number;
}

export interface Agriculture {
  soilMoisture: number;
  soilTemp: number;
  evapotranspiration: number;
  irrigationAdvice: string;
  cropFrostRisk: string;
}

export interface Astronomy {
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
}

export interface Travel {
  hikingScore: number;
  beachScore: number;
  drivingScore: number;
  sailingScore: number;
  skiScore: number;
}

export interface Alert {
  id: string;
  severity: 'Warning' | 'Advisory' | 'Info';
  title: string;
  message: string;
  source: string;
}

export interface WeatherResponse {
  location: Location;
  current: CurrentWeather;
  activeModel: ActiveModel;
  modelComparisons: ModelComparison[];
  hourlyForecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
  airQuality: AirQuality;
  agriculture: Agriculture;
  astronomy: Astronomy;
  travel: Travel;
  alerts: Alert[];
}
