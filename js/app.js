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
    dateDisplay: document.getElementById('date-display'),
    lastSync: document.getElementById('last-sync'),
    cityName: document.getElementById('city-name'),
    countryName: document.getElementById('country-name'),
    // Weather
    currTemp: document.getElementById('current-temp'),
    currCond: document.getElementById('current-condition'),
    tempHigh: document.getElementById('temp-high'),
    tempLow: document.getElementById('temp-low'),
    // Metrics
    sunsetTime: document.getElementById('sunset-time'),
    sunriseTime: document.getElementById('sunrise-time'),
    windSpeed: document.getElementById('wind-speed'),
    windDir: document.getElementById('wind-direction'),
    uvValue: document.getElementById('uv-value'),
    uvTime: document.getElementById('uv-time'),
    // Footer
    forecastContainer: document.getElementById('forecast-container'),
    // Containers for Icons
    sunsetIcon: document.getElementById('sunset-icon'),
    sunriseIcon: document.getElementById('sunrise-icon'),
    windIcon: document.getElementById('wind-icon'),
    uvIcon: document.getElementById('uv-icon'),
};

// --- Icons (SVGs) ---
const ICONS = {
    sun: `<svg viewBox="0 0 24 24" class="animated-icon sun"><defs><linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#fce288;stop-opacity:1" /><stop offset="100%" style="stop-color:#d4af37;stop-opacity:1" /></linearGradient></defs><circle cx="12" cy="12" r="5" fill="url(#gold-gradient)" /><g stroke="url(#gold-gradient)" stroke-width="2"><line x1="12" y1="1" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="6.34" y2="17.66" /><line x1="17.66" y1="6.34" x2="19.78" y2="4.22" /></g></svg>`,
    
    moon: `<svg viewBox="0 0 24 24" class="animated-icon moon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="url(#gold-gradient)"/></svg>`,
    
    cloud: `<svg viewBox="0 0 24 24" class="animated-icon cloud"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="url(#gold-gradient)" opacity="0.8"/></svg>`,
    
    rain: `<svg viewBox="0 0 24 24" class="animated-icon rain"><path d="M16 13v8" stroke="url(#gold-gradient)" stroke-width="2"/><path d="M12 13v8" stroke="url(#gold-gradient)" stroke-width="2"/><path d="M8 13v8" stroke="url(#gold-gradient)" stroke-width="2"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 3 16.29" fill="none" stroke="url(#gold-gradient)" stroke-width="2"/></svg>`,
    
    wind: `<svg viewBox="0 0 24 24" class="animated-icon wind"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" fill="none" stroke="url(#gold-gradient)" stroke-width="2" stroke-linecap="round"/></svg>`,
    
    arrowUp: `<svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" stroke="url(#gold-gradient)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`, // Sunrise
    arrowDown: `<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7" stroke="url(#gold-gradient)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`, // Sunset
    
    uv: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="url(#gold-gradient)" stroke-width="2" fill="none"/><path d="M12 7v10M8.5 8.5l7 7M8.5 15.5l7-7" stroke="url(#gold-gradient)" stroke-width="2"/></svg>`
};

// --- Time & Date ---
function updateTime() {
    const now = new Date();
    
    // Clock
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    els.clockHours.textContent = hours;
    els.clockMinutes.textContent = minutes;
    
    // Date
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('en-NZ', options).toUpperCase();
    els.dateDisplay.textContent = dateStr;

    // Layout Adjustment (Ensure width matching)
    // We do this roughly by setting max-width of separators or just ensuring visual balance in CSS
    // The strict requirement "Date must be VISUALLY the exact same width as the clock time" 
    // is often handled by tracking/spacing or layout sizing. 
    // Here we will set the font size dynamically if needed, or rely on a container width constraint.
    // simpler approach:
    const clockWidth = document.querySelector('.time-display').offsetWidth;
    const dateElement = document.querySelector('.date-display');
    
    // very basic fit-text logic could go here if CSS fails to align them perfectly
    // for now, we rely on the CSS 'gold-separator' and container alignment.
    document.querySelector('.gold-separator').style.width = `${clockWidth}px`;
    dateElement.style.width = `${clockWidth}px`;
    dateElement.style.justifyContent = 'space-between'; // Spread text to fill width
}

// --- Weather Data ---
async function fetchWeather() {
    try {
        const params = new URLSearchParams({
            latitude: CONFIG.LAT,
            longitude: CONFIG.LON,
            current: "temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day",
            hourly: "temperature_2m,weather_code,visibility",
            daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,uv_index_max_main_time_daily",
            timezone: "auto",
            forecast_days: 7
        });

        const res = await fetch(`${CONFIG.API_URL}?${params}`);
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        
        updateWeatherUI(data);
        els.lastSync.textContent = `Last Data Sync: ${new Date().toLocaleTimeString('en-NZ', {hour: '2-digit', minute:'2-digit'})}`;
        
    } catch (e) {
        console.error("Fetch Error", e);
        els.currCond.textContent = "Offline / Error";
    }
}

function updateWeatherUI(data) {
    const current = data.current;
    const daily = data.daily;
    const todayIndex = 0; // Today is usually index 0

    // Main Display
    els.currTemp.textContent = `${Math.round(current.temperature_2m)}°`;
    els.currCond.textContent = getWeatherDescription(current.weather_code);
    els.tempHigh.textContent = Math.round(daily.temperature_2m_max[todayIndex]);
    els.tempLow.textContent = Math.round(daily.temperature_2m_min[todayIndex]);

    // Metrics - Sunset/Sunrise
    // Note: API returns ISO strings like "2023-10-10T06:45"
    const sunrise = new Date(daily.sunrise[todayIndex]);
    const sunset = new Date(daily.sunset[todayIndex]);
    
    // Logic: If currently night (after today's sunset), show tomorrow's sunrise? 
    // Requirement says: "TONIGHT'S SUNSET" (Left) and "NEXT SUNRISE" (Right).
    // If it's already past sunset, "Tonight's Sunset" refers to the one that just happened? 
    // Or strictly future? Let's stick to today's sunset and tomorrow's sunrise if logical, 
    // but the layout asks for specific labels. We will show Today's Sunset and Tomorrow's Sunrise.
    
    const nextSunrise = new Date(daily.sunrise[todayIndex + 1]);

    els.sunsetTime.textContent = formatTimeShort(sunset);
    els.sunriseTime.textContent = formatTimeShort(nextSunrise);
    
    // Inject Icons
    els.sunsetIcon.innerHTML = ICONS.arrowDown; // or Sun/Moon variant
    els.sunriseIcon.innerHTML = ICONS.arrowUp;
    els.windIcon.innerHTML = ICONS.wind;
    els.uvIcon.innerHTML = ICONS.uv;

    // Wind
    els.windSpeed.textContent = Math.round(current.wind_speed_10m);
    els.windDir.textContent = getCardinalDirection(current.wind_direction_10m);

    // UV
    const maxUV = daily.uv_index_max[todayIndex];
    els.uvValue.textContent = maxUV.toFixed(1);
    const uvPeakTime = new Date(daily.uv_index_max_main_time_daily[todayIndex]);
    els.uvTime.textContent = `Peak @ ${formatTimeShort(uvPeakTime)}`;

    // Footer Forecast
    renderForecast(daily);
    
    // Update Background State
    updateBackgroundState(current.weather_code, current.is_day);
}

function renderForecast(daily) {
    els.forecastContainer.innerHTML = '';
    
    // Show next 7 days (or 6 excluding today if desired, but 7-day forecast usually includes today or starts tomorrow)
    // We will show Day 1 to Day 6 (Total 6 or 7 items?). Space is wide.
    // Let's do 7 days including today or starting tomorrow. Usually "Forecast" implies future.
    // Let's show Today + 6 days = 7 cols.
    
    for(let i=0; i<7; i++) {
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
            <div class="f-temp">${max}°</div>
            <div class="f-low">${min}°</div>
        `;
        els.forecastContainer.appendChild(el);
    }
}

// --- Helpers ---

function formatTimeShort(date) {
    return date.toLocaleTimeString('en-NZ', {hour:'2-digit', minute:'2-digit', hour12: false}); // 24h preferred for clear digital signage or 12h? 
    // Spec says Clock is 12h. Let's make metrics 24h or 12h consistently? 
    // Spec: "Large digital clock (12h format)". I'll use 12h for consistency.
    // Actually, "Blinking Colons" implies digital style.. usually 24h in NZ? 
    // User requested 12h for main clock. I will stick to 12h for others too.
    return date.toLocaleTimeString('en-NZ', {hour:'numeric', minute:'2-digit', hour12: true}).replace(" pm", "").replace(" am","");
}

function getCardinalDirection(angle) {
    const directions = ['North', 'North East', 'East', 'South East', 'South', 'South West', 'West', 'North West'];
    return directions[Math.round(angle / 45) % 8];
}

function getWeatherDescription(code) {
    // WMO Weather interpretation codes (WW)
    const codes = {
        0: 'Clear Sky',
        1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Depositing Rime Fog',
        51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
        61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
        71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow',
        80: 'Slight Showers', 81: 'Moderate Showers', 82: 'Violent Showers',
        95: 'Thunderstorm', 96: 'Thunderstorm & Hail'
    };
    return codes[code] || 'Unknown';
}

function getIconForCode(code) {
    // Simple mapping to our SVG set
    if (code === 0 || code === 1) return ICONS.sun;
    if (code === 2 || code === 3) return ICONS.cloud;
    if (code >= 51 && code <= 67) return ICONS.rain;
    if (code >= 80 && code <= 82) return ICONS.rain; // showers
    if (code >= 95) return ICONS.wind; // storm placeholder
    return ICONS.cloud;
}


// --- Canvas Background (Particles) ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let bgState = 'clear'; // 'clear', 'rain', 'clouds'

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor(type) {
        this.type = type; // 'star' or 'rain'
        this.reset();
    }
    
    reset() {
        if (this.type === 'rain') {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * -canvas.height;
            this.speed = Math.random() * 5 + 10; // Realistic rain speed (not hyper-fast)
            this.length = Math.random() * 20 + 10;
        } else { // Star/Dust
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2;
            this.alpha = Math.random();
            this.speed = Math.random() * 0.2; // slow float
        }
    }
    
    update() {
        if (this.type === 'rain') {
            this.y += this.speed;
            if (this.y > canvas.height) this.reset();
        } else {
            // subtle float
            this.y -= this.speed;
            if (this.y < 0) this.y = canvas.height;
            this.alpha += (Math.random() - 0.5) * 0.05;
            if (this.alpha < 0) this.alpha = 0;
            if (this.alpha > 1) this.alpha = 1;
        }
    }
    
    draw() {
        if (this.type === 'rain') {
            ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + this.length);
            ctx.stroke();
        } else {
            ctx.fillStyle = `rgba(212, 175, 55, ${this.alpha * 0.5})`; // Gold dust
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
            ctx.fill();
        }
    }
}

function initParticles(type, count) {
    particles = [];
    for(let i=0; i<count; i++) {
        particles.push(new Particle(type));
    }
}

// Initial default
initParticles('star', 100);

function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Sun/Moon/Horizon logic if needed (simple gradient background for now)
    // Spec: "Sun/Moon must RISE on RIGHT and SET on LEFT."
    // We can draw a large glow based on time? 
    const now = new Date();
    // Simple placeholder for sun pos
    
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    requestAnimationFrame(animateCanvas);
}
animateCanvas(); // Start loop

function updateBackgroundState(code, isDay) {
    // Logic to switch rain/clear
    let newType = 'star';
    let count = 100;
    
    // Rain codes
    if (code >= 51 && code <= 99) {
        newType = 'rain';
        count = 500; // More rain drops
    }
    
    // Re-init if changed (simple check)
    // For now, let's just re-init every time weather updates effectively or check flag
    if (bgState !== newType) {
        bgState = newType;
        initParticles(newType, count);
    }
}


// --- Init ---
setInterval(updateTime, 1000);
updateTime();
fetchWeather();
setInterval(fetchWeather, CONFIG.REFRESH_RATE);
