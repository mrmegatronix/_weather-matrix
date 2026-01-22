import { WeatherData } from '../types.ts';
import { CHRISTCHURCH_COORDS } from '../constants.ts';

export const fetchWeatherData = async (): Promise<WeatherData> => {
  const params = new URLSearchParams({
    latitude: CHRISTCHURCH_COORDS.lat.toString(),
    longitude: CHRISTCHURCH_COORDS.lon.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
      'wind_direction_10m'
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'rain_sum'
    ].join(','),
    hourly: [
      'temperature_2m',
      'uv_index'
    ].join(','),
    timezone: 'Pacific/Auckland',
    forecast_days: '8'
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch weather data: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  // Get current hour index for UV
  const currentHour = new Date().getHours();
  const currentUV = data.hourly.uv_index[currentHour] || 0;

  // Calculate Daily Peak UV (First 24 hours)
  // Open-Meteo returns hourly data starting from 00:00 of the requested day
  const uvToday = data.hourly.uv_index.slice(0, 24);
  const maxUV = Math.max(...uvToday);
  const maxUVIndex = uvToday.indexOf(maxUV);
  const maxUVTimeStr = data.hourly.time[maxUVIndex];

  return {
    current: {
      temperature: data.current.temperature_2m,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day,
      time: data.current.time,
      humidity: data.current.relative_humidity_2m,
      apparentTemperature: data.current.apparent_temperature,
      precipitation: data.current.precipitation,
      uvIndex: currentUV, 
      uvPeak: {
        value: maxUV,
        time: maxUVTimeStr
      }
    },
    daily: {
      time: data.daily.time,
      weatherCode: data.daily.weather_code,
      temperatureMax: data.daily.temperature_2m_max,
      temperatureMin: data.daily.temperature_2m_min,
      sunrise: data.daily.sunrise,
      sunset: data.daily.sunset,
      uvIndexMax: data.daily.uv_index_max,
      rainSum: data.daily.rain_sum,
    },
    hourly: data.hourly,
    dailyUnits: {
      temperatureMax: data.daily_units.temperature_2m_max,
    }
  };
};

export const getWeatherDescription = (code: number): string => {
  switch (code) {
    case 0: return 'Clear Sky';
    case 1: return 'Mainly Clear';
    case 2: return 'Partly Cloudy';
    case 3: return 'Overcast';
    case 45: case 48: return 'Foggy';
    case 51: case 53: case 55: return 'Drizzle';
    case 56: case 57: return 'Freezing Drizzle';
    case 61: case 63: return 'Rain';
    case 65: return 'Heavy Rain';
    case 66: case 67: return 'Freezing Rain';
    case 71: case 73: case 75: return 'Snow Fall';
    case 77: return 'Snow Grains';
    case 80: case 81: case 82: return 'Rain Showers';
    case 85: case 86: return 'Snow Showers';
    case 95: return 'Thunderstorm';
    case 96: case 99: return 'Thunderstorm & Hail';
    default: return 'Unknown';
  }
};

export const getMoonPhase = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  let c = 0;
  let e = 0;
  let jd = 0;
  let b = 0;

  let y = year;
  let m = month;

  if (month < 3) {
    y--;
    m += 12;
  }

  ++m;
  c = 365.25 * y;
  e = 30.6 * m;
  jd = c + e + day - 694039.09; 
  jd /= 29.5305882; 
  b = parseInt(jd.toString()); 
  jd -= b; 
  b = Math.round(jd * 8); 

  if (b >= 8) b = 0; 

  switch (b) {
    case 0: return 'New Moon';
    case 1: return 'Waxing Crescent';
    case 2: return 'First Quarter';
    case 3: return 'Waxing Gibbous';
    case 4: return 'Full Moon';
    case 5: return 'Waning Gibbous';
    case 6: return 'Last Quarter';
    case 7: return 'Waning Crescent';
    default: return 'New Moon';
  }
};