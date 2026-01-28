
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wind, 
  Droplets, 
  CloudRain, 
  Sun, 
  Search, 
  Navigation, 
  RefreshCcw, 
  AlertTriangle,
  Info,
  ExternalLink,
  Thermometer,
  Cloudy,
  Eye,
  Zap,
  ShieldAlert,
  MapPin,
  ChevronRight,
  Activity,
  Waves,
  Clock,
  WifiOff,
  Settings
} from 'lucide-react';
import { WeatherData, GroundingSource, WeatherAlert } from './types';
import { fetchWeatherData } from './services/geminiService';
import { 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';

const VIETNAM_CITIES = [
  "Hà Nội", "Tp Hồ Chí Minh", "Đà Nẵng", "Huế", "Hải Phòng", 
  "Hạ Long", "Cần Thơ", "Nha Trang", "Phú Quốc", "Quy Nhơn", 
  "Hà Giang", "Hội An", "Đồng Hới", "Vinh"
];

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadData = useCallback(async (city: string) => {
    setLoading(true);
    setError(null);
    try {
      // Kiểm tra API Key trước khi gọi
      if (!process.env.API_KEY || process.env.API_KEY === 'undefined') {
        throw new Error("API_KEY chưa được cấu hình trên Netlify.");
      }

      const result = await fetchWeatherData(undefined, undefined, city);
      if (result && result.data) {
        setWeather(result.data);
        const mappedSources = result.sources.map((chunk: any) => ({
          title: chunk.web?.title || 'Google Weather',
          uri: chunk.web?.uri || '#'
        })).filter(s => s.uri !== '#');
        setSources(mappedSources);
      } else {
        throw new Error("Không có dữ liệu trả về từ vệ tinh.");
      }
    } catch (err: any) {
      console.error("App Error:", err);
      setError(err.message || 'Lỗi không xác định khi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData("Hà Nội");
  }, [loadData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      loadData(searchQuery);
    }
  };

  const handleCityClick = (city: string) => {
    setSearchQuery('');
    loadData(city);
  };

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#f59e0b';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#ef4444';
    return '#a855f7';
  };

  const getAqiLabelColor = (aqi: number) => {
    if (aqi <= 50) return 'text-[#10b981]';
    if (aqi <= 100) return 'text-[#f59e0b]';
    if (aqi <= 150) return 'text-[#f97316]';
    if (aqi <= 200) return 'text-[#ef4444]';
    return 'text-[#a855f7]';
  };

  // MÀN HÌNH ĐANG TẢI
  if (loading && !weather) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] p-8 text-center">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-blue-600 blur-[100px] opacity-20 animate-pulse"></div>
          <RefreshCcw className="relative animate-spin text-blue-500" size={60} strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">SkyPulse VN</h2>
        <p className="text-slate-400 text-sm font-medium animate-pulse">Đang kết nối dữ liệu vệ tinh...</p>
      </div>
    );
  }

  // MÀN HÌNH BÁO LỖI
  if (error && !loading) {
    const isApiKeyError = error.includes("API_KEY");
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] p-8 text-center">
        <div className="glass-card rounded-[2.5rem] p-10 max-w-sm w-full border-rose-500/20">
          {isApiKeyError ? (
            <Settings className="text-amber-500 mx-auto mb-6 animate-bounce" size={50} />
          ) : (
            <WifiOff className="text-rose-500 mx-auto mb-6" size={50} />
          )}
          <h2 className="text-2xl font-black text-white mb-4">{isApiKeyError ? 'Cấu hình chưa hoàn tất' : 'Ối! Có lỗi xảy ra'}</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            {error}
            {isApiKeyError && (
              <span className="block mt-4 text-xs bg-white/5 p-4 rounded-xl text-left border border-white/10">
                1. Vào Netlify Site Settings<br/>
                2. Environment variables<br/>
                3. Thêm <code className="text-blue-400">API_KEY</code><br/>
                4. Nhấn <b>Trigger deploy</b> trong tab Deploys.
              </span>
            )}
          </p>
          <button 
            onClick={() => loadData("Hà Nội")}
            className="w-full bg-blue-600 py-4 rounded-2xl font-bold hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            Thử lại ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-36 font-['Plus_Jakarta_Sans']">
      <div className="fixed top-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-0 left-[-10%] w-[400px] h-[400px] bg-indigo-600/5 blur-[120px] pointer-events-none"></div>

      <header className="sticky top-0 z-50 bg-[#020617]/70 backdrop-blur-3xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-6 pt-6 pb-4 space-y-4">
          <form onSubmit={handleSearch} className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm thành phố..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-blue-500/40 focus:bg-white/10 outline-none text-sm font-semibold transition-all"
            />
            <MapPin size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500/40" />
          </form>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar -mx-2 px-2">
            {VIETNAM_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => handleCityClick(city)}
                className="whitespace-nowrap px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-bold text-slate-400 hover:text-white hover:bg-white/10 hover:border-blue-500/50 transition-all active:scale-95"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="px-6 pt-8 space-y-8 max-w-lg mx-auto">
        {weather && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-3">
                <Navigation size={12} className="text-blue-400" />
                <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{weather.location}</span>
              </div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <Clock size={10} /> {weather.lastUpdated}
              </p>
            </div>

            <section className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur opacity-20 transition duration-1000"></div>
              <div className="relative glass-card bg-gradient-to-br from-white/[0.08] to-transparent rounded-[3rem] p-10 flex flex-col items-center">
                <div className="mb-4 relative">
                  {weather.condition.toLowerCase().includes('nắng') || weather.condition.toLowerCase().includes('clear') ? (
                    <Sun size={80} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                  ) : (
                    <Cloudy size={80} className="text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
                  )}
                </div>
                
                <div className="relative mb-2">
                  <span className="text-[7.5rem] font-[900] leading-none tracking-tighter text-glow">
                    {Math.round(weather.temperature)}
                  </span>
                  <span className="text-4xl font-bold text-blue-500 absolute top-4 -right-10">°</span>
                </div>

                <div className="text-center space-y-1 mb-10">
                  <h2 className="text-3xl font-extrabold tracking-tight">{weather.condition}</h2>
                  <p className="text-slate-400 text-sm font-medium">Cảm giác thực tế {weather.feelsLike}°C</p>
                </div>

                <div className="grid grid-cols-3 w-full gap-3">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center hover:bg-white/10 transition-colors">
                    <Wind size={18} className="text-blue-400 mb-2 mx-auto" />
                    <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Gió</span>
                    <p className="text-sm font-black">{weather.windSpeed}<span className="text-[9px] opacity-40 ml-0.5">KM/H</span></p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center hover:bg-white/10 transition-colors">
                    <Droplets size={18} className="text-indigo-400 mb-2 mx-auto" />
                    <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Ẩm</span>
                    <p className="text-sm font-black">{weather.humidity}%</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center hover:bg-white/10 transition-colors">
                    <Activity size={18} className={`${getAqiLabelColor(weather.airQuality.aqi)} mb-2 mx-auto`} />
                    <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">AQI</span>
                    <p className="text-sm font-black">{weather.airQuality.aqi}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="glass-card rounded-[3rem] p-8 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Clock size={18} className="text-blue-500" />
                  </div>
                  <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Nhiệt độ theo giờ</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500">24H Tới</span>
              </div>
              <div className="h-48 w-full -ml-4">
                <ResponsiveContainer width="110%" height="100%">
                  <AreaChart data={weather.hourly}>
                    <defs>
                      <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#475569', fontSize: 10, fontWeight: 700}}
                      dy={10}
                    />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', fontWeight: '800'}} 
                      itemStyle={{color: '#fff'}}
                      cursor={{stroke: 'rgba(59, 130, 246, 0.4)', strokeWidth: 2}}
                    />
                    <Area type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#tempGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="glass-card rounded-[3rem] p-8 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Activity size={18} className="text-emerald-500" />
                  </div>
                  <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Chỉ số AQI theo giờ</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500">24H Tới</span>
              </div>
              <div className="h-48 w-full -ml-4">
                <ResponsiveContainer width="110%" height="100%">
                  <AreaChart data={weather.hourly}>
                    <defs>
                      <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#475569', fontSize: 10, fontWeight: 700}}
                      dy={10}
                    />
                    <YAxis hide domain={[0, 'auto']} />
                    <Tooltip 
                      contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', fontWeight: '800'}} 
                      itemStyle={{color: '#fff'}}
                      cursor={{stroke: 'rgba(16, 185, 129, 0.4)', strokeWidth: 2}}
                    />
                    <Area type="step" dataKey="aqi" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#aqiGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className={`rounded-[3rem] p-8 glass-card border-l-4 transition-all duration-700`} style={{ borderColor: getAqiColor(weather.airQuality.aqi) }}>
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tình trạng không khí</h3>
                   <p className="text-3xl font-black" style={{ color: getAqiColor(weather.airQuality.aqi) }}>{weather.airQuality.status}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Bụi PM2.5</p>
                    <p className="text-xl font-black text-white">{weather.airQuality.pm25} <span className="text-[10px] opacity-40">µg/m³</span></p>
                 </div>
               </div>
               <div className="bg-white/5 rounded-2xl p-5 flex gap-4 border border-white/5">
                 <Info size={20} className="text-blue-400 shrink-0 mt-0.5" />
                 <p className="text-[11px] font-medium leading-relaxed text-slate-300">{weather.airQuality.recommendation}</p>
               </div>
            </section>

            <section className="glass-card rounded-[3rem] p-8">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Dự báo 3 ngày tới</h3>
              <div className="space-y-6">
                {weather.forecast.map((f, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                        {f.condition.includes('Mưa') ? <CloudRain size={20} className="text-blue-400" /> : <Sun size={20} className="text-yellow-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{f.day}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{f.condition}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs font-black text-blue-400">{f.rainChance}%</p>
                        <Waves size={10} className="text-slate-700 ml-auto mt-0.5" />
                      </div>
                      <div className="min-w-[60px] text-right">
                        <p className="text-base font-black text-white">{f.high}°</p>
                        <p className="text-[10px] font-bold text-slate-600">L {f.low}°</p>
                      </div>
                      <div className={`px-2 py-0.5 rounded-md text-[9px] font-black bg-white/5 border border-white/5 ${getAqiLabelColor(f.aqi)}`}>
                        {f.aqi}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-2 gap-5">
              <div className="glass-card rounded-[2.5rem] p-7 border border-white/5">
                <Eye className="text-slate-600 mb-3" size={22} />
                <span className="text-[9px] text-slate-500 uppercase font-black block mb-1">Tầm nhìn</span>
                <span className="text-xl font-black">{weather.visibility} <span className="text-xs font-medium opacity-30 uppercase ml-1">km</span></span>
              </div>
              <div className="glass-card rounded-[2.5rem] p-7 border border-white/5">
                <Zap className="text-slate-600 mb-3" size={22} />
                <span className="text-[9px] text-slate-500 uppercase font-black block mb-1">Chỉ số UV</span>
                <span className="text-xl font-black">{weather.uvIndex} <span className="text-xs font-medium opacity-30 ml-1">/ 11</span></span>
              </div>
            </div>

            <section className="pt-10 pb-8 px-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px bg-white/10 grow"></div>
                <h4 className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] whitespace-nowrap">Dữ liệu từ Google & IQAir</h4>
                <div className="h-px bg-white/10 grow"></div>
              </div>
              <div className="space-y-3">
                {sources.slice(0, 3).map((s, idx) => (
                  <a key={idx} href={s.uri} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-2xl px-5 py-4 text-[11px] text-slate-400 transition-all border border-white/5 active:scale-95">
                    <span className="truncate pr-4 font-bold">{s.title}</span>
                    <ExternalLink size={14} className="shrink-0 text-blue-500/50" />
                  </a>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <div className="fixed bottom-10 left-0 right-0 flex justify-center pointer-events-none px-10">
        <button 
          onClick={() => {
            if (weather) loadData(weather.location);
            else loadData("Hà Nội");
          }}
          disabled={loading}
          className="pointer-events-auto bg-blue-600 hover:bg-blue-500 active:scale-90 text-white px-8 py-5 rounded-[2rem] shadow-[0_20px_40px_rgba(37,99,235,0.4)] flex items-center gap-4 transition-all"
        >
          <div className={loading ? 'animate-spin' : ''}>
            <RefreshCcw size={20} strokeWidth={2.5} />
          </div>
          <span className="text-sm font-black tracking-tight uppercase">{loading ? 'Đang tải...' : 'Cập nhật ngay'}</span>
        </button>
      </div>

      <footer className="mt-12 text-center pb-24 opacity-20">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white">SKY PULSE VN • PRECISION ANALYTICS</p>
      </footer>
    </div>
  );
};

export default App;
