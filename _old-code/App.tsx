import React, { useEffect, useState } from 'react';
import { fetchWeatherData, getWeatherDescription, getMoonPhase } from './services/weatherService.ts';
import { WeatherData } from './types.ts';
import WeatherBackground from './components/WeatherBackground.tsx';
import Clock from './components/Clock.tsx';
import { getWeatherIcon, SunIcon, MoonIcon, RainIcon, CloudIcon, UVIcon, SunriseIcon, SunsetIcon, NavigationIcon } from './components/WeatherIcons.tsx';
import { REFRESH_INTERVAL_MS } from './constants.ts';

const App: React.FC = () => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTotalRain, setShowTotalRain] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const weather = await fetchWeatherData();
      setData(weather);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load weather data", err);
      setError("SYSTEM OFFLINE");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowTotalRain(prev => !prev);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Helper for Wind Direction Text
  const getWindDirection = (degrees: number): string => {
    const directions = ['NORTH', 'NORTH EAST', 'EAST', 'SOUTH EAST', 'SOUTH', 'SOUTH WEST', 'WEST', 'NORTH WEST'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  if (loading && !data) {
    return <div className="h-screen w-screen flex items-center justify-center bg-black text-[#D4AF37] font-heading text-6xl animate-pulse">LOADING SYSTEM...</div>;
  }

  if (error && !data) {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-red-500 font-heading">
            <div className="text-6xl mb-4">⚠</div>
            <div className="text-4xl tracking-widest">{error}</div>
            <button onClick={loadData} className="mt-8 border border-[#D4AF37] text-[#D4AF37] px-6 py-2 text-xl hover:bg-[#D4AF37] hover:text-black transition-colors">
                RETRY CONNECTION
            </button>
        </div>
    );
  }

  if (!data) return null;

  const { current, daily } = data;
  const todayMax = daily.temperatureMax[0];
  const todayMin = daily.temperatureMin[0];
  
  const now = new Date();
  const todaySunrise = new Date(daily.sunrise[0]);
  const todaySunset = new Date(daily.sunset[0]);
  const tomorrowSunrise = new Date(daily.sunrise[1]);
  const tomorrowSunset = new Date(daily.sunset[1]);

  const displayWeatherCode = current.precipitation > 0 && current.weatherCode < 50 ? 61 : current.weatherCode;
  const displayDescription = current.precipitation > 0 && current.weatherCode < 50 ? "Light Rain" : getWeatherDescription(current.weatherCode);

  let nextSunriseTime = now < todaySunrise ? todaySunrise : tomorrowSunrise;
  let nextSunsetTime = now < todaySunset ? todaySunset : tomorrowSunset;
  
  // Render time with blinking colon using main App state timer
  const renderTimeWithBlink = (d: Date) => {
    let hours = d.getHours() % 12 || 12;
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = d.getHours() >= 12 ? 'pm' : 'am';
    
    const isColonVisible = currentTime.getSeconds() % 2 === 0;

    return (
        <div className="flex items-baseline justify-center">
            <span>{hours}</span>
            <span className={`transition-opacity duration-200 mx-[1px] ${isColonVisible ? 'opacity-100' : 'opacity-20'}`}>:</span>
            <span>{minutes}</span>
            <span className="text-xl text-gray-400 font-bold ml-1 uppercase">{ampm}</span>
        </div>
    );
  };

  // Split "NEW ZEALAND" for justification
  const subTitleChars = "NEW ZEALAND".split('');

  // Info card styling - DARKER & MORE TRANSPARENT
  const glassCardBase = "bg-black/30 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl flex-1 flex flex-col items-center justify-between py-4 px-1 min-w-0 overflow-hidden h-auto relative";
  
  const labelStyle = "text-gray-300 text-xl font-bold uppercase tracking-widest mt-2 truncate w-full text-center drop-shadow-md";
  const valueStyle = "text-4xl font-heading font-bold text-white whitespace-nowrap leading-tight mt-1 drop-shadow-xl";

  // Format UV Peak Time
  const uvPeakTime = current.uvPeak?.time ? new Date(current.uvPeak.time) : new Date();
  const uvPeakTimeStr = uvPeakTime.toLocaleTimeString('en-NZ', {hour: 'numeric', minute:'2-digit'}).replace(" ", "").toLowerCase();

  return (
    <div className="relative h-screen w-screen text-white overflow-hidden bg-[#050505] font-sans flex flex-col selection:bg-[#D4AF37] selection:text-black">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <WeatherBackground 
          weatherCode={displayWeatherCode} 
          isDay={!!current.isDay} 
          sunrise={daily.sunrise[0]}
          sunset={daily.sunset[0]}
          precipitation={current.precipitation}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col flex-1 p-6 pb-0 w-full max-w-[1920px] mx-auto min-h-0">
          
          {/* Header Row */}
          <header className="flex justify-between items-start w-full mb-2 shrink-0">
            {/* Location Container - Width constrained by the Title */}
            <div className="flex flex-col w-max">
              {/* Main Title - Matches Clock Structure */}
              <div className="flex items-baseline justify-start leading-none font-bold font-heading text-white drop-shadow-2xl whitespace-nowrap">
                <span className="text-[6.5rem] tracking-tighter">CHRISTCHURCH</span>
              </div>
              
              {/* Subtitle - Matches Clock Date Row */}
              <div className="w-full border-t-4 border-[#D4AF37] mt-2 pt-2">
                  <div className="flex justify-between items-center w-full">
                    {subTitleChars.map((char, i) => (
                    <span key={i} className="text-2xl text-[#D4AF37] font-bold drop-shadow-md">
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                    ))}
                  </div>
              </div>
            </div>

            {/* Clock & Status - Auto sized to right */}
            <div className="flex flex-col items-end w-max ml-auto">
              <Clock time={currentTime} />
              
              {/* Sync Status - Readable Light Gray */}
              {lastUpdated && (
                <div className="text-gray-300 text-xs font-bold mt-2 tracking-widest uppercase text-right shadow-black drop-shadow-md">
                    DATA SYNC: {lastUpdated.toLocaleTimeString('en-NZ', {hour: '2-digit', minute:'2-digit'})}
                </div>
              )}
            </div>
          </header>

          {/* Main Hero Section - Centered vertically, removed extra bottom padding to prevent header clipping */}
          <div className="flex-1 flex flex-row items-center justify-center gap-12 min-h-0 mb-6">
             {/* Reduced icon size to 18rem */}
             <div className="w-[18rem] h-[18rem] drop-shadow-[0_0_80px_rgba(255,215,0,0.25)] animate-float shrink-0">
                {getWeatherIcon(displayWeatherCode, !!current.isDay, "w-full h-full")}
             </div>
             
             <div className="flex flex-col items-center justify-center shrink-0 min-w-max">
                {/* Temp & High/Low Row */}
                <div className="flex items-center">
                    {/* Temp Container */}
                    <div className="flex items-start leading-none relative py-2">
                      <span className="text-[10rem] font-bold font-heading text-white drop-shadow-2xl z-10">
                        {Math.round(current.temperature)}
                      </span>
                      <span className="text-[5rem] font-heading text-[#D4AF37] mt-4 ml-2">°</span>
                    </div>

                    {/* High/Low Side Panel */}
                    <div className="flex flex-col justify-center ml-10 pl-6 border-l-4 border-[#D4AF37]/30 py-4 gap-2">
                        <div className="text-4xl font-bold tracking-widest text-[#D4AF37]">
                            H <span className="text-white ml-2">{Math.round(todayMax)}°</span>
                        </div>
                        <div className="text-4xl font-bold tracking-widest text-[#D4AF37]/70">
                            L <span className="text-white/70 ml-2">{Math.round(todayMin)}°</span>
                        </div>
                    </div>
                </div>
                
                {/* Description - Centered below the Temp/HiLo block */}
                <div className="text-5xl font-bold text-gray-100 uppercase tracking-wider drop-shadow-lg text-center mt-2">
                  {displayDescription}
                </div>
             </div>
          </div>

          {/* Info Cards Row - Auto height, snug fit */}
          <div className="flex flex-row justify-between gap-4 w-full mb-6 shrink-0">
              
              {/* Box 1: NEXT SUNSET (Renamed) */}
              <div className={glassCardBase}>
                   <div className="flex-1 flex flex-col justify-center items-center">
                       <div className="w-16 h-16 mb-2 relative opacity-60 animate-float">
                          <SunsetIcon className="w-full h-full" />
                       </div>
                       <div className={valueStyle}>
                         {renderTimeWithBlink(nextSunsetTime)}
                       </div>
                   </div>
                   <div className={labelStyle}>NEXT SUNSET</div>
              </div>

              {/* Box 2: WIND - Added Direction Text */}
              <div className={glassCardBase}>
                  <div className="flex-1 flex flex-col justify-center items-center">
                    <div className="animate-float"> 
                        <div className="flex flex-col items-center">
                             <div className="flex items-center gap-3">
                                <NavigationIcon 
                                    size={48} 
                                    className="text-[#D4AF37] drop-shadow-lg" 
                                    style={{ transform: `rotate(${current.windDirection}deg)` }} 
                                    fill="#D4AF37"
                                />
                                <div className={valueStyle}>{Math.round(current.windSpeed)} <span className="text-2xl text-gray-400">KM/H</span></div>
                             </div>
                             {/* Direction Text - Gold - FULL TEXT */}
                             <div className="text-xl font-bold font-heading text-[#D4AF37] mt-1 tracking-wider whitespace-nowrap">
                                {getWindDirection(current.windDirection)}
                             </div>
                        </div>
                    </div>
                  </div>
                  <div className={labelStyle}>Wind</div>
              </div>

              {/* Box 3: RAIN */}
              <div className={glassCardBase}>
                   <div className="flex-1 flex flex-col justify-center items-center">
                    <RainIcon className="w-16 h-16 mb-2 animate-float" />
                    <div className={valueStyle}>
                        {showTotalRain ? daily.rainSum[0] : current.precipitation} <span className="text-2xl text-gray-400">mm</span>
                    </div>
                   </div>
                  <div className={labelStyle}>
                    {showTotalRain ? "Rain (Day)" : "Rain (1hr)"}
                  </div>
              </div>

              {/* Box 4: UV PEAK */}
              <div className={glassCardBase}>
                  <div className="flex-1 flex flex-col justify-center items-center">
                    <UVIcon className="w-16 h-16 mb-1 animate-float" />
                    <div className={valueStyle}>{current.uvPeak?.value.toFixed(1)}</div>
                    <div className="text-lg text-[#D4AF37] font-bold font-heading mt-0 leading-none">
                         @{uvPeakTimeStr}
                    </div>
                  </div>
                  <div className={labelStyle}>UV PEAK</div>
              </div>

              {/* Box 5: MOON */}
              <div className={glassCardBase}>
                  <div className="flex-1 flex flex-col justify-center items-center">
                    <MoonIcon className="w-16 h-16 mb-2" />
                    <div className="text-3xl font-heading font-bold text-[#D4AF37] text-center leading-none mt-2">
                        {getMoonPhase(new Date())}
                    </div>
                  </div>
                  <div className={labelStyle}>Moon</div>
              </div>

              {/* Box 6: NEXT SUNRISE */}
              <div className={glassCardBase}>
                  <div className="flex-1 flex flex-col justify-center items-center">
                    <SunriseIcon className="w-16 h-16 mb-2 animate-float" />
                    <div className={valueStyle}>
                        {renderTimeWithBlink(nextSunriseTime)}
                    </div>
                  </div>
                  <div className={labelStyle}>NEXT SUNRISE</div>
              </div>

          </div>
      </div>

      {/* Footer - 7 Day Forecast */}
      <footer className="relative z-20 w-screen bg-[#0a0a0a]/95 border-t-2 border-[#D4AF37]/50 py-3 pb-6 shadow-[0_-10px_50px_rgba(0,0,0,0.8)] shrink-0">
        
        <div className="flex w-full justify-between px-4">
          {daily.time.slice(1, 8).map((t, index) => {
            const dailyIndex = index + 1;
            const date = new Date(t);
            const dayName = date.toLocaleDateString('en-NZ', { weekday: 'short' }); 
            
            return (
              <div key={t} className="flex-1 flex flex-col items-center justify-center border-r border-white/5 last:border-0 px-1 group">
                <span className="text-2xl text-gray-400 font-bold uppercase mb-1 group-hover:text-white transition-colors">{dayName}</span>
                <div className="w-12 h-12 my-1 transform group-hover:scale-110 transition-transform">
                   {getWeatherIcon(daily.weatherCode[dailyIndex], true, "w-full h-full")}
                </div>
                <div className="flex gap-2 font-heading text-2xl mt-1">
                  <span className="text-white font-bold">{Math.round(daily.temperatureMax[dailyIndex])}°</span>
                  <span className="text-gray-700">|</span>
                  <span className="text-gray-500 font-bold">{Math.round(daily.temperatureMin[dailyIndex])}°</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Bar - Bottom, Thicker, Glowing */}
        <div className="absolute bottom-0 left-0 h-4 bg-[#D4AF37] w-full animate-progress shadow-[0_0_30px_#D4AF37] z-50"></div>
      </footer>
    </div>
  );
};

export default App;