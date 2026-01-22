// Config
const CONFIG = {
    LAT: -43.5321,
    LON: 172.6362,
    API_URL: "https://api.open-meteo.com/v1/forecast",
    REFRESH_RATE: 1000 * 60 * 15, // 15 minutes for weather
};

// State
let weatherData = null;

// DOM Elements
const els = {
    clockHours: document.getElementById('clock-hours'),
    clockMinutes: document.getElementById('clock-minutes'),
    amPm: document.getElementById('am-pm'),
    dateDisplay: document.getElementById('date-display'),
    
    // Header Location
    cityName: document.getElementById('city-name'),
    countryName: document.getElementById('country-name'),

    // Main Weather
    currentIconContainer: document.getElementById('current-icon-container'),
    currTemp: document.getElementById('current-temp'),
    currCond: document.getElementById('current-condition'),
    tempHigh: document.getElementById('temp-high'),
    tempLow: document.getElementById('temp-low'),

    // Dashboard Cards
    sunriseTime: document.getElementById('sunrise-time'),
    sunriseIcon: document.getElementById('sunrise-icon'),

    windSpeed: document.getElementById('wind-speed'),
    windDir: document.getElementById('wind-direction'),
    windIcon: document.getElementById('wind-icon'),

    rainAmount: document.getElementById('rain-amount'),
    rainIcon: document.getElementById('rain-icon'),

    sunsetTime: document.getElementById('sunset-time'),
    sunsetIcon: document.getElementById('sunset-icon'),

    // Footer
    forecastContainer: document.getElementById('forecast-container'),
};

// --- Icons (SVGs) ---
const ICONS = {
    // High-quality SVG definitions with gradients
    sun: `<svg viewBox="0 0 24 24" class="animated-icon sun"><defs><linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#fce288;stop-opacity:1" /><stop offset="100%" style="stop-color:#d4af37;stop-opacity:1" /></linearGradient></defs><circle cx="12" cy="12" r="5" fill="url(#gold-gradient)" /><g stroke="url(#gold-gradient)" stroke-width="2"><line x1="12" y1="1" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="6.34" y2="17.66" /><line x1="17.66" y1="6.34" x2="19.78" y2="4.22" /></g></svg>`,
    
    moon: `<svg viewBox="0 0 24 24" class="animated-icon moon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="url(#gold-gradient)"/></svg>`,
    
    cloud: `<svg viewBox="0 0 24 24" class="animated-icon cloud"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="url(#gold-gradient)" opacity="0.8"/></svg>`,
    
    rain: `<svg viewBox="0 0 24 24" class="animated-icon rain"><path d="M16 13v8" stroke="url(#gold-gradient)" stroke-width="2"/><path d="M12 13v8" stroke="url(#gold-gradient)" stroke-width="2"/><path d="M8 13v8" stroke="url(#gold-gradient)" stroke-width="2"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 3 16.29" fill="none" stroke="url(#gold-gradient)" stroke-width="2"/></svg>`,
    
    wind: `<svg viewBox="0 0 24 24" class="animated-icon wind"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" fill="none" stroke="url(#gold-gradient)" stroke-width="2" stroke-linecap="round"/></svg>`,
    
    sunrise: `<svg viewBox="0 0 24 24"><path d="M12 19V6M5 12l7-7 7 7" stroke="url(#gold-gradient)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 18h2M5 18h2" stroke="url(#gold-gradient)" opacity="0.5"/></svg>`, 
    sunset: `<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7" stroke="url(#gold-gradient)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 18h2M5 18h2" stroke="url(#gold-gradient)" opacity="0.5"/></svg>`, 
};

// --- Time & Date ---
function updateTime() {
    const now = new Date();
    
    // 12-hour Clock
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const amPm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; 
    
    els.clockHours.textContent = h.toString().padStart(2, '0');
    els.clockMinutes.textContent = m;
    els.amPm.textContent = amPm;
    
    // Date: "WEDNESDAY, 21 JANUARY"
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    els.dateDisplay.textContent = now.toLocaleDateString('en-NZ', options).toUpperCase();
}

// --- Weather Data ---
async function fetchWeather() {
    try {
        const params = new URLSearchParams({
            latitude: CONFIG.LAT,
            longitude: CONFIG.LON,
            current: "temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day,precipitation",
            daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset",
            timezone: "auto",
            forecast_days: 7 
        });

        const res = await fetch(`${CONFIG.API_URL}?${params}`);
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        
        updateWeatherUI(data);
        
    } catch (e) {
        console.error("Fetch Error", e);
        if(els.currCond) els.currCond.textContent = "Offline";
        // Optionally retry or show cached data
    }
}

function updateWeatherUI(data) {
    if (!data || !data.current || !data.daily) return;
    
    const current = data.current;
    const daily = data.daily;
    const todayIndex = 0; 
    
    // Main Display
    els.currTemp.textContent = Math.round(current.temperature_2m);
    els.currCond.textContent = getWeatherDescription(current.weather_code).toUpperCase();
    els.currentIconContainer.innerHTML = getIconForCode(current.weather_code, true);

    // High/Low
    els.tempHigh.textContent = Math.round(daily.temperature_2m_max[todayIndex]);
    els.tempLow.textContent = Math.round(daily.temperature_2m_min[todayIndex]);

    // Cards
    // Sunrise (Next) / Sunset (Next)
    const sunset = new Date(daily.sunset[todayIndex]);
    const nextSunrise = new Date(daily.sunrise[todayIndex + 1]);

    els.sunsetTime.innerHTML = formatTimeShort(sunset); // using innerHTML to support <small> span if needed, though card CSS handles AM/PM span if passed
    els.sunsetIcon.innerHTML = ICONS.sunset;

    els.sunriseTime.innerHTML = formatTimeShort(nextSunrise);
    els.sunriseIcon.innerHTML = ICONS.sunrise;

    // Wind
    els.windSpeed.textContent = Math.round(current.wind_speed_10m);
    els.windDir.textContent = getCardinalDirection(current.wind_direction_10m);
    els.windIcon.innerHTML = ICONS.wind;

    // Rain
    const rainVal = current.precipitation || 0; // Handle null
    els.rainAmount.textContent = rainVal; 
    els.rainIcon.innerHTML = ICONS.rain;

    // Footer Forecast
    renderForecast(daily);
    
    // Background Particles
    updateBackgroundState(current.weather_code);
}

function renderForecast(daily) {
    if (!els.forecastContainer) return;
    els.forecastContainer.innerHTML = '';
    
    // Display 7 days (Today + 6)
    // Design has 7 columns usually
    for(let i=0; i<7; i++) {
        if (!daily.time[i]) continue;
        
        const date = new Date(daily.time[i]);
        const dayName = i === 0 ? 'TODAY' : date.toLocaleDateString('en-NZ', {weekday:'short'}).toUpperCase(); 

        const code = daily.weather_code[i];
        const max = Math.round(daily.temperature_2m_max[i]);
        const min = Math.round(daily.temperature_2m_min[i]);

        const el = document.createElement('div');
        el.className = 'forecast-item';
        el.innerHTML = `
            <div class="f-day">${dayName}</div>
            <div class="f-icon">${getIconForCode(code)}</div>
            <div class="f-temp">${max}°<span class="f-low">${min}°</span></div>
        `;
        els.forecastContainer.appendChild(el);
    }
}

// --- Helpers ---

function formatTimeShort(date) {
    // 09:06 <span...>PM</span>
    let h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const amPm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h.toString().padStart(2, '0')}:${m}<span style="font-size:0.5em; margin-left:4px; opacity:0.7;">${amPm}</span>`;
}

function getCardinalDirection(angle) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(angle / 45) % 8];
}

function getWeatherDescription(code) {
    const codes = {
        0: 'Clear Sky', 1: 'Clear', 2: 'Partly Cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Fog',
        51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle',
        61: 'Rain', 63: 'Rain', 65: 'Heavy Rain',
        71: 'Snow', 73: 'Snow', 75: 'Snow',
        80: 'Showers', 81: 'Showers', 82: 'Violent Showers',
        95: 'Thunderstorm', 96: 'Thunderstorm'
    };
    return codes[code] || 'Unknown';
}

function getIconForCode(code, large=false) {
    let icon = ICONS.cloud;
    // Simple Mapping
    if (code === 0 || code === 1) icon = ICONS.sun;
    if (code === 2) icon = ICONS.cloud; // partly
    if (code === 3) icon = ICONS.cloud;
    if (code >= 51 && code <= 99) icon = ICONS.rain;
    // Could add snow/storm if SVGs present
    return icon;
}

// --- Background (Simple Particle) ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function updateBackgroundState(code) {
    particles = [];
    let count = 40; // Less is more for professional look
    let type = 'star';
    
    if (code >= 51) {
        count = 400; // Rain needs density
        type = 'rain';
    }
    
    for(let i=0; i<count; i++) {
        particles.push(createParticle(type));
    }
}

function createParticle(type) {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() * (type==='rain'?10:0.05) + (type==='rain'?10:0.02),
        size: Math.random() * 2,
        length: Math.random() * 20 + 10,
        alpha: Math.random(),
        type: type
    };
}

function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    
    particles.forEach(p => {
        // Update
        p.y += p.speed;
        if(p.type === 'star') p.y -= p.speed * 2; // Stars float up slowly? Or let's float them up
        if (p.type === 'star' && p.y < 0) { p.y = canvas.height; p.x = Math.random() * canvas.width; }
        if (p.type === 'rain' && p.y > canvas.height) { p.y = -p.length; p.x = Math.random() * canvas.width; }
        
        // Draw
        if (p.type === 'rain') {
            ctx.strokeStyle = "rgba(174, 194, 224, 0.4)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x, p.y + p.length);
            ctx.stroke();
        } else {
            ctx.fillStyle = `rgba(255,255,255,${p.alpha * 0.4})`; // Subtle dust
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            ctx.fill();
        }
    });
    requestAnimationFrame(animate);
}
animate(); // Start loop

// Init
setInterval(updateTime, 1000);
updateTime();
fetchWeather();
setInterval(fetchWeather, CONFIG.REFRESH_RATE);
