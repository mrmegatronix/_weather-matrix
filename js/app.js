// Config - STRICT SETTINGS
const CONFIG = {
    LAT: -43.5321,
    LON: 172.6362,
    API_URL: "https://api.open-meteo.com/v1/forecast",
    REFRESH_RATE: 1000 * 60 * 10, // 10 minutes sync
};

// DOM Elements - Safe Selection
const getEl = (id) => document.getElementById(id);
const els = {
    clockHours: getEl('clock-hours'),
    clockMinutes: getEl('clock-minutes'),
    amPm: getEl('am-pm'),
    dateDisplay: getEl('date-display'),
    lastSync: getEl('last-sync'),
    
    cityName: getEl('city-name'),
    countryName: getEl('country-name'),

    currentIconContainer: getEl('current-icon-container'),
    currTemp: getEl('current-temp'),
    currCond: getEl('current-condition'),
    tempHigh: getEl('temp-high'),
    tempLow: getEl('temp-low'),

    sunriseTime: getEl('sunrise-time'),
    sunriseIcon: getEl('sunrise-icon'),

    windSpeed: getEl('wind-speed'),
    windDir: getEl('wind-direction'),
    windIcon: getEl('wind-icon'),

    rainAmount: getEl('rain-amount'),
    rainIcon: getEl('rain-icon'),

    sunsetTime: getEl('sunset-time'),
    sunsetIcon: getEl('sunset-icon'),

    forecastContainer: getEl('forecast-container'),
};

// --- Icons (SVGs) - Uses Global #gold-gradient ---
const ICONS = {
    sun: `<svg viewBox="0 0 24 24" class="animated-icon sun"><circle cx="12" cy="12" r="5" fill="url(#gold-gradient)" /><g stroke="url(#gold-gradient)" stroke-width="2"><line x1="12" y1="1" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="6.34" y2="17.66" /><line x1="17.66" y1="6.34" x2="19.78" y2="4.22" /></g></svg>`,
    moon: `<svg viewBox="0 0 24 24" class="animated-icon moon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="url(#gold-gradient)"/></svg>`,
    cloud: `<svg viewBox="0 0 24 24" class="animated-icon cloud"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="url(#gold-gradient)" opacity="0.8"/></svg>`,
    rain: `<svg viewBox="0 0 24 24" class="animated-icon rain"><path d="M16 13v8" stroke="url(#gold-gradient)" stroke-width="2"/><path d="M12 13v8" stroke="url(#gold-gradient)" stroke-width="2"/><path d="M8 13v8" stroke="url(#gold-gradient)" stroke-width="2"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 3 16.29" fill="none" stroke="url(#gold-gradient)" stroke-width="2"/></svg>`,
    wind: `<svg viewBox="0 0 24 24" class="animated-icon wind"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" fill="none" stroke="url(#gold-gradient)" stroke-width="2" stroke-linecap="round"/></svg>`,
    snow: `<svg viewBox="0 0 24 24" class="animated-icon snow"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" stroke="url(#gold-gradient)" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="3" fill="none" stroke="url(#gold-gradient)"/></svg>`,
    fog: `<svg viewBox="0 0 24 24" class="animated-icon fog"><path d="M4 15h16M4 10h16M4 20h16M4 5h16" stroke="url(#gold-gradient)" stroke-width="2" stroke-linecap="round" opacity="0.7"/></svg>`,
    thunder: `<svg viewBox="0 0 24 24" class="animated-icon thunder"><path d="M13 2L6 13h6v9l7-11h-6z" fill="url(#gold-gradient)" stroke="none"/></svg>`,
    
    sunrise: `<svg viewBox="0 0 24 24"><path d="M12 19V6M5 12l7-7 7 7" stroke="url(#gold-gradient)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 18h2M5 18h2" stroke="url(#gold-gradient)" opacity="0.5"/></svg>`, 
    sunset: `<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7" stroke="url(#gold-gradient)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 18h2M5 18h2" stroke="url(#gold-gradient)" opacity="0.5"/></svg>`, 
};

// --- Time & Date ---
function updateTime() {
    if(!els.clockHours) return; 
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
    
    // Date
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    els.dateDisplay.textContent = now.toLocaleDateString('en-NZ', options).toUpperCase();
}

// --- Weather Data ---
async function fetchWeather() {
    try {
        if(els.currCond) els.currCond.textContent = "Loading...";

        const params = new URLSearchParams({
            latitude: CONFIG.LAT,
            longitude: CONFIG.LON,
            current: "temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day,precipitation",
            daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset",
            timezone: "auto",
            forecast_days: 7 
        });

        const res = await fetch(`${CONFIG.API_URL}?${params}`);
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();
        
        updateWeatherUI(data);
        
    } catch (e) {
        console.error("Fetch Error - Switching to Offline Mode", e);
        if(els.currCond) els.currCond.textContent = "OFFLINE MODE"; 
        loadOfflineData(); // Restore fallback so UI shows SOMETHING
    }
}

function loadOfflineData() {
    console.log("Loading Offline Data to prevent broken UI");
    const now = new Date();
    // simulate 7 days of data
    const daily = {
        time: [],
        weather_code: [],
        temperature_2m_max: [],
        temperature_2m_min: [],
        sunrise: [],
        sunset: []
    };
    
    for(let i=0; i<7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        daily.time.push(d.toISOString());
        daily.weather_code.push(i%2===0 ? 1 : 3); // Sun or Cloud
        daily.temperature_2m_max.push(20 + Math.random()*5);
        daily.temperature_2m_min.push(12 + Math.random()*3);
        
        let sr = new Date(d); sr.setHours(6,30,0);
        let ss = new Date(d); ss.setHours(20,30,0);
        daily.sunrise.push(sr.toISOString());
        daily.sunset.push(ss.toISOString());
    }

    const demoData = {
        current: {
            temperature_2m: 18,
            weather_code: 3, // Overcast for cloud testing
            wind_speed_10m: 15,
            wind_direction_10m: 45, // NE
            precipitation: 0.2,
            is_day: 1
        },
        daily: daily
    };
    
    updateWeatherUI(demoData);
}

function updateWeatherUI(data) {
    if (!data || !data.current || !data.daily) {
        console.error("Data missing in updateWeatherUI", data);
        return;
    }
    
    // Update Last Sync Time
    if(els.lastSync) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        els.lastSync.innerHTML = `Synced: <span>${timeStr}</span>`;
    }
    
    const current = data.current;
    const daily = data.daily;
    const todayIndex = 0; 
    
    // Main Display
    if(els.currTemp) els.currTemp.textContent = Math.round(current.temperature_2m);
    if(els.currCond) els.currCond.textContent = getWeatherDescription(current.weather_code).toUpperCase();
    if(els.currentIconContainer) els.currentIconContainer.innerHTML = getIconForCode(current.weather_code);

    // High/Low
    if(els.tempHigh && daily.temperature_2m_max) els.tempHigh.textContent = Math.round(daily.temperature_2m_max[todayIndex]);
    if(els.tempLow && daily.temperature_2m_min) els.tempLow.textContent = Math.round(daily.temperature_2m_min[todayIndex]);

    // Cards
    try {
        const sunset = new Date(daily.sunset[todayIndex]);
        const nextSunrise = new Date(daily.sunrise[todayIndex + 1]);

        if(els.sunsetTime) els.sunsetTime.innerHTML = formatTimeShort(sunset);
        if(els.sunsetIcon) els.sunsetIcon.innerHTML = ICONS.sunset;

        if(els.sunriseTime) els.sunriseTime.innerHTML = formatTimeShort(nextSunrise);
        if(els.sunriseIcon) els.sunriseIcon.innerHTML = ICONS.sunrise;
    } catch(err) { console.error("Time parsing error", err); }

    // Wind
    if(els.windSpeed) els.windSpeed.textContent = Math.round(current.wind_speed_10m);
    if(els.windDir) els.windDir.textContent = getCardinalDirection(current.wind_direction_10m);
    if(els.windIcon) els.windIcon.innerHTML = ICONS.wind;

    // Rain
    const rainVal = current.precipitation || 0; 
    if(els.rainAmount) els.rainAmount.textContent = rainVal; 
    if(els.rainIcon) els.rainIcon.innerHTML = ICONS.rain;

    // Footer Forecast
    console.log("Rendering Forecast with data:", daily);
    renderForecast(daily);
    
    // Background Particles
    updateBackgroundState(current.weather_code);
}

function renderForecast(daily) {
    if (!els.forecastContainer) {
        console.error("Forecast Container DOM missing!");
        return;
    }
    els.forecastContainer.innerHTML = '';
    
    if(!daily.time || daily.time.length === 0) {
         console.error("Daily Time data missing", daily);
         return;
    }

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
    if(isNaN(date.getTime())) return "--:--";
    let h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const amPm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h.toString().padStart(2, '0')}:${m}<span style="font-size:0.5em; margin-left:4px; opacity:0.7;">${amPm}</span>`;
}

function getCardinalDirection(angle) {
    if(angle === undefined) return "--";
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
        80: 'Rain Showers', 81: 'Rain Showers', 82: 'Violent Showers',
        95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm'
    };
    return codes[code] || 'Unknown'; 
}

function getIconForCode(code) {
    if (code === 0 || code === 1) return ICONS.sun;
    if (code === 2 || code === 3) return ICONS.cloud; 
    if (code === 45 || code === 48) return ICONS.fog;
    if (code >= 51 && code <= 67) return ICONS.rain;
    if (code >= 71 && code <= 77) return ICONS.snow;
    if (code >= 80 && code <= 82) return ICONS.rain;
    if (code >= 85 && code <= 86) return ICONS.snow;
    if (code >= 95) return ICONS.thunder;
    
    return ICONS.cloud; // Safe default
}

// --- Background (Celestial & Particles) ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let particles = [];
let celestialBody = { x: 0, y: 0, type: 'sun', visible: false };

function resizeCanvas() {
    if(!canvas) return;
    // Match the CSS-constrained size (90vw / 90vh)
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Force re-draw immediately
    updateCelestialBody(); 
}
window.addEventListener('resize', resizeCanvas);
// Call after a small delay to ensure CSS is applied
setTimeout(resizeCanvas, 100);

function updateBackgroundState(code) {
    if(!canvas) return;
    particles = [];
    let count = 50; 
    let type = 'star';
    
    // Cloud/Fog/Overcast (Codes 1, 2, 3, 45, 48)
    if (code >= 1 && code <= 3) { count = 15; type = 'cloud'; }
    if (code === 45 || code === 48) { count = 25; type = 'cloud'; }

    // Rain
    if (code >= 51 && code <= 67) { count = 800; type = 'rain'; }
    if (code >= 80 && code <= 82) { count = 800; type = 'rain'; }
    // Snow
    if (code >= 71 && code <= 77) { count = 300; type = 'snow'; }
    
    for(let i=0; i<count; i++) {
        particles.push(createParticle(type));
    }
}

function createParticle(type) {
    if(!canvas) return {};
    
    // Cloud Logic
    if (type === 'cloud') {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height * 0.6), 
            speed: Math.random() * 0.2 + 0.05, 
            size: Math.random() * 60 + 40,
            length: 0,
            alpha: Math.random() * 0.1 + 0.05,
            type: type
        };
    }

    if (type === 'rain') {
         return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: Math.random() * 20 + 15, // Faster heavy rain
            size: 1,
            length: Math.random() * 40 + 20, // Longer streaks
            alpha: Math.random() * 0.5 + 0.5, // High visibility
            type: type
        };
    }

    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() * (type==='snow'?2:0.05) + 0.1,
        size: Math.random() * (type==='snow'?3:2) + 0.5,
        length: 0,
        alpha: Math.random(),
        type: type
    };
}

// --- Celestial Body (Sun/Moon) ---
function updateCelestialBody() {
    if(!canvas) return;
    const now = new Date();
    const h = now.getHours() + now.getMinutes()/60;
    
    let isDay = h >= 6 && h < 18;
    let progress = 0; 
    
    if (isDay) {
        celestialBody.type = 'sun';
        progress = (h - 6) / 12;
    } else {
        celestialBody.type = 'moon';
        let adjustedH = h < 6 ? h + 24 : h;
        progress = (adjustedH - 18) / 12;
    }
    
    celestialBody.x = canvas.width - (progress * canvas.width);
    
    const horizon = canvas.height * 0.8;
    const zenith = canvas.height * 0.1;
    let heightFactor = Math.sin(progress * Math.PI);
    
    celestialBody.y = horizon - (heightFactor * (horizon - zenith));
    celestialBody.visible = true;
}

function drawCelestialBody() {
    if (!celestialBody.visible || !ctx) return;
    
    const { x, y, type } = celestialBody;
    const radius = Math.min(canvas.width, canvas.height) * 0.08; 
    
    const gradient = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius * 2);
    if (type === 'sun') {
        gradient.addColorStop(0, 'rgba(255, 223, 0, 1)'); 
        gradient.addColorStop(0.2, 'rgba(255, 140, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');
    } else {
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); 
        gradient.addColorStop(0.2, 'rgba(200, 200, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(200, 200, 255, 0)');
    }
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = type === 'sun' ? '#FFD700' : '#F0F0FF';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
}

function animate() {
    if(!ctx || !canvas) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    
    updateCelestialBody();
    drawCelestialBody();
    
    particles.forEach(p => {
        p.y += p.speed;
        
        if (p.type === 'cloud') {
            p.x -= p.speed; 
            if (p.x < -p.size * 2) p.x = canvas.width + p.size;
        } else if(p.type === 'star') {
             p.y -= p.speed * 0.5; 
             if (p.y < 0) { p.y = canvas.height; p.x = Math.random() * canvas.width; }
        } else {
            // Rain/Snow
            if (p.y > canvas.height) { p.y = -p.length; p.x = Math.random() * canvas.width; }
        }
        
        ctx.beginPath();
        if (p.type === 'rain') {
            ctx.strokeStyle = `rgba(200, 220, 255, ${p.alpha})`; // Brighter/Blueish
            ctx.lineWidth = 2.5; // Thicker for TV visibility
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x, p.y + p.length);
            ctx.stroke();
        } else if (p.type === 'cloud') {
            ctx.fillStyle = `rgba(200, 200, 200, ${p.alpha})`; 
            ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            ctx.fill();
        } else {
            ctx.fillStyle = `rgba(255,255,255,${p.alpha * (p.type==='snow'?0.8:0.4)})`; 
            ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            ctx.fill();
        }
    });
    requestAnimationFrame(animate);
}

// Start
if(canvas) animate(); 
setInterval(updateTime, 1000);
updateTime();
fetchWeather();
setInterval(fetchWeather, CONFIG.REFRESH_RATE);
