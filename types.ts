
export interface WeatherAlert {
  type: string;
  severity: 'Thông tin' | 'Cảnh báo' | 'Nguy hiểm' | 'Khẩn cấp';
  message: string;
}

export interface HourlyData {
  time: string;
  temp: number;
  aqi: number;
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  uvIndex: number;
  visibility: number;
  feelsLike: number;
  airQuality: AirQualityData;
  forecast: ForecastDay[];
  hourly: HourlyData[]; // Dữ liệu theo giờ cho biểu đồ
  lastUpdated: string;
  alerts?: WeatherAlert[];
}

export interface AirQualityData {
  aqi: number;
  pm25: number;
  pm10: number;
  status: 'Tốt' | 'Trung bình' | 'Kém' | 'Xấu' | 'Rất xấu' | 'Nguy hại';
  primaryPollutant: string;
  recommendation: string;
}

export interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: string;
  rainChance: number;
  aqi: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}
