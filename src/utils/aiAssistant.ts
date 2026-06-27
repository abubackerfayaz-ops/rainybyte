export interface WeatherSummaryData {
  currentTemp: number;
  feelsLike: number;
  condition: string;
  rainProbability: number;
  windSpeed: number;
  humidity: number;
  uvIndex: number;
  soilMoisture: number;
  hourlyForecast: { time: string; temp: number; rainChance: number }[];
  dailyForecast: { date: string; tempMax: number; tempMin: number; rainChance: number; summary: string }[];
}

export function answerWeatherQuestion(question: string, weather: WeatherSummaryData): string {
  const q = question.toLowerCase().trim();

  // Helper values
  const isRainLikelyToday = weather.rainProbability > 30 || weather.hourlyForecast.slice(0, 12).some(h => h.rainChance > 40);
  const maxRainChance = Math.max(weather.rainProbability, ...weather.hourlyForecast.slice(0, 12).map(h => h.rainChance));
  
  if (q.includes('will it rain') || q.includes('rain today')) {
    if (isRainLikelyToday) {
      return `Yes, precipitation is highly likely today, with a peak probability of ${maxRainChance}%. I recommend carrying rain gear and planning indoor activities where possible.`;
    }
    return `No rain is expected today. The probability of precipitation remains low at ${weather.rainProbability}%, and cloud cover is minimal. Perfect day to enjoy outdoor activities!`;
  }

  if (q.includes('carry an umbrella') || q.includes('umbrella')) {
    if (isRainLikelyToday) {
      return `Absolutely. There is a ${maxRainChance}% chance of rain within the next 12 hours. Having an umbrella, rain jacket, or waterproof gear on hand is highly recommended.`;
    }
    return `No need to pack an umbrella today! The skies are stable, and the precipitation chance is negligible at ${weather.rainProbability}%.`;
  }

  if (q.includes('wash my car') || q.includes('car')) {
    if (isRainLikelyToday) {
      return `I would recommend holding off on the car wash. There is a strong chance of rain (${maxRainChance}%) today, which will likely ruin the clean finish. Better to wait for a dry window!`;
    }
    const nextFewDaysRain = weather.dailyForecast.slice(1, 4).some(d => d.rainChance > 30);
    if (nextFewDaysRain) {
      return `You can wash it, but keep in mind that rain is forecast within the next 48-72 hours. If you want a long-lasting shine, you might want to wait a few days.`;
    }
    return `Yes! Today is a perfect day to wash your car. Skies are clear, humidity is at ${weather.humidity}%, and dry conditions are expected to persist for the next few days.`;
  }

  if (q.includes('farming') || q.includes('suitable for farming') || q.includes('agriculture')) {
    if (weather.uvIndex > 8) {
      return `Farming activities are viable, but exercise caution during peak hours: the UV index is very high (${weather.uvIndex}). Soil moisture is at ${weather.soilMoisture}%. Irrigation is recommended early in the morning.`;
    }
    if (isRainLikelyToday) {
      return `Rain is expected today (${maxRainChance}% chance). This is great for natural soil irrigation and planting, but postpone any chemical pesticide or fertilizer applications as they might wash away.`;
    }
    if (weather.soilMoisture < 20) {
      return `Soil moisture is low (${weather.soilMoisture}%). Today is excellent for tilling and harvesting, but crops will require supplemental irrigation.`;
    }
    return `Conditions are excellent for agricultural operations today. Wind speeds of ${weather.windSpeed} km/h are well within safe thresholds, and soil moisture is optimal at ${weather.soilMoisture}%.`;
  }

  if (q.includes('drone') || q.includes('fly my drone') || q.includes('uav')) {
    if (weather.windSpeed > 25) {
      return `No, flying conditions are hazardous. Wind speeds are currently at ${weather.windSpeed} km/h (with potential higher gusts), which exceeds safe operating limits for most consumer and commercial drones.`;
    }
    if (isRainLikelyToday) {
      return `Not recommended. The high humidity (${weather.humidity}%) and imminent risk of rain (${maxRainChance}%) can damage drone electronics. Wait for drier conditions.`;
    }
    if (weather.windSpeed > 15) {
      return `Conditions are moderate. You can fly, but be prepared for wind drift at higher altitudes since current surface wind speeds are ${weather.windSpeed} km/h. Keep your drone in visual line-of-sight.`;
    }
    return `Excellent flying weather! Winds are light at ${weather.windSpeed} km/h, visibility is high, and the skies are stable. Ideal conditions for aerial photography.`;
  }

  if (q.includes('hotter') || q.includes('tomorrow hotter')) {
    const todayMax = weather.dailyForecast[0]?.tempMax ?? weather.currentTemp;
    const tomorrowMax = weather.dailyForecast[1]?.tempMax ?? weather.currentTemp;
    const diff = tomorrowMax - todayMax;
    
    if (Math.abs(diff) < 1) {
      return `Tomorrow's temperature will be very similar to today's, hovering around ${tomorrowMax}°C.`;
    }
    if (diff > 0) {
      return `Yes, tomorrow will be warmer. The high is expected to reach ${tomorrowMax}°C, which is about ${diff.toFixed(1)}°C hotter than today's peak of ${todayMax}°C.`;
    }
    return `No, tomorrow will be cooler. The high will top out at ${tomorrowMax}°C, compared to today's maximum of ${todayMax}°C (a decrease of ${Math.abs(diff).toFixed(1)}°C).`;
  }

  if (q.includes('explain today') || q.includes('simply') || q.includes('summary')) {
    return `Today's weather features ${weather.condition.toLowerCase()} with a current temperature of ${weather.currentTemp}°C, which feels like ${weather.feelsLike}°C. Winds are blowing at ${weather.windSpeed} km/h, and relative humidity is at ${weather.humidity}%. Overall, it is a ${isRainLikelyToday ? 'wet and active day requiring caution outdoors' : 'stable, pleasant day perfect for outdoor plans'}.`;
  }

  if (q.includes('humidity') || q.includes('why is humidity')) {
    if (weather.humidity > 75) {
      if (isRainLikelyToday) {
        return `Relative humidity is very high at ${weather.humidity}% because of an active low-pressure system and moisture transport in the atmosphere, signaling incoming precipitation.`;
      }
      return `Humidity is elevated at ${weather.humidity}%. This is typical for coastal locations, areas experiencing moisture-laden winds, or during post-rain evaporation phases where wet ground releases water vapor.`;
    }
    return `Relative humidity is moderate at ${weather.humidity}%. This range (40%-60%) is considered highly comfortable for most indoor and outdoor activities, allowing sweat to evaporate naturally.`;
  }

  if (q.includes('travel') || q.includes('best day')) {
    // Find the day with the lowest rain chance and moderate temperatures
    const bestDay = [...weather.dailyForecast]
      .sort((a, b) => a.rainChance - b.rainChance || Math.abs(a.tempMax - 22) - Math.abs(b.tempMax - 22))[0];
    
    if (bestDay) {
      return `Based on our multi-model projections, the best travel day this week is ${bestDay.date}. It features only a ${bestDay.rainChance}% chance of rain and comfortable high temperatures around ${bestDay.tempMax}°C with ${bestDay.summary.toLowerCase()} conditions.`;
    }
    return `Travel conditions look stable for most of the week. Choose days with rain probability below 30% to avoid airport delays and slick driving conditions.`;
  }

  if (q.includes('event') || q.includes('postpone') || q.includes('outdoor')) {
    if (isRainLikelyToday) {
      return `Yes, postponing or moving the event indoors is highly recommended. The high risk of precipitation (${maxRainChance}%) and humidity level (${weather.humidity}%) makes outdoor logistics highly unpredictable.`;
    }
    if (weather.windSpeed > 25) {
      return `Postponing or securing structures is advised. Winds of ${weather.windSpeed} km/h are strong enough to knock over tents, backdrops, and outdoor audio equipment.`;
    }
    return `No need to postpone. The weather outlook is excellent, with a ${weather.rainProbability}% rain chance, mild winds of ${weather.windSpeed} km/h, and comfortable conditions.`;
  }

  // Fallback conversational answer
  return `Analyzing weather data... The current temperature is ${weather.currentTemp}°C with a ${weather.rainProbability}% chance of precipitation. Winds are blowing at ${weather.windSpeed} km/h and relative humidity is ${weather.humidity}%. Let me know if you'd like advice on travel, drone flights, car washes, or crop planning!`;
}
