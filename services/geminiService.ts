
import { GoogleGenAI } from "@google/genai";
import { WeatherData } from "../types";

export const fetchWeatherData = async (latitude?: number, longitude?: number, city?: string): Promise<{ data: WeatherData, sources: any[] }> => {
  // Luôn tạo instance mới để đảm bảo lấy API_KEY mới nhất từ môi trường
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const locationQuery = city ? city : (latitude && longitude ? `${latitude}, ${longitude}` : "Hà Nội");
  
  const prompt = `
    Cung cấp dữ liệu thời tiết thực tế và chất lượng không khí (AQI) cho địa điểm: ${locationQuery}.
    Yêu cầu dữ liệu chính xác nhất từ các nguồn tin cậy như Google Search, OpenWeather, IQAir.
    
    Định dạng JSON yêu cầu (BẮT BUỘC):
    {
      "location": "Tên thành phố chính xác",
      "temperature": số (độ C),
      "condition": "Trạng thái thời tiết bằng tiếng Việt",
      "description": "Mô tả ngắn gọn",
      "humidity": số (%),
      "windSpeed": số (km/h),
      "rainProbability": số (%),
      "uvIndex": số,
      "visibility": số (km),
      "feelsLike": số (độ C),
      "airQuality": {
        "aqi": số (chỉ số AQI thực tế),
        "pm25": số (µg/m³),
        "pm10": số (µg/m³),
        "status": "Tốt/Trung bình/Kém/Xấu/Rất xấu/Nguy hại",
        "primaryPollutant": "PM2.5",
        "recommendation": "Lời khuyên sức khỏe cụ thể"
      },
      "hourly": [
        {"time": "06:00", "temp": số, "aqi": số},
        {"time": "09:00", "temp": số, "aqi": số},
        {"time": "12:00", "temp": số, "aqi": số},
        {"time": "15:00", "temp": số, "aqi": số},
        {"time": "18:00", "temp": số, "aqi": số},
        {"time": "21:00", "temp": số, "aqi": số},
        {"time": "00:00", "temp": số, "aqi": số}
      ],
      "forecast": [
        {"day": "Thứ...", "high": số, "low": số, "condition": "Trạng thái", "rainChance": số, "aqi": số}
      ],
      "alerts": [],
      "lastUpdated": "HH:mm DD/MM/YYYY"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1, // Giảm độ ngẫu nhiên để JSON ổn định hơn
      },
    });

    const rawText = response.text || "";
    // Tìm kiếm khối JSON trong phản hồi để tránh lỗi nếu AI trả về kèm Markdown
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Dữ liệu trả về không đúng định dạng. Vui lòng thử lại.");
    }
    
    const data = JSON.parse(jsonMatch[0]) as WeatherData;
    
    // Đảm bảo các mảng dữ liệu luôn tồn tại
    if (!data.hourly) data.hourly = [];
    if (!data.forecast) data.forecast = [];

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { data, sources };
  } catch (error: any) {
    console.error("Fetch Error:", error);
    // Phân loại lỗi để thông báo rõ hơn cho người dùng
    if (error.message?.includes("403") || error.message?.includes("API key")) {
      throw new Error("Lỗi xác thực API. Hãy kiểm tra biến môi trường API_KEY trên Netlify.");
    }
    throw new Error("Không thể kết nối với dịch vụ thời tiết. Vui lòng thử lại sau.");
  }
};
