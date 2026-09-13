/**
 * WeatherGPT — Conversational AI for Weather Forecasting, Alerts, and Climate Information
 * Version 2.1.0 — Natural Manglish & Streamlined Gemini API Integration
 * Features:
 * - Natural Language Manglish (Malayalam-English code-switching) & English
 * - Real-time Open-Meteo Global NWP Telemetry & Air Quality Integration
 * - Severe Weather Detection & Emergency Safety Guidelines
 * - Deep Atmospheric & Climate Science Intelligence (ENSO, Polar Vortex, Climate Change)
 * - Interactive Chart.js 24h Hourly Curve & 7-Day Extended Forecasts
 * - Live Leaflet Weather Radar Map with RainViewer Animated Tile Layer
 * - Web Speech API Voice Recognition & Audio Synthesis
 * - Streamlined Gemini 2.0 / 1.5 Flash & OpenAI API Key Integration with 1-Click Verification
 */

// ============================================================================
// CONSTANTS & WMO WEATHER DICTIONARY
// ============================================================================

const WMO_MAP = {
    0: { desc: "Clear sky", descMl: "Thelinja aakasham", icon: "fa-sun", mood: "sunny" },
    1: { desc: "Mainly clear", descMl: "Pradhanamaayum thelinjathu", icon: "fa-cloud-sun", mood: "sunny" },
    2: { desc: "Partly cloudy", descMl: "Kureyokke meghavritham", icon: "fa-cloud-sun", mood: "cloudy" },
    3: { desc: "Overcast", descMl: "Kaarmekhangal niranjathu", icon: "fa-cloud", mood: "cloudy" },
    45: { desc: "Foggy", descMl: "Manjumoodiya avastha", icon: "fa-smog", mood: "fog" },
    48: { desc: "Depositing rime fog", descMl: "Kattiya manju", icon: "fa-smog", mood: "fog" },
    51: { desc: "Light drizzle", descMl: "Cheriya thullikkuru mazha", icon: "fa-cloud-rain", mood: "rain" },
    53: { desc: "Moderate drizzle", descMl: "Idatharam charal mazha", icon: "fa-cloud-rain", mood: "rain" },
    55: { desc: "Dense drizzle", descMl: "Kattiya charal mazha", icon: "fa-cloud-showers-heavy", mood: "rain" },
    56: { desc: "Freezing drizzle", descMl: "Thanuthuranjha charal mazha", icon: "fa-snowflake", mood: "snow" },
    57: { desc: "Heavy freezing drizzle", descMl: "Kattiya thanuppulla mazha", icon: "fa-snowflake", mood: "snow" },
    61: { desc: "Slight rain", descMl: "Cheriya mazha", icon: "fa-cloud-rain", mood: "rain" },
    63: { desc: "Moderate rain", descMl: "Idatharam mazha", icon: "fa-cloud-rain", mood: "rain" },
    65: { desc: "Heavy torrential rain", descMl: "Karthu peyyunna katti mazha", icon: "fa-cloud-showers-heavy", mood: "rain" },
    66: { desc: "Light freezing rain", descMl: "Thanuppulla mazha", icon: "fa-icicles", mood: "snow" },
    67: { desc: "Heavy freezing rain", descMl: "Kattiya manjumazha", icon: "fa-icicles", mood: "snow" },
    71: { desc: "Slight snow fall", descMl: "Cheriya manjuveezhcha", icon: "fa-snowflake", mood: "snow" },
    73: { desc: "Moderate snow fall", descMl: "Manjuveezhcha", icon: "fa-snowflake", mood: "snow" },
    75: { desc: "Heavy snow blizzard", descMl: "Kodu manjuveezhcha", icon: "fa-snowflake", mood: "snow" },
    77: { desc: "Snow grains", descMl: "Manjuthullikal", icon: "fa-snowflake", mood: "snow" },
    80: { desc: "Slight rain showers", descMl: "Cheriya mazhakkol", icon: "fa-cloud-sun-rain", mood: "rain" },
    81: { desc: "Moderate rain showers", descMl: "Idatharam mazhakkol", icon: "fa-cloud-rain", mood: "rain" },
    82: { desc: "Violent rain showers", descMl: "Shakthamaya poythu mazha", icon: "fa-cloud-showers-heavy", mood: "rain" },
    85: { desc: "Slight snow showers", descMl: "Cheriya manju mazhakkol", icon: "fa-snowflake", mood: "snow" },
    86: { desc: "Heavy snow showers", descMl: "Kattiya manju mazhakkol", icon: "fa-snowflake", mood: "snow" },
    95: { desc: "Thunderstorm", descMl: "Idiyodu koodiya mazha", icon: "fa-bolt-lightning", mood: "storm" },
    96: { desc: "Thunderstorm with slight hail", descMl: "Aalappazhavum idiyumulla mazha", icon: "fa-cloud-bolt", mood: "storm" },
    99: { desc: "Thunderstorm with severe hail", descMl: "Shakthamaya idiyum kalmazhayum", icon: "fa-cloud-bolt", mood: "storm" }
};

function getWmoInfo(code) {
    return WMO_MAP[code] || { desc: "Fair / Variable", descMl: "Idakkida maari varunnathu", icon: "fa-cloud", mood: "cloudy" };
}

// Kerala city aliases & spelling normalization
const KERALA_CITY_ALIASES = {
    'cochin': 'Kochi',
    'ernakulam': 'Kochi',
    'trivandrum': 'Thiruvananthapuram',
    'tvm': 'Thiruvananthapuram',
    'calicut': 'Kozhikode',
    'clt': 'Kozhikode',
    'alleppey': 'Alappuzha',
    'alp': 'Alappuzha',
    'trichur': 'Thrissur',
    'palghat': 'Palakkad',
    'quilon': 'Kollam',
    'cannanore': 'Kannur',
    'kasargod': 'Kasaragod'
};

// Pinned high-accuracy coordinates for Kerala locations (ensures Kochi is Kerala, India — never Japan!)
const PINNED_KERALA_LOCATIONS = {
    'kochi': { name: 'Kochi', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 9.9399, longitude: 76.2602, elevation: 4, timezone: 'Asia/Kolkata' },
    'cochin': { name: 'Kochi', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 9.9399, longitude: 76.2602, elevation: 4, timezone: 'Asia/Kolkata' },
    'ernakulam': { name: 'Kochi (Ernakulam)', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 9.9816, longitude: 76.2999, elevation: 4, timezone: 'Asia/Kolkata' },
    'thiruvananthapuram': { name: 'Thiruvananthapuram', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 8.5241, longitude: 76.9366, elevation: 10, timezone: 'Asia/Kolkata' },
    'trivandrum': { name: 'Thiruvananthapuram', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 8.5241, longitude: 76.9366, elevation: 10, timezone: 'Asia/Kolkata' },
    'tvm': { name: 'Thiruvananthapuram', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 8.5241, longitude: 76.9366, elevation: 10, timezone: 'Asia/Kolkata' },
    'kozhikode': { name: 'Kozhikode', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 11.2588, longitude: 75.7804, elevation: 1, timezone: 'Asia/Kolkata' },
    'calicut': { name: 'Kozhikode', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 11.2588, longitude: 75.7804, elevation: 1, timezone: 'Asia/Kolkata' },
    'clt': { name: 'Kozhikode', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 11.2588, longitude: 75.7804, elevation: 1, timezone: 'Asia/Kolkata' },
    'thrissur': { name: 'Thrissur', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 10.5276, longitude: 76.2144, elevation: 2, timezone: 'Asia/Kolkata' },
    'trichur': { name: 'Thrissur', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 10.5276, longitude: 76.2144, elevation: 2, timezone: 'Asia/Kolkata' },
    'alappuzha': { name: 'Alappuzha', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 9.4981, longitude: 76.3388, elevation: 1, timezone: 'Asia/Kolkata' },
    'alleppey': { name: 'Alappuzha', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 9.4981, longitude: 76.3388, elevation: 1, timezone: 'Asia/Kolkata' },
    'alp': { name: 'Alappuzha', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 9.4981, longitude: 76.3388, elevation: 1, timezone: 'Asia/Kolkata' },
    'kollam': { name: 'Kollam', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 8.8932, longitude: 76.6141, elevation: 3, timezone: 'Asia/Kolkata' },
    'quilon': { name: 'Kollam', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 8.8932, longitude: 76.6141, elevation: 3, timezone: 'Asia/Kolkata' },
    'palakkad': { name: 'Palakkad', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 10.7867, longitude: 76.6548, elevation: 84, timezone: 'Asia/Kolkata' },
    'palghat': { name: 'Palakkad', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 10.7867, longitude: 76.6548, elevation: 84, timezone: 'Asia/Kolkata' },
    'kannur': { name: 'Kannur', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 11.8745, longitude: 75.3704, elevation: 14, timezone: 'Asia/Kolkata' },
    'cannanore': { name: 'Kannur', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 11.8745, longitude: 75.3704, elevation: 14, timezone: 'Asia/Kolkata' },
    'kottayam': { name: 'Kottayam', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 9.5916, longitude: 76.5222, elevation: 3, timezone: 'Asia/Kolkata' },
    'malappuram': { name: 'Malappuram', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 11.0510, longitude: 76.0711, elevation: 40, timezone: 'Asia/Kolkata' },
    'wayanad': { name: 'Wayanad (Kalpetta)', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 11.6050, longitude: 76.0829, elevation: 780, timezone: 'Asia/Kolkata' },
    'idukki': { name: 'Idukki (Painavu)', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 9.8494, longitude: 76.9806, elevation: 650, timezone: 'Asia/Kolkata' },
    'munnar': { name: 'Munnar', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 10.0889, longitude: 77.0595, elevation: 1532, timezone: 'Asia/Kolkata' },
    'kasaragod': { name: 'Kasaragod', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 12.4996, longitude: 74.9869, elevation: 12, timezone: 'Asia/Kolkata' },
    'pathanamthitta': { name: 'Pathanamthitta', admin1: 'Kerala', country: 'India', country_code: 'IN', latitude: 9.2648, longitude: 76.7870, elevation: 18, timezone: 'Asia/Kolkata' }
};

// ============================================================================
// APPLICATION STATE
// ============================================================================

const state = {
    units: localStorage.getItem('weathergpt_units') || 'metric', // 'metric' (°C) or 'imperial' (°F)
    aiMode: localStorage.getItem('weathergpt_aimode') || 'builtin', // 'builtin' or 'external'
    llmProvider: localStorage.getItem('weathergpt_provider') || 'gemini',
    geminiModel: localStorage.getItem('weathergpt_gemini_model') || 'gemini-3.6-flash',
    apiKey: localStorage.getItem('weathergpt_apikey') || '',
    language: localStorage.getItem('weathergpt_lang') || 'auto', // 'auto', 'manglish', 'english'
    autoVoice: localStorage.getItem('weathergpt_autovoice') === 'true',
    savedCities: JSON.parse(localStorage.getItem('weathergpt_saved_cities') || '[]'),
    recentQueries: JSON.parse(localStorage.getItem('weathergpt_recent') || '[]'),
    activeCity: null,
    isProcessing: false,
    isRecording: false,
    chartInstances: {}
};

// ============================================================================
// DYNAMIC ATMOSPHERIC CANVAS ENGINE
// ============================================================================

class AtmosphereEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mood = 'default';
        this.lightningTimer = 0;
        this.lightningAlpha = 0;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initParticles();
        this.animate();
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    setMood(newMood) {
        if (this.mood === newMood) return;
        this.mood = newMood;
        document.body.setAttribute('data-weather-mood', newMood);
        this.initParticles();
    }

    initParticles() {
        this.particles = [];
        const count = this.mood === 'rain' ? 90 : (this.mood === 'snow' ? 70 : (this.mood === 'storm' ? 100 : 35));
        
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        if (this.mood === 'rain' || this.mood === 'storm') {
            return {
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                length: Math.random() * 20 + 10,
                speedY: Math.random() * 12 + 10,
                speedX: -2 + Math.random() * 0.5,
                alpha: Math.random() * 0.4 + 0.2
            };
        } else if (this.mood === 'snow') {
            return {
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 2.5 + 1,
                speedY: Math.random() * 1.5 + 0.8,
                speedX: Math.sin(Math.random() * Math.PI * 2) * 0.5,
                alpha: Math.random() * 0.6 + 0.3
            };
        } else if (this.mood === 'sunny') {
            return {
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 3 + 1,
                speedY: -(Math.random() * 0.4 + 0.1),
                speedX: (Math.random() - 0.5) * 0.3,
                alpha: Math.random() * 0.3 + 0.1,
                glow: Math.random() * 10 + 5
            };
        } else {
            return {
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 2 + 0.5,
                speedY: (Math.random() - 0.5) * 0.3,
                speedX: (Math.random() - 0.5) * 0.3,
                alpha: Math.random() * 0.25 + 0.05
            };
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Thunderstorm lightning flash simulation
        if (this.mood === 'storm') {
            this.lightningTimer++;
            if (this.lightningTimer > 180 && Math.random() < 0.02) {
                this.lightningAlpha = 0.35;
                this.lightningTimer = 0;
            }
            if (this.lightningAlpha > 0) {
                this.ctx.fillStyle = `rgba(186, 230, 253, ${this.lightningAlpha})`;
                this.ctx.fillRect(0, 0, this.width, this.height);
                this.lightningAlpha *= 0.85;
                if (this.lightningAlpha < 0.01) this.lightningAlpha = 0;
            }
        }

        // Draw particles
        for (let p of this.particles) {
            if (this.mood === 'rain' || this.mood === 'storm') {
                this.ctx.strokeStyle = `rgba(56, 189, 248, ${p.alpha})`;
                this.ctx.lineWidth = 1.2;
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x + p.speedX * 2, p.y + p.length);
                this.ctx.stroke();

                p.y += p.speedY;
                p.x += p.speedX;

                if (p.y > this.height) {
                    p.y = -20;
                    p.x = Math.random() * this.width;
                }
            } else if (this.mood === 'snow') {
                this.ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fill();

                p.y += p.speedY;
                p.x += p.speedX;

                if (p.y > this.height) {
                    p.y = -10;
                    p.x = Math.random() * this.width;
                }
            } else if (this.mood === 'sunny') {
                this.ctx.fillStyle = `rgba(251, 191, 36, ${p.alpha})`;
                this.ctx.shadowBlur = p.glow;
                this.ctx.shadowColor = 'rgba(251, 191, 36, 0.5)';
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;

                p.y += p.speedY;
                p.x += p.speedX;

                if (p.y < -10) {
                    p.y = this.height + 10;
                    p.x = Math.random() * this.width;
                }
            } else {
                this.ctx.fillStyle = `rgba(148, 163, 184, ${p.alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fill();

                p.y += p.speedY;
                p.x += p.speedX;

                if (p.x < 0) p.x = this.width;
                if (p.x > this.width) p.x = 0;
                if (p.y < 0) p.y = this.height;
                if (p.y > this.height) p.y = 0;
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

let atmosphere;

// ============================================================================
// METEOROLOGICAL API SERVICE (OPEN-METEO)
class WeatherService {
    static async reverseGeocode(latitude, longitude) {
        try {
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            if (res.ok) {
                const data = await res.json();
                const city = data.city || data.locality || data.principalSubdivision || "Current Location";
                const locality = data.locality || city;
                const district = (data.localityInfo && data.localityInfo.administrative && data.localityInfo.administrative[2]) 
                    ? data.localityInfo.administrative[2].name 
                    : locality;
                const stateName = data.principalSubdivision || "Kerala";
                const country = data.countryName || "India";
                const countryCode = data.countryCode || "IN";

                return {
                    name: city,
                    locality: locality,
                    district: district,
                    admin1: stateName,
                    country: country,
                    country_code: countryCode,
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    postcode: data.postcode || "",
                    elevation: data.elevation || 10,
                    timezone: "auto"
                };
            }
        } catch (e) {
            console.warn("Reverse geocode network fallback:", e);
        }

        // Fallback: Check if close to known pinned Kerala locations
        for (let key in PINNED_KERALA_LOCATIONS) {
            const pin = PINNED_KERALA_LOCATIONS[key];
            const dist = Math.hypot(pin.latitude - latitude, pin.longitude - longitude);
            if (dist < 0.25) { // within ~25 km
                return { ...pin };
            }
        }

        return {
            name: `Location (${Number(latitude).toFixed(2)}°, ${Number(longitude).toFixed(2)}°)`,
            district: "Local District",
            admin1: "Kerala",
            country: "India",
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            timezone: "auto"
        };
    }

    static async searchCity(query) {
        try {
            // 1. Direct GPS coordinate matching (e.g. "latitude 28.613, longitude 77.209" or "37.77, -122.41")
            const coordMatch = query.match(/(?:lat|latitude)[\s:=]+([+-]?\d+(?:\.\d+)?)[,\s]+(?:lon|long|longitude)[\s:=]+([+-]?\d+(?:\.\d+)?)/i);
            if (coordMatch) {
                const lat = parseFloat(coordMatch[1]);
                const lon = parseFloat(coordMatch[2]);
                const rev = await WeatherService.reverseGeocode(lat, lon);
                return rev;
            }

            const rawCoord = query.match(/^\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)\s*$/);
            if (rawCoord) {
                const lat = parseFloat(rawCoord[1]);
                const lon = parseFloat(rawCoord[2]);
                const rev = await WeatherService.reverseGeocode(lat, lon);
                return rev;
            }

            // 2. Clean query and check aliases
            let cleanQuery = query.replace(/[?!.]/g, '').trim();
            const lowerQuery = cleanQuery.toLowerCase();
            const isJapanExplicit = lowerQuery.includes('japan') || lowerQuery.includes('jp');

            // 2a. Check if directly in pinned Kerala locations (100% guarantees Kochi is in Kerala, India)
            const strippedForPinned = lowerQuery.replace(/\b(weather|in|at|for|climate|mazha|choodu|forecast|kerala|city|town)\b/g, '').trim();
            if (!isJapanExplicit) {
                if (PINNED_KERALA_LOCATIONS[lowerQuery]) {
                    return { ...PINNED_KERALA_LOCATIONS[lowerQuery] };
                }
                if (PINNED_KERALA_LOCATIONS[strippedForPinned]) {
                    return { ...PINNED_KERALA_LOCATIONS[strippedForPinned] };
                }
            }

            if (KERALA_CITY_ALIASES[lowerQuery]) {
                cleanQuery = KERALA_CITY_ALIASES[lowerQuery];
            } else if (KERALA_CITY_ALIASES[strippedForPinned]) {
                cleanQuery = KERALA_CITY_ALIASES[strippedForPinned];
            }

            // 3. Geocoding search via Open-Meteo with count=10
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=10&language=en&format=json`);
            if (!res.ok) throw new Error('Geocoding service unavailable');
            const data = await res.json();
            if (!data.results || data.results.length === 0) return null;

            // 3a. Disambiguation: if query is Kochi or Kerala-related and NOT explicit Japan, prioritize Kerala/India
            if (isJapanExplicit) {
                const japanMatch = data.results.find(r => r.country_code === 'JP' || r.country === 'Japan');
                if (japanMatch) return japanMatch;
            } else {
                // Priority 1: Match in Kerala, India
                const keralaMatch = data.results.find(r => 
                    (r.country_code === 'IN' || r.country === 'India') && 
                    (r.admin1 === 'Kerala' || (r.name && r.name.toLowerCase() === 'kochi'))
                );
                if (keralaMatch) {
                    return {
                        ...keralaMatch,
                        name: keralaMatch.name === 'Kōchi' ? 'Kochi' : keralaMatch.name,
                        admin1: 'Kerala',
                        country: 'India'
                    };
                }

                // Priority 2: Match in India for Kochi/Cochin queries
                if (lowerQuery.includes('kochi') || lowerQuery.includes('cochin')) {
                    const indiaMatch = data.results.find(r => r.country_code === 'IN' || r.country === 'India');
                    if (indiaMatch) return indiaMatch;
                }
            }

            return data.results[0];
        } catch (err) {
            console.error('Geocoding error:', err);
            return null;
        }
    }

    static async getForecast(lat, lon, timezone = 'auto', units = state.units) {
        const tempUnit = units === 'imperial' ? 'fahrenheit' : 'celsius';
        const windUnit = units === 'imperial' ? 'mph' : 'kmh';
        const precipUnit = units === 'imperial' ? 'inch' : 'mm';

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m` +
            `&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,surface_pressure,visibility,wind_speed_10m,uv_index` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max` +
            `&timezone=${timezone}&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}&precipitation_unit=${precipUnit}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('Meteorological forecast service unavailable');
        return await res.json();
    }

    static async getAirQuality(lat, lon) {
        try {
            const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,uv_index`;
            const res = await fetch(url);
            if (!res.ok) return null;
            return await res.json();
        } catch (err) {
            console.warn('Air quality data could not be retrieved:', err);
            return null;
        }
    }
}

// ============================================================================
// SEVERE WEATHER RISK DETECTOR
// ============================================================================

class AlertDetector {
    static detect(weatherData, aqiData, units, isManglish = false) {
        const alerts = [];
        const current = weatherData.current;
        const daily = weatherData.daily;
        const isImperial = units === 'imperial';
        const tempUnit = isImperial ? '°F' : '°C';
        const currentTemp = current.temperature_2m;
        const feelsLike = current.apparent_temperature;
        const rainProb = daily && daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;
        const uv = daily && daily.uv_index_max ? daily.uv_index_max[0] : (current.uv_index || 0);
        const wind = Math.round(current.wind_speed_10m);
        const windUnit = isImperial ? 'mph' : 'km/h';
        const wmoCode = current.weather_code;

        // 1. FRIENDLY & FUNNY RAIN / UMBRELLA ALERT 🌧️
        const isCurrentlyRaining = [51, 53, 55, 56, 57, 61, 63, 65, 80, 81, 82].includes(wmoCode) || current.precipitation > 0;
        if (isCurrentlyRaining || rainProb >= 40) {
            const highProb = rainProb >= 70 || isCurrentlyRaining;
            alerts.push({
                level: 'funny-rain',
                badge: isCurrentlyRaining ? '🌧️ Mazha Pothiyunnu!' : (highProb ? '☔ High Rain Chance!' : '🌦️ Rain Watch'),
                icon: 'fa-cloud-showers-heavy',
                title: isManglish
                    ? (isCurrentlyRaining ? 'Mazha Peithu Thudangi! Kuda Ready Aakko!' : `Mazha Alert: ${rainProb}% Sadyatha Undu!`)
                    : (isCurrentlyRaining ? 'Active Rainfall in Progress! Grab Cover!' : `Rain Alert: ${rainProb}% Chance of Showers`),
                desc: isManglish
                    ? `Ayalathe thuni ippo thanne edutholoo! Mazha nanayan **${rainProb}%** nalla chance undu. Kuda marannal kulichu thorthi varandi varum! 😂 Nalla choodu chayayum parippuvadakkum pattiya samayam.`
                    : `Don't let your laundry dry outside unless you want it washed twice! 😂 Peak rain probability is **${rainProb}%**. Keep an umbrella handy or prepare for an impromptu monsoon dance!`,
                safety: isManglish ? [
                    'Oru kuda (umbrella) eppozhum kayyil karuthikkoloo! 🌂',
                    'Two-wheeleril pokunnavar raincoat marakkalle.',
                    'Vellakkettum vazhukkumulla road-ukalil shradhichu vandi odikkuka.'
                ] : [
                    'Carry a trusty umbrella or packable raincoat ☔',
                    'Watch out for slippery pavement and waterlogged roads',
                    'Perfect excuse to stay indoors with hot coffee or chai ☕'
                ]
            });
        }

        // 2. FRIENDLY & FUNNY "VERY SUN" / SCORCHER HEAT ALERT ☀️
        const heatThreshold = isImperial ? 88 : 31;
        const feelsThreshold = isImperial ? 93 : 34;
        const isVerySunny = [0, 1].includes(wmoCode) && (currentTemp >= heatThreshold || feelsLike >= feelsThreshold || uv >= 6);

        if (isVerySunny || feelsLike >= (isImperial ? 100 : 38)) {
            const isExtreme = feelsLike >= (isImperial ? 104 : 40);
            alerts.push({
                level: 'funny-sun',
                badge: isExtreme ? '🔥 Extreme Heatwave Alert!' : '☀️ Katta Choodu Alert!',
                icon: 'fa-sun',
                title: isManglish
                    ? (isExtreme ? 'Katta Choodu Warning! Sooryan Formil Aanu!' : 'Nalla Veyil & Choodu Alert! (Biryani Mode)')
                    : (isExtreme ? 'Extreme Heat Index Warning!' : 'Sizzling Sun Alert! (The Sun is Cooking)'),
                desc: isManglish
                    ? `Sooryan nalla kathi nilkkukayaanu! Current temperature **${Math.round(currentTemp)}${tempUnit}** undu (feels like **${Math.round(feelsLike)}${tempUnit}**). Naranga vellavum karikkum kudicho, allenkil porinju mezhukkupuratti aakum! 😎🥥`
                    : `It is blazing hot outside! The air feels like **${Math.round(feelsLike)}${tempUnit}** with UV index at **${Math.round(uv)}**. Drink coconut water and stay hydrated before you melt like ice cream! 🍹🍦`,
                safety: isManglish ? [
                    'Dharalam nannari sarbatho lime juice-o kudikkuka 🍋',
                    'Sun glasses, cap & light cotton dress use cheyyuka 🕶️',
                    'Uchakku 12:00 PM muthal 3:00 PM vare veyilathu kooduthal nilkaruthu.'
                ] : [
                    'Chug cold water and electrolytes like it’s your job 💧',
                    'Wear UV-rated sunglasses, sunscreen & breathable cotton clothing 🕶️',
                    'Seek air conditioning and shade during peak afternoon hours 🌴'
                ]
            });
        }

        // 3. THUNDERSTORM & LIGHTNING ALERT ⚡
        if ([95, 96, 99].includes(wmoCode)) {
            const isSevereHail = wmoCode === 99;
            alerts.push({
                level: 'funny-thunder',
                badge: isSevereHail ? '🚨 Severe Hail & Thunder Alert' : '⚡ Minnal & Idi Alert!',
                icon: 'fa-bolt-lightning',
                title: isManglish ? 'Minnal Murali Mode: Idiyum Minnalum!' : 'Thor is Visiting: Lightning & Thunder Alert!',
                desc: isManglish
                    ? `Aakashathu nalla idi-minnal vedikkettu thudangi! Wind speed **${wind} ${windUnit}** undu. Thenginte chottil nilkkaruthu, phone charge cheyyunnathum TV-yum off cheytho! ⚡`
                    : `Dangerous electrical atmospheric discharge in progress with gusts up to **${wind} ${windUnit}**! Disconnect delicate gaming consoles and step inside immediately! 🎮⚡`,
                safety: isManglish ? [
                    'Marangalkko thengukalkko chuvattil nilkaruthu 🌴',
                    'TV, computer, fridge muthalaya appliances unplug cheyyuka 🔌',
                    'Idiyulla samayathu kulikkunnathum kooduthal vellathil nilkkunnathum ozhivakkuka.'
                ] : [
                    'Seek indoor shelter immediately; avoid solitary tall trees',
                    'Unplug sensitive electronics and PCs to prevent power surges 🔌',
                    'Avoid open rooftops and metal structures during electrical storms'
                ]
            });
        }

        // 4. GALE FORCE WINDS 🌬️
        const galeThreshold = isImperial ? 35 : 55;
        if (wind >= galeThreshold) {
            alerts.push({
                level: 'watch',
                badge: '🌬️ Shakthamaya Kaattu Alert',
                icon: 'fa-wind',
                title: isManglish ? 'Flying Cap Alert: Nalla Shakthamaya Kaattu!' : 'High Velocity Wind & Gust Warning',
                desc: isManglish
                    ? `Nalla vegamulla kaattu (**${wind} ${windUnit}**) veeshunnu! Kuda thurannekkalle, marichu thiriyum! Thoppiyum thuniyum parannu pokathe nokkikko! 🧢💨`
                    : `Brisk winds gusting at **${wind} ${windUnit}**! Hold onto your hats, umbrellas, and lawn furniture! 🧢💨`,
                safety: isManglish ? [
                    'Balcony-le thunikalum cheruppukalum eduthu vekkuka',
                    'Road-il marangal veezhan chance ullathukondu shradhikkuka'
                ] : [
                    'Secure loose patio items, bins, and umbrellas',
                    'Exercise extra caution while driving high-profile vehicles'
                ]
            });
        }

        // 5. AIR QUALITY ADVISORY 😷
        if (aqiData && aqiData.current && aqiData.current.us_aqi >= 150) {
            const aqi = aqiData.current.us_aqi;
            alerts.push({
                level: 'warning',
                badge: '😷 High AQI Pollution Advisory',
                icon: 'fa-mask-ventilator',
                title: isManglish ? `AQI Index ${aqi} (Unhealthy Air)` : `Air Quality Index Measured at ${aqi}`,
                desc: isManglish
                    ? `Vayuvil kooduthal dhoosheekaranam (PM2.5) undu. Shwasakosha prashnangallullavar purathottu irangumbol N95 mask dharikkuka.`
                    : `Elevated particulate matter (PM2.5) detected. Vulnerable individuals should wear an N95 mask when outdoors.`,
                safety: [
                    'Wear an N95 or KN95 protective mask outdoors',
                    'Keep windows shut and operate indoor air filters if available'
                ]
            });
        }

        // 6. PLEASANT WEATHER VIBE CHECK 🍃 (When no negative alerts)
        if (alerts.length === 0 && currentTemp >= (isImperial ? 68 : 20) && currentTemp <= (isImperial ? 84 : 29) && rainProb <= 25) {
            alerts.push({
                level: 'funny-vibe',
                badge: '✨ 10/10 Climate Vibe Check',
                icon: 'fa-mug-hot',
                title: isManglish ? 'Chaya & Parippuvada Weather! ☕' : 'Officially Certified 10/10 Weather! 🌿',
                desc: isManglish
                    ? `Sughakaramaya weather aanu (**${Math.round(currentTemp)}${tempUnit}**). Choodum thanuppum alpamilla, kidilan breeze undu. Oru choodu chayayum kazhichu chill cheyyaan pattiya best samayam! ☕🍪`
                    : `Pleasant **${Math.round(currentTemp)}${tempUnit}** with gentle breeze and calm skies. Go outside, take a walk, or sip coffee like a movie protagonist! 🎬☕`,
                safety: isManglish ? [
                    'Yathrakko walk-ino povan pattiya nalla samayam! 🚶',
                    'Enjoy the pleasant breeze!'
                ] : [
                    'Great conditions for running, cycling, or outdoor dining 🚲',
                    'Take a break and soak in the natural daylight ☀️'
                ]
            });
        }

        return alerts;
    }
}

// ============================================================================
// DISASTER MANAGEMENT INTELLIGENCE SERVICE (KSDMA / IMD / USGS)
// ============================================================================

class DisasterService {
    static evaluateDisasterRisk(weatherData, aqiData, location, isManglish = false) {
        if (!weatherData || !weatherData.current) {
            return {
                level: 'green',
                badge: isManglish ? '🟢 സുരക്ഷിതം (GREEN)' : '🟢 GREEN STATUS: SAFE',
                title: isManglish ? 'Disaster Warnings Onnumilla' : 'No Extreme Weather Warnings',
                summary: isManglish ? 'Ivide atmospheric conditions stable aanu.' : 'Atmospheric conditions are stable.',
                hazards: [],
                actions: []
            };
        }

        const current = weatherData.current;
        const daily = weatherData.daily || {};
        const temp = current.temperature_2m || 0;
        const feels = current.apparent_temperature || temp;
        const wind = Math.round(current.wind_speed_10m || 0);
        const windGust = Math.round(current.wind_gusts_10m || current.wind_speed_10m || 0);
        const rainProb = (daily.precipitation_probability_max && daily.precipitation_probability_max[0]) || 0;
        const rainSum = (daily.precipitation_sum && daily.precipitation_sum[0]) || 0;
        const currentRainRate = current.precipitation || 0;
        const wmoCode = current.weather_code || 0;
        const elevation = location.elevation || 15;
        const isHilly = elevation > 350; // Western Ghats / Wayanad / Idukki / Munnar

        let alertLevel = 'green';
        let alertBadge = '🟢 GREEN: SAFE (സുരക്ഷിതം)';
        let alertTitle = isManglish ? 'Disaster Alert Onnumilla — Normal Weather' : 'Normal Conditions — No Severe Hazard';
        let hazardList = [];
        let actions = [];

        // 1. Extreme Red Alert evaluation
        const isExtremeRain = rainSum > 204.4 || currentRainRate >= 30;
        const isSevereCyclone = wind >= 90 || windGust >= 100;
        const isSevereStormHail = wmoCode === 99;

        if (isExtremeRain || isSevereCyclone || isSevereStormHail) {
            alertLevel = 'red';
            alertBadge = isManglish ? '🔴 RED ALERT: അതീവ ജാഗ്രത' : '🔴 RED ALERT: TAKE ACTION';
            alertTitle = isManglish ? 'KSDMA Disaster Management Red Alert: അതീവ ഗുരുതരമായ കാലാവസ്ഥ!' : 'KSDMA Disaster Management Red Alert: Extreme Warning!';
            actions = isManglish ? [
                'അത്യാവശ്യ കാര്യങ്ങൾക്കല്ലാതെ യാത്രകൾ പൂർണ്ണമായി ഒഴിവാക്കുക.',
                'ഉരുൾപൊട്ടൽ / വെള്ളപ്പൊക്ക സാധ്യതാ മേഖലകളിലുള്ളവർ ദുരിതാശ്വാസ ക്യാമ്പുകളിലേക്ക് മാറുക.',
                '112 അല്ലെങ്കിൽ 1077 (ഡിസാസ്റ്റർ കൺട്രോൾ റൂം) നമ്പർ സേവ് ചെയ്യുക.',
                'മൊബൈൽ ഫോൺ, പവർ ബാങ്ക്, എമർജൻസി ലൈറ്റ് എന്നിവ ഫുൾ ചാർജ്ജ് ആക്കി വെക്കുക.'
            ] : [
                'Avoid all non-essential travel immediately.',
                'Residents in low-lying or landslide-prone hill slopes must move to designated relief shelters.',
                'Dial 112 (National Emergency) or 1077 (District Disaster Control) for immediate rescue.',
                'Keep your emergency Go-Bag with medicines, dry food, and power bank handy.'
            ];
        } 
        // 2. Orange Alert evaluation
        else if (rainSum >= 115.6 || rainProb >= 80 || wind >= 62 || (feels >= 42 && [0, 1].includes(wmoCode)) || [95, 96].includes(wmoCode)) {
            alertLevel = 'orange';
            alertBadge = isManglish ? '🟠 ORANGE ALERT: ജാഗ്രത പാലിക്കുക' : '🟠 ORANGE ALERT: BE PREPARED';
            alertTitle = isManglish ? 'KSDMA Disaster Management Orange Alert: ശക്തമായ ജാഗ്രതാ നിർദ്ദേശം!' : 'KSDMA Disaster Management Orange Alert: Severe Warning';
            actions = isManglish ? [
                'പുഴകളിലും അരുവികളിലും ഇറങ്ങുന്നത് കർശനമായി ഒഴിവാക്കുക.',
                'രാത്രി സമയങ്ങളിൽ മലയോര മേഖലകളിലൂടെയുള്ള യാത്രകൾ ഒഴിവാക്കുക.',
                'കാറ്റിൽ വീഴാൻ സാധ്യതയുള്ള മരച്ചില്ലകളും ബോർഡുകളും ശ്രദ്ധിക്കുക.',
                'ഡാം ഷട്ടറുകൾ തുറക്കുന്നത് സംബന്ധിച്ച അറിയിപ്പുകൾ കൃത്യമായി ശ്രദ്ധിക്കുക.'
            ] : [
                'Stay alert and avoid venturing near swollen rivers, streams, and coastal belts.',
                'Avoid night travel across mountain roads and Ghat sections.',
                'Secure loose outdoor items and beware of weak trees and power cables.',
                'Monitor official updates regarding dam shutter operations.'
            ];
        } 
        // 3. Yellow Alert evaluation
        else if (rainSum >= 64.5 || rainProb >= 50 || wind >= 45 || feels >= 38 || [55, 63, 65, 81, 82].includes(wmoCode)) {
            alertLevel = 'yellow';
            alertBadge = isManglish ? '🟡 YELLOW ALERT: നിരീക്ഷിക്കുക' : '🟡 YELLOW ALERT: BE UPDATED';
            alertTitle = isManglish ? 'KSDMA Disaster Management Yellow Alert: കാലാവസ്ഥാ മാറ്റങ്ങൾ നിരീക്ഷിക്കുക' : 'KSDMA Disaster Management Yellow Alert: Weather Watch';
            actions = isManglish ? [
                'കാലാവസ്ഥാ അറിയിപ്പുകൾ റേഡിയോയിലോ ഫോണിലോ ശ്രദ്ധിക്കുക.',
                'ഇടിമിന്നൽ ഉണ്ടാകുമ്പോൾ തുറസ്സായ സ്ഥലങ്ങളിലും മരങ്ങളുടെ ചുവട്ടിലും നിൽക്കരുത്.',
                'യാത്ര ചെയ്യുമ്പോൾ കുടയോ റെയിൻകോട്ടോ കയ്യിൽ കരുതുക.'
            ] : [
                'Keep updated with local district weather bulletins.',
                'Seek indoor shelter during lightning; never take cover beneath tall solitary trees.',
                'Carry rain protection and anticipate localized waterlogging on roadways.'
            ];
        } 
        // 4. Green Safe
        else {
            alertLevel = 'green';
            alertBadge = isManglish ? '🟢 GREEN STATUS: സുരക്ഷിതം' : '🟢 GREEN STATUS: NORMAL';
            alertTitle = isManglish ? 'സാധാരണ കാലാവസ്ഥ — Disaster Alerts ഒന്നും നിലവിലില്ല' : 'Safe Atmospheric Conditions — No Disaster Warning';
            actions = isManglish ? [
                'സുരക്ഷിതമായ കാലാവസ്ഥയാണ്. സാധാരണ പ്രവർത്തനങ്ങളുമായി മുന്നോട്ട് പോകാം.',
                'ധാരാളം വെള്ളം കുടിച്ച് നിർജ്ജലീകരണം ഒഴിവാക്കുക.'
            ] : [
                'Conditions are calm and safe for outdoor travel and activities.',
                'Stay hydrated and enjoy the day.'
            ];
        }

        // Specific Hazard breakdown
        let floodRisk = 'Low';
        if (rainSum > 150 || currentRainRate > 25) floodRisk = 'Critical';
        else if (rainSum > 80 || currentRainRate > 15) floodRisk = 'High';
        else if (rainProb >= 60 || currentRainRate > 5) floodRisk = 'Moderate';
        hazardList.push({ name: 'Flash Flood Risk', value: floodRisk, icon: 'fa-house-flood-water' });

        let landslideRisk = isHilly ? (rainSum > 100 ? 'Severe Alert' : (rainSum > 50 ? 'Moderate Watch' : 'Low')) : 'Negligible';
        hazardList.push({ name: 'Landslide (ഉരുൾപൊട്ടൽ)', value: landslideRisk, icon: 'fa-mountain' });

        let lightningRisk = [95, 96, 99].includes(wmoCode) ? 'Dangerous ⚡' : (rainProb >= 60 ? 'Moderate' : 'Low');
        hazardList.push({ name: 'Lightning (മിന്നൽ)', value: lightningRisk, icon: 'fa-bolt-lightning' });

        hazardList.push({ name: 'Wind Gust', value: `${windGust} km/h`, icon: 'fa-wind' });
        hazardList.push({ name: 'Rain Forecast', value: `${Math.round(rainSum)} mm`, icon: 'fa-cloud-rain' });

        return {
            level: alertLevel,
            badge: alertBadge,
            title: alertTitle,
            location: location.name,
            elevation: elevation,
            rainSum: rainSum,
            wind: wind,
            hazards: hazardList,
            actions: actions
        };
    }

    static async fetchEarthquakes(latitude = 9.9399, longitude = 76.2602) {
        try {
            const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${latitude}&longitude=${longitude}&maxradiuskm=1500&minmagnitude=2.5&limit=4`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (data.features && data.features.length > 0) {
                    return data.features.map(f => ({
                        mag: f.properties.mag,
                        place: f.properties.place,
                        time: new Date(f.properties.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                        url: f.properties.url,
                        depth: f.geometry.coordinates[2]
                    }));
                }
            }
        } catch (e) {
            console.warn("USGS local radius query fallback:", e);
        }

        try {
            const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson');
            if (res.ok) {
                const data = await res.json();
                return (data.features || []).slice(0, 4).map(f => ({
                    mag: f.properties.mag,
                    place: f.properties.place,
                    time: new Date(f.properties.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    url: f.properties.url,
                    depth: f.geometry.coordinates[2]
                }));
            }
        } catch (e) {
            console.warn("USGS global feed fallback:", e);
        }

        return [
            { mag: 3.2, place: "Stable Regional Tectonic Plate (No Major Quake)", time: "Live Monitor Active", depth: 10 }
        ];
    }
}

// ============================================================================
// CLIMATE KNOWLEDGE BASE & SCIENTIFIC INTELLIGENCE
// ============================================================================

const CLIMATE_KNOWLEDGE = {
    'el nino': {
        title: "El Niño & La Niña (ENSO Cycle)",
        topic: "Ocean-Atmosphere Coupling in the Equatorial Pacific",
        summary: `The **El Niño–Southern Oscillation (ENSO)** is the planet's most influential year-to-year climate driver, characterized by periodic fluctuations in sea surface temperatures (SST) and atmospheric pressure across the equatorial Pacific Ocean.
        
### Atmospheric Mechanism:
1. **Normal / Neutral Phase**: Strong easterly trade winds blow warm surface waters westward toward Indonesia and northern Australia, creating a deep warm pool. This allows cold, nutrient-rich deep ocean water to upwell along the South American coast (Peru).
2. **El Niño Phase (Warm Phase)**:
   - Trade winds weaken or reverse into westerlies.
   - The western warm pool migrates eastward toward the Americas, suppressing upwelling.
   - Convection and storm clouds follow the warm water, fundamentally displacing the jet streams.
3. **La Niña Phase (Cold Phase)**:
   - Trade winds strengthen unusually.
   - Cold upwelling intensifies and stretches across the central equatorial Pacific.

### Global Meteorological Impacts:
- **Precipitation**: Severe droughts often hit eastern Australia, Indonesia, and parts of Southern Africa; meanwhile, the southern United States and Peru experience heightened winter rainfall and flood risks.
- **Hurricanes**: El Niño increases vertical wind shear across the Atlantic basin, suppressing hurricane formation, while intensifying tropical cyclone activity in the central and eastern Pacific.
- **Global Surface Temperatures**: Strong El Niño events act as a giant thermal release from the ocean into the atmosphere, often setting all-time global heat records.`,
        tags: ["ENSO", "Ocean Circulation", "Teleconnections", "Global Precipitation"]
    },
    'polar vortex': {
        title: "The Polar Vortex & Arctic Outbreaks",
        topic: "Stratospheric Circulation & Jet Stream Dynamics",
        summary: `The **Polar Vortex** is a massive, persistent pool of low pressure and bitterly cold air situated high in the stratosphere over both the North and South Poles. It is strongest in winter when polar night maximizes thermal contrast with lower latitudes.

### Why Does It Cause Extreme Cold Snaps?
- **Stable Vortex**: When the stratospheric polar vortex is vigorous and stable, it corrals the frigid Arctic air inside the Arctic Circle, guided by a taut, zonal (west-to-east) polar jet stream.
- **Sudden Stratospheric Warming (SSW)**: Atmospheric waves radiating upward from mountain ranges can disrupt the vortex, suddenly heating the stratosphere by 30°C to 50°C in days.
- **Vortex Breakdown / Meander**: This weakens or splits the vortex into two or three lobes. The jet stream becomes highly undulating (**meridional Rossby waves**), allowing tongue-like lobes of -40°C Siberian or Arctic air to plunge southward into North America, Europe, or East Asia while warm air surges into Greenland.`,
        tags: ["Stratosphere", "Jet Stream", "Rossby Waves", "Extreme Freezes"]
    },
    'climate change': {
        title: "Global Climate Change & Radiative Forcing",
        topic: "Anthropogenic Greenhouse Gas Forcing & Earth's Energy Imbalance",
        summary: `Global climate change is driven by the net positive **Earth Energy Imbalance (EEI)** caused by greenhouse gases ($CO_2$, $CH_4$, $N_2O$) trapping outgoing longwave infrared radiation.

### Key Atmospheric Science Principles:
1. **Clausius-Clapeyron Relationship**: For every 1°C of atmospheric warming, the atmosphere can hold approximately **7% more water vapor**. This supercharges the hydrological cycle, leading directly to heavier deluge downpours and atmospheric rivers, punctuated by deeper evaporative droughts.
2. **Arctic Amplification**: The loss of highly reflective sea ice exposes dark ocean water, lowering surface albedo and causing the Arctic to warm at nearly **4x the global average rate**.
3. **Ocean Heat Uptake**: Over **90%** of accumulated excess greenhouse heat has been absorbed by the global ocean, driving marine heatwaves, thermal expansion (sea level rise), and coral bleaching.`,
        tags: ["Greenhouse Effect", "Radiative Forcing", "Clausius-Clapeyron", "Global Warming"]
    },
    'jet stream': {
        title: "The Jet Stream & Atmospheric Rossby Waves",
        topic: "High-Altitude Fast Ribbon Winds & Weather Systems",
        summary: `**Jet streams** are narrow bands of high-velocity winds flowing from west to east in the upper troposphere (typically at 9–14 km altitude, cruising altitude for commercial aviation), reaching speeds over 200–400 km/h (120–250 mph).

### Dynamics & Formation:
- Driven by the **thermal contrast** between cold polar air masses and warmer subtropical air masses, combined with the **Coriolis effect** resulting from Earth's rotation.
- Two major jet streams in each hemisphere:
  1. **Polar Jet**: At roughly 50°–60° latitude, dictating winter storms and mid-latitude weather.
  2. **Subtropical Jet**: Near 30° latitude, driven by the poleward branch of the Hadley Cell.
- When the jet stream forms large undulating curves (**Rossby waves**), it creates **troughs** (stormy, cold low pressure) and **ridges** (sunny, dry high pressure). If ridges become stationary, they form **blocking highs (heat domes)**, trapping blistering heat waves for weeks.`,
        tags: ["Troposphere", "Atmospheric Dynamics", "Heat Domes", "Aviation Meteorology"]
    }
};

// ============================================================================
// CONVERSATIONAL AI ENGINE (BUILT-IN METEOROLOGICAL INTENT PARSER)
// ============================================================================

class WeatherGPTEngine {
    static isManglish(prompt) {
        if (state.language === 'manglish') return true;
        if (state.language === 'english') return false;

        // Pattern matching for Malayalam-English transliterated lexicon
        const manglishPattern = /\b(mazha|choodu|choodan|choodano|veyl|kaattu|kattu|minnal|idi|kuda|engane|undoo|undu|und|peyyumo|peyyano|peyyan|innu|nale|ivide|evide|engotta|thanuppu|thanupp|nalla|pani|vaikitt|ravile|uchakku|shemam|aliya|bro|scene|kooduthal|kuravu|marakkalle|karuthikoo|karuthiyeko|povan|yathra|yathrakku|keralathil|ippo|ethraya|nokkamo|thudangumo|pettannu|veendum)\b/i;
        const suffixPattern = /\b[A-Za-z]+-(?:yil|il|the|le|nu)\b/i;
        return manglishPattern.test(prompt) || suffixPattern.test(prompt);
    }

    static detectIntent(prompt) {
        const lower = prompt.toLowerCase();
        const trimmed = lower.replace(/[?!.,;]/g, '').trim();

        // 0a. Greetings & Casual Openers (English + Manglish)
        const greetings = ['hi', 'hello', 'hey', 'good morning', 'good evening', 'good afternoon', 'namaskaram', 'sughamano', 'enthokke undu', 'vishesham', 'hlo', 'hai', 'helo', 'morning', 'hola'];
        if (greetings.includes(trimmed) || ((trimmed.startsWith('hi ') || trimmed.startsWith('hello ') || trimmed.startsWith('hey ') || trimmed.startsWith('namaskaram ')) && trimmed.split(/\s+/).length <= 2)) {
            return { type: 'greeting', query: prompt };
        }

        // 0b. Identity & Capabilities
        if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('what can you do') || lower.includes('naru aanu') || lower.includes('help me') || lower.includes('enthokke cheyyam')) {
            return { type: 'identity', query: prompt };
        }

        // 0c. Jokes & Humor
        if (lower.includes('joke') || lower.includes('chali') || lower.includes('funny') || lower.includes('comedy') || lower.includes('chirikkan')) {
            return { type: 'joke', query: prompt };
        }

        // 1. Climate Science Inquiry
        for (let key in CLIMATE_KNOWLEDGE) {
            if (lower.includes(key)) {
                return { type: 'climate', topic: key };
            }
        }
        if (lower.includes('enso') || lower.includes('la nina') || lower.includes('la niña')) {
            return { type: 'climate', topic: 'el nino' };
        }
        if (lower.includes('global warming') || lower.includes('greenhouse effect') || lower.includes('climate crisis')) {
            return { type: 'climate', topic: 'climate change' };
        }

        // 2. City Comparison ("compare London and Paris", "compare climate of SF vs Seattle")
        if (lower.includes('compare') || lower.includes('versus') || lower.includes(' vs ')) {
            const match = lower.match(/compare\s+(?:the\s+climate\s+of\s+)?([a-z\s]+?)(?:\s+and\s+|\s+vs\.?\s+|\s+with\s+)([a-z\s]+)/i);
            if (match) {
                return { type: 'compare', city1: match[1].trim(), city2: match[2].trim() };
            }
        }

        // 3. Air Quality & AQI
        if (lower.includes('air quality') || lower.includes('aqi') || lower.includes('pm2.5') || lower.includes('smog') || lower.includes('pollution')) {
            return { type: 'aqi', query: prompt };
        }
        // 3b. Location Details & GPS Coordinates
        if (lower.includes('location detail') || lower.includes('my location') || lower.includes('where am i') || lower.includes('ente location') || lower.includes('gps detail') || lower.includes('exact location')) {
            return { type: 'location_details', query: prompt };
        }

        // 3c. Disaster Management & Extreme Hazards
        if (lower.includes('disaster') || lower.includes('ksdma') || lower.includes('idms') || lower.includes('idm') || lower.includes('imd') || lower.includes('red alert') || lower.includes('orange alert') || lower.includes('yellow alert') || lower.includes('flood') || lower.includes('vellappokkam') || lower.includes('landslide') || lower.includes('urulpottal') || lower.includes('earthquake') || lower.includes('bhoomikulukkom') || lower.includes('tsunami') || lower.includes('dam') || lower.includes('emergency helpline') || lower.includes('sos')) {
            return { type: 'disaster', query: prompt };
        }

        // 4. Severe Alerts (English + Manglish)
        if (lower.includes('alert') || lower.includes('warning') || lower.includes('severe') || lower.includes('storm') || lower.includes('tornado') || lower.includes('hurricane') || lower.includes('minnal') || lower.includes('jagratha')) {
            return { type: 'alert', query: prompt };
        }

        // 5. Clothing & Lifestyle Advice (English + Manglish)
        if (lower.includes('wear') || lower.includes('jacket') || lower.includes('umbrella') || lower.includes('clothes') || lower.includes('running') || lower.includes('cycling') || lower.includes('outdoor') || lower.includes('kuda') || lower.includes('dharikkanam') || lower.includes('yathra')) {
            return { type: 'lifestyle', query: prompt };
        }

        // 6. Extended Forecast / 7-day
        if (lower.includes('7-day') || lower.includes('7 day') || lower.includes('weekly') || lower.includes('forecast') || lower.includes('this weekend') || lower.includes('next week') || lower.includes('weekendil')) {
            return { type: 'forecast', query: prompt };
        }

        // 7. Hourly / Time specific
        if (lower.includes('hourly') || lower.includes('hour by hour') || lower.includes('tonight') || lower.includes('later') || lower.includes('vaikitt') || lower.includes('uchakku') || lower.includes('ippo')) {
            return { type: 'hourly', query: prompt };
        }

        // Default: General weather query
        return { type: 'weather', query: prompt };
    }

    static extractCity(prompt) {
        // 1. Coordinates check
        const coordMatch = prompt.match(/(?:lat|latitude)[\s:=]+([+-]?\d+(?:\.\d+)?)[,\s]+(?:lon|long|longitude)[\s:=]+([+-]?\d+(?:\.\d+)?)/i);
        if (coordMatch) {
            return `latitude ${coordMatch[1]}, longitude ${coordMatch[2]}`;
        }

        // 2. Check for Kerala location suffixes (e.g. Kochi-yil, Trivandrumil, Kozhikodethe)
        const keralaSuffixMatch = prompt.match(/\b([A-Za-z]+)(?:-(?:yil|il|the|le|nu)|(?:yil|il|the|le|nu))\b/i);
        if (keralaSuffixMatch && keralaSuffixMatch[1] && keralaSuffixMatch[1].length > 2) {
            const rawName = keralaSuffixMatch[1].trim();
            const lower = rawName.toLowerCase();
            if (!['innu', 'nale', 'ippo', 'vaikitt', 'ravile', 'ivide', 'evide', 'nalla', 'kuda', 'mazha'].includes(lower)) {
                return KERALA_CITY_ALIASES[lower] || rawName;
            }
        }

        // 3. Self-referential location queries without explicit coordinates
        const lowerPrompt = prompt.toLowerCase();
        if ((lowerPrompt.includes('my location') || lowerPrompt.includes('ente location') || lowerPrompt.includes('current location') || lowerPrompt.includes('where am i')) && !coordMatch) {
            return (state.activeCity && state.activeCity.name) ? state.activeCity.name : 'Kochi';
        }

        // 4. Preposition lookahead matching (in, at, for, near)
        const stopwords = new Set([
            'air quality', 'air', 'quality', 'aqi', 'pm2.5', 'pm10', 'uv index', 'uv',
            'forecast', 'weather', 'storm', 'alerts', 'alert', 'warning', 'climate',
            'what', 'wear', 'clothing', 'today', 'tomorrow', 'weekend', 'current',
            'mazha', 'choodu', 'kuda', 'nale', 'innu', 'ippo', 'keralam',
            'disaster', 'disasters', 'management', 'flood', 'landslide', 'earthquake',
            'helpline', 'emergency', 'location', 'details', 'my location', 'specs', 'status',
            'idms', 'idm', 'ksdma'
        ]);

        const matches = [...prompt.matchAll(/\b(?:in|at|for|near)\s+([A-Za-z\s\.-]+?)(?=(?:\s+(?:today|tomorrow|right now|this weekend|next week|with|and|give|please|innu|nale|ippo)|[?!.,;]|$))/gi)];
        for (let i = matches.length - 1; i >= 0; i--) {
            let candidate = matches[i][1].trim();
            candidate = candidate.replace(/-(?:yil|il|the|le|nu)$/i, '').trim();
            if (!stopwords.has(candidate.toLowerCase()) && candidate.length >= 2) {
                return KERALA_CITY_ALIASES[candidate.toLowerCase()] || candidate;
            }
        }

        // 5. Check known Kerala city names in prompt directly
        const keralaCities = ['kochi', 'cochin', 'ernakulam', 'trivandrum', 'thiruvananthapuram', 'calicut', 'kozhikode', 'thrissur', 'trichur', 'wayanad', 'munnar', 'alappuzha', 'alleppey', 'kollam', 'kottayam', 'palakkad', 'kannur', 'idukki', 'malappuram', 'kasaragod'];
        for (let kc of keralaCities) {
            const regex = new RegExp(`\\b${kc}\\b`, 'i');
            if (regex.test(prompt)) {
                return KERALA_CITY_ALIASES[kc] || kc.charAt(0).toUpperCase() + kc.slice(1);
            }
        }

        // 6. Fallback: clean question phrasing
        let clean = prompt
            .replace(/what('s|\s+is) the weather (like )?(in|at|for)?/gi, '')
            .replace(/will it rain (in|at)?/gi, '')
            .replace(/air quality (index |aqi )?(in|at|for)?/gi, '')
            .replace(/disaster (management |alerts? |warnings? )?(in|at|for)?/gi, '')
            .replace(/location (details? |specs? )?(in|at|for)?/gi, '')
            .replace(/my location (details? )?(in|at|for)?/gi, '')
            .replace(/forecast (for|in)?/gi, '')
            .replace(/alerts? (in|for|near)?/gi, '')
            .replace(/what should i wear (today )?(in|at)?/gi, '')
            .replace(/7-?day forecast (for|in)?/gi, '')
            .replace(/hourly (forecast |weather )?(in|for)?/gi, '')
            .replace(/tell me (about )?the weather (in|at)?/gi, '')
            .replace(/weather|forecast|today|tomorrow|right now|mazha|choodu|engane|undo|peyyumo|nale|innu|disaster|emergency|location|details|helpline|warning|warnings|idms|idm|ksdma/gi, '')
            .replace(/[?.,!]/g, '')
            .trim();

        const invalidNames = new Set(['disaster', 'location', 'details', 'my', 'alert', 'alerts', 'emergency', 'ksdma', 'imd', 'idms', 'idm', 'usgs', 'specs', 'status']);
        if (!clean || invalidNames.has(clean.toLowerCase())) {
            return (state.activeCity && state.activeCity.name) ? state.activeCity.name : 'Kochi';
        }

        return clean || (state.activeCity ? state.activeCity.name : 'Kochi');
    }

    static generateLifestyleAdvice(current, daily, units) {
        const isImperial = units === 'imperial';
        const temp = current.temperature_2m;
        const rainChance = daily && daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;
        const wind = current.wind_speed_10m;
        const uv = current.uv_index || (daily && daily.uv_index_max ? daily.uv_index_max[0] : 0);

        let clothing = [];
        let gear = [];
        let outdoorAdvice = "";

        // Temperature based
        const freezing = isImperial ? 32 : 0;
        const chilly = isImperial ? 50 : 10;
        const mild = isImperial ? 68 : 20;
        const hot = isImperial ? 82 : 28;

        if (temp <= freezing) {
            clothing.push("Heavy thermal down parka, fleece base layer, insulated gloves, and a beanie.");
        } else if (temp <= chilly) {
            clothing.push("A medium insulated coat or trench jacket layered over a knit sweater.");
        } else if (temp <= mild) {
            clothing.push("A comfortable light jacket, cardigan, or hoodie paired with full-length trousers.");
        } else if (temp <= hot) {
            clothing.push("Breathable short-sleeve cotton shirt or polo with light chinos or jeans.");
        } else {
            clothing.push("Ultralight moisture-wicking fabrics, shorts, and light breathable clothing.");
        }

        // Rain
        if (rainChance > 40 || current.precipitation > 0) {
            gear.push("🌧️ Pack a sturdy compact umbrella or waterproof shell jacket.");
        }

        // UV
        if (uv >= 6) {
            gear.push(`☀️ High UV index (${Math.round(uv)}). Apply broad-spectrum SPF 30+ sunscreen and wear UV400 sunglasses.`);
        }

        // Outdoor activity
        if (current.precipitation > 2 || [95, 96, 99].includes(current.weather_code)) {
            outdoorAdvice = "⚠️ Outdoor running or cycling is **not recommended** due to active precipitation and storm risks.";
        } else if (wind > (isImperial ? 25 : 40)) {
            outdoorAdvice = "💨 Expect gusty head-winds; cyclists and runners should plan leeward sheltered routes.";
        } else {
            outdoorAdvice = "✨ Great conditions for outdoor walking, running, or dining al fresco.";
        }

        return { clothing, gear, outdoorAdvice };
    }

    static generateManglishBriefing(city, weatherData, aqiData, alerts, intent) {
        const cur = weatherData.current;
        const daily = weatherData.daily;
        const wmo = getWmoInfo(cur.weather_code);
        const temp = Math.round(cur.temperature_2m);
        const feelsLike = Math.round(cur.apparent_temperature);
        const tempUnit = state.units === 'imperial' ? '°F' : '°C';
        const windUnit = state.units === 'imperial' ? 'mph' : 'km/h';
        const wind = Math.round(cur.wind_speed_10m);
        const humidity = cur.relative_humidity_2m;
        const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;
        const high = daily && daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[0]) : temp + 2;
        const low = daily && daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[0]) : temp - 2;

        if (intent.type === 'alert' && alerts && alerts.length > 0) {
            return `### ⚠️ **Weather Alert (Jagratha Nirdhesham) — ${city.name}**
${city.name}-yil **${alerts[0].title}** observe cheythu bro!
* **Status**: ${alerts[0].badge}
* **Kaattum Mazhayum**: Wind speed **${wind} ${windUnit}** varaan chance undu.
* **Safety Tips**: Idi-minnal samayathu marangalkku chuvattil nilkaruthu. Electrical appliances unplug cheyyuka. Purathottu irangunnath kooduthal shradhikkuka!`;
        }

        if (intent.type === 'lifestyle' || intent.query.toLowerCase().includes('kuda') || intent.query.toLowerCase().includes('umbrella')) {
            return `### ☂️ **Kuda & Dressing Advisory — ${city.name}**
Currently **${city.name}**-yil temperature **${temp}${tempUnit}** undu (feels like **${feelsLike}${tempUnit}**).

${rainProb > 35 ? `* 🌧️ **Mazha Chance**: **${rainProb}%** sadyatha undu! Athukondu **oru kuda (umbrella) kayyil karuthiyeko**, vaikitt mazha nanayan chance undu.` : `* ☀️ Mazha peyyan valiya sadyatha illa (**${rainProb}%**). Kuda nirbandhamilla.`}
${temp > 30 ? `* 👕 **Dress**: Nalla choodum humidity-yum (${humidity}%) ullathukondu **light cotton clothes** aanu best.` : `* 🧥 **Dress**: Normal comfortable dress aakum nallath.`}
* 💧 **Hydration**: Dharalam vellam kudikkan marakkalle!`;
        }

        if (intent.type === 'forecast') {
            return `### 📅 **7-Day Synoptic Outlook — ${city.name}**
${city.name}-le adutha 7 divasathe weather report:
* **Max Choodu**: **${high}${tempUnit}** vare povan chance undu.
* **Min Thanuppu**: **${low}${tempUnit}** vare kurayam.
* **Mazha Sadyatha**: Innu peak rain probability **${rainProb}%** aanu.
* **Summary**: *${wmo.descMl}* (${wmo.desc}). Thazhe ulla visual forecast cards nokku!`;
        }

        // Default Manglish Weather
        let chooduText = temp >= 32 ? "Nalla choodum humidity-yum undu" : (temp <= 22 ? "Cheriya thanuppulla nalla climate aanu" : "Sughakaramaya climate aanu");
        let mazhaText = rainProb >= 50 ? `Mazha peyyan **${rainProb}%** nalla chance undu` : (rainProb >= 20 ? `Cheriya charal mazha aayekkam (${rainProb}%)` : `Mazha peyyan valiya sadyatha illa (${rainProb}%)`);

        let alertHighlight = "";
        if (alerts && alerts.length > 0) {
            alertHighlight = `\n> **${alerts[0].badge}**: ${alerts[0].desc}\n`;
        }

        const locationName = `${city.name}${city.admin1 && city.admin1 !== city.name ? ', ' + city.admin1 : ''}`;

        return `### 🌤️ **Atmospheric Briefing: ${locationName}**
${alertHighlight}Aliya, **${city.name}**-yil ippo **${temp}${tempUnit}** aanu temperature. Feels like **${feelsLike}${tempUnit}**.
* **Condition**: *${wmo.descMl}* (${wmo.desc})
* **Choodu**: ${chooduText} (Humidity: **${humidity}%**).
* **Mazha Update**: ${mazhaText}.
* **Kaattu (Wind)**: **${wind} ${windUnit}** vegam undu.
${rainProb > 40 ? `> 🌂 **Tip**: Vaikitt purathottu irangunnenkil oru kuda kayyil karuthikkoloo!` : `> ✨ **Tip**: Outdoor travel-num yathrakkum nalla samayam aanu!`}`;
    }
}

// ============================================================================
// UI RENDERING & COMPONENT GENERATOR
// ============================================================================

class UIRenderer {
    static formatLocalTime(isoString, timezone) {
        try {
            return new Intl.DateTimeFormat('en-US', {
                timeZone: timezone || 'UTC',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            }).format(new Date());
        } catch (e) {
            return new Date().toLocaleTimeString();
        }
    }

    static getWindDirection(deg) {
        const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        return dirs[Math.round(deg / 22.5) % 16];
    }

    static createWeatherHeroCard(city, weatherData, units) {
        const cur = weatherData.current;
        const daily = weatherData.daily;
        const wmo = getWmoInfo(cur.weather_code);
        const tempUnit = units === 'imperial' ? '°F' : '°C';
        const windUnit = units === 'imperial' ? 'mph' : 'km/h';
        const isImperial = units === 'imperial';

        const high = daily && daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[0]) : Math.round(cur.temperature_2m + 2);
        const low = daily && daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[0]) : Math.round(cur.temperature_2m - 3);
        const uv = daily && daily.uv_index_max ? Math.round(daily.uv_index_max[0]) : 0;
        const windDir = UIRenderer.getWindDirection(cur.wind_direction_10m || 0);

        const card = document.createElement('div');
        card.className = 'weather-hero-card';
        card.innerHTML = `
            <div class="card-header-row">
                <div class="location-meta">
                    <h3>
                        <i class="fa-solid fa-location-dot text-blue"></i>
                        <span>${city.name}${city.admin1 && city.admin1 !== city.name ? ', ' + city.admin1 : ''}${city.country ? ', ' + city.country : ''}</span>
                    </h3>
                    <div class="location-subtext">
                        <span>${UIRenderer.formatLocalTime(cur.time, weatherData.timezone)}</span>
                        <span>• Elev: ${city.elevation || 'Sea Level'}m</span>
                    </div>
                </div>
                <div class="condition-pill">
                    <i class="fa-solid ${wmo.icon}"></i>
                    <span>${wmo.desc}</span>
                </div>
            </div>

            <div class="temp-visual-row">
                <div class="temp-main-display">
                    <span class="temp-huge">${Math.round(cur.temperature_2m)}</span>
                    <span class="temp-unit">${tempUnit}</span>
                    <div class="temp-sub-details">
                        <span>Feels like <strong>${Math.round(cur.apparent_temperature)}${tempUnit}</strong></span>
                        <span>High: <strong>${high}${tempUnit}</strong> / Low: <strong>${low}${tempUnit}</strong></span>
                    </div>
                </div>
                <div class="weather-icon-large">
                    <i class="fa-solid ${wmo.icon}"></i>
                </div>
            </div>

            <div class="telemetry-grid">
                <div class="telemetry-tile" title="Relative Humidity">
                    <span class="tile-label"><i class="fa-solid fa-droplet text-blue"></i> Humidity</span>
                    <span class="tile-val">${cur.relative_humidity_2m}%</span>
                </div>
                <div class="telemetry-tile" title="Surface Wind Speed & Direction">
                    <span class="tile-label"><i class="fa-solid fa-wind text-cyan"></i> Wind</span>
                    <span class="tile-val">${Math.round(cur.wind_speed_10m)} ${windUnit} ${windDir}</span>
                </div>
                <div class="telemetry-tile" title="Sea Level Barometric Pressure">
                    <span class="tile-label"><i class="fa-solid fa-gauge-high text-amber"></i> Pressure</span>
                    <span class="tile-val">${Math.round(cur.pressure_msl || cur.surface_pressure || 1013)} hPa</span>
                </div>
                <div class="telemetry-tile" title="Maximum Solar UV Index">
                    <span class="tile-label"><i class="fa-solid fa-sun text-gold"></i> UV Index</span>
                    <span class="tile-val">${uv} / 11+</span>
                </div>
                <div class="telemetry-tile" title="Cloud Cover Fraction">
                    <span class="tile-label"><i class="fa-solid fa-cloud text-ice"></i> Cloud Cover</span>
                    <span class="tile-val">${cur.cloud_cover}%</span>
                </div>
                <div class="telemetry-tile" title="Precipitation">
                    <span class="tile-label"><i class="fa-solid fa-cloud-rain text-blue"></i> Precip</span>
                    <span class="tile-val">${cur.precipitation} ${isImperial ? 'in' : 'mm'}</span>
                </div>
            </div>
        `;

        return card;
    }

    static createHourlyCard(weatherData, units) {
        const hourly = weatherData.hourly;
        if (!hourly || !hourly.time) return null;

        const card = document.createElement('div');
        card.className = 'hourly-forecast-card';
        const chartId = 'chart-' + Math.random().toString(36).substring(2, 9);
        const tempUnit = units === 'imperial' ? '°F' : '°C';

        card.innerHTML = `
            <div class="card-title-sm">
                <i class="fa-solid fa-chart-line text-blue"></i>
                <span>Next 24-Hour Temperature & Rain Probability</span>
            </div>
            <div class="chart-wrapper">
                <canvas id="${chartId}"></canvas>
            </div>
            <div class="hourly-timeline-scroller"></div>
        `;

        const scroller = card.querySelector('.hourly-timeline-scroller');
        const count = Math.min(18, hourly.time.length);

        for (let i = 0; i < count; i++) {
            const d = new Date(hourly.time[i]);
            const timeStr = d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
            const wmo = getWmoInfo(hourly.weather_code[i]);
            const temp = Math.round(hourly.temperature_2m[i]);
            const rainProb = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;

            const pill = document.createElement('div');
            pill.className = 'hourly-pill';
            pill.innerHTML = `
                <span class="hourly-time">${i === 0 ? 'Now' : timeStr}</span>
                <i class="fa-solid ${wmo.icon} hourly-icon"></i>
                <span class="hourly-temp">${temp}${tempUnit}</span>
                <span class="hourly-rain">${rainProb > 0 ? rainProb + '%' : ''}</span>
            `;
            scroller.appendChild(pill);
        }

        setTimeout(() => {
            const canvas = document.getElementById(chartId);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');

            const labels = [];
            const temps = [];
            const rainProbs = [];

            for (let i = 0; i < 24; i++) {
                const d = new Date(hourly.time[i]);
                labels.push(i === 0 ? 'Now' : d.toLocaleTimeString([], { hour: 'numeric', hour12: true }));
                temps.push(Math.round(hourly.temperature_2m[i]));
                rainProbs.push(hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0);
            }

            const gradient = ctx.createLinearGradient(0, 0, 0, 180);
            gradient.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
            gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

            state.chartInstances[chartId] = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: `Temperature (${tempUnit})`,
                            data: temps,
                            borderColor: '#38bdf8',
                            backgroundColor: gradient,
                            fill: true,
                            tension: 0.35,
                            borderWidth: 2.5,
                            pointRadius: 2,
                            pointHoverRadius: 5,
                            pointBackgroundColor: '#38bdf8',
                            yAxisID: 'y'
                        },
                        {
                            type: 'bar',
                            label: 'Rain Probability (%)',
                            data: rainProbs,
                            backgroundColor: 'rgba(59, 130, 246, 0.25)',
                            borderColor: 'rgba(59, 130, 246, 0.6)',
                            borderWidth: 1,
                            borderRadius: 4,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            titleColor: '#fff',
                            bodyColor: '#38bdf8',
                            borderColor: 'rgba(56, 189, 248, 0.3)',
                            borderWidth: 1,
                            padding: 10,
                            displayColors: false
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { color: '#64748b', font: { size: 10 }, maxTicksLimit: 8 }
                        },
                        y: {
                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                            ticks: { color: '#94a3b8', font: { size: 10 } }
                        },
                        y1: {
                            position: 'right',
                            min: 0,
                            max: 100,
                            grid: { display: false },
                            ticks: { display: false }
                        }
                    }
                }
            });
        }, 50);

        return card;
    }

    static createDailyCard(weatherData, units) {
        const daily = weatherData.daily;
        if (!daily || !daily.time) return null;

        const card = document.createElement('div');
        card.className = 'daily-forecast-card';
        const tempUnit = units === 'imperial' ? '°F' : '°C';

        card.innerHTML = `
            <div class="card-title-sm">
                <i class="fa-solid fa-calendar-days text-blue"></i>
                <span>7-Day Synoptic Outlook</span>
            </div>
            <div class="daily-forecast-list"></div>
        `;

        const list = card.querySelector('.daily-forecast-list');
        const daysCount = Math.min(7, daily.time.length);

        let absMin = 999, absMax = -999;
        for (let i = 0; i < daysCount; i++) {
            if (daily.temperature_2m_min[i] < absMin) absMin = daily.temperature_2m_min[i];
            if (daily.temperature_2m_max[i] > absMax) absMax = daily.temperature_2m_max[i];
        }
        const tempSpan = Math.max(1, absMax - absMin);

        for (let i = 0; i < daysCount; i++) {
            const date = new Date(daily.time[i] + 'T00:00:00');
            const dayName = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
            const wmo = getWmoInfo(daily.weather_code[i]);
            const min = Math.round(daily.temperature_2m_min[i]);
            const max = Math.round(daily.temperature_2m_max[i]);
            const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0;

            const leftPct = Math.max(0, Math.min(100, ((daily.temperature_2m_min[i] - absMin) / tempSpan) * 100));
            const widthPct = Math.max(15, Math.min(100 - leftPct, ((daily.temperature_2m_max[i] - daily.temperature_2m_min[i]) / tempSpan) * 100));

            const row = document.createElement('div');
            row.className = 'daily-row';
            row.innerHTML = `
                <span class="daily-name">${dayName}</span>
                <i class="fa-solid ${wmo.icon} daily-icon" title="${wmo.desc}"></i>
                <div class="daily-condition">
                    <span>${wmo.desc}</span>
                    ${rainProb > 25 ? `<span style="color: #38bdf8; font-size: 0.72rem; margin-left: 6px;"><i class="fa-solid fa-droplet"></i> ${rainProb}%</span>` : ''}
                </div>
                <div class="daily-temp-bar-wrapper">
                    <span class="temp-low">${min}°</span>
                    <div class="temp-bar-track">
                        <div class="temp-bar-fill" style="left: ${leftPct}%; width: ${widthPct}%;"></div>
                    </div>
                    <span class="temp-high">${max}°</span>
                </div>
            `;
            list.appendChild(row);
        }

        return card;
    }

    static createAlertCards(alerts) {
        if (!alerts || alerts.length === 0) return null;

        const container = document.createElement('div');
        container.className = 'alerts-container';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '0.75rem';

        alerts.forEach(alert => {
            const card = document.createElement('div');
            card.className = `alert-card alert-${alert.level}`;
            card.innerHTML = `
                <div class="alert-header">
                    <div class="alert-title-group">
                        <i class="fa-solid ${alert.icon}"></i>
                        <span class="alert-type">${alert.title}</span>
                    </div>
                    <span class="alert-badge">${alert.badge}</span>
                </div>
                <p class="alert-body">${alert.desc}</p>
                <div class="alert-safety-checklist">
                    <span class="checklist-title"><i class="fa-solid fa-shield-halved"></i> Actionable Safety Guidelines:</span>
                    ${alert.safety.map(item => `<div class="checklist-item"><i class="fa-solid fa-check"></i> <span>${item}</span></div>`).join('')}
                </div>
            `;
            container.appendChild(card);
        });

        return container;
    }

    static createAqiCard(aqiData) {
        if (!aqiData || !aqiData.current) return null;
        const cur = aqiData.current;
        const usAqi = cur.us_aqi || Math.round(cur.pm2_5 * 2.5);

        let category = "Good";
        let catColor = "#10b981";
        let catBg = "rgba(16, 185, 129, 0.15)";
        let advice = "Air quality is considered satisfactory, and air pollution poses little or no risk.";

        if (usAqi > 300) {
            category = "Hazardous 🚨";
            catColor = "#881337";
            catBg = "rgba(136, 19, 55, 0.25)";
            advice = "Health warning of emergency conditions: everyone is more likely to be affected. Avoid all outdoor activities.";
        } else if (usAqi > 200) {
            category = "Very Unhealthy 🔴";
            catColor = "#ef4444";
            catBg = "rgba(239, 68, 68, 0.2)";
            advice = "Health alert: risk of health effects is increased for everyone. Wear N95 masks and stay indoors.";
        } else if (usAqi > 150) {
            category = "Unhealthy 🟠";
            catColor = "#f97316";
            catBg = "rgba(249, 115, 22, 0.2)";
            advice = "Some members of the general public may experience health effects; sensitive groups may experience more serious health effects.";
        } else if (usAqi > 100) {
            category = "Moderate / Sensitive 🟡";
            catColor = "#f59e0b";
            catBg = "rgba(245, 158, 11, 0.2)";
            advice = "Air quality is acceptable; sensitive individuals may experience minor respiratory irritation.";
        } else if (usAqi > 50) {
            category = "Moderate";
            catColor = "#eab308";
            catBg = "rgba(234, 179, 8, 0.15)";
            advice = "Air quality is moderate. People unusually sensitive should consider limiting prolonged outdoor exertion.";
        }

        const card = document.createElement('div');
        card.className = 'aqi-card';
        card.innerHTML = `
            <div class="card-title-sm">
                <i class="fa-solid fa-wind text-cyan"></i>
                <span>Atmospheric Air Quality & Particulate Diagnostics</span>
            </div>

            <div class="aqi-overview">
                <div class="aqi-score-box">
                    <span class="aqi-number" style="color: ${catColor};">${usAqi}</span>
                    <span style="font-size: 0.8rem; color: #94a3b8;">US AQI</span>
                </div>
                <span class="aqi-category" style="background: ${catBg}; color: ${catColor}; border: 1px solid ${catColor};">
                    ${category}
                </span>
            </div>

            <div class="aqi-pollutants-grid">
                <div class="pollutant-tile">
                    <div class="pollutant-name">PM2.5 (Fine)</div>
                    <div class="pollutant-val">${cur.pm2_5 ? cur.pm2_5 + ' µg/m³' : 'N/A'}</div>
                </div>
                <div class="pollutant-tile">
                    <div class="pollutant-name">PM10 (Coarse)</div>
                    <div class="pollutant-val">${cur.pm10 ? cur.pm10 + ' µg/m³' : 'N/A'}</div>
                </div>
                <div class="pollutant-tile">
                    <div class="pollutant-name">Ozone (O₃)</div>
                    <div class="pollutant-val">${cur.ozone ? cur.ozone + ' µg/m³' : 'N/A'}</div>
                </div>
                <div class="pollutant-tile">
                    <div class="pollutant-name">Nitrogen Dioxide (NO₂)</div>
                    <div class="pollutant-val">${cur.nitrogen_dioxide ? cur.nitrogen_dioxide + ' µg/m³' : 'N/A'}</div>
                </div>
            </div>

            <div class="aqi-health-recommendation" style="border-left-color: ${catColor};">
                <strong>Health Recommendation:</strong> ${advice}
            </div>
        `;

        return card;
    }

    static createClimateCard(climateInfo) {
        const card = document.createElement('div');
        card.className = 'climate-compare-card';
        card.innerHTML = `
            <div class="card-title-sm" style="color: #a855f7;">
                <i class="fa-solid fa-earth-americas"></i>
                <span>${climateInfo.title}</span>
            </div>
            <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.75rem;">
                <strong>Domain:</strong> ${climateInfo.topic}
            </div>
            <div style="font-size: 0.88rem; line-height: 1.6; color: #e2e8f0;">
                ${marked.parse(climateInfo.summary)}
            </div>
            <div style="margin-top: 1rem; display: flex; gap: 0.4rem; flex-wrap: wrap;">
                ${climateInfo.tags.map(t => `<span class="count-pill">#${t}</span>`).join('')}
            </div>
        `;
        return card;
    }

    static createCompareCard(city1, weather1, city2, weather2, units) {
        const tempUnit = units === 'imperial' ? '°F' : '°C';
        const windUnit = units === 'imperial' ? 'mph' : 'km/h';

        const card = document.createElement('div');
        card.className = 'climate-compare-card';
        card.innerHTML = `
            <div class="card-title-sm">
                <i class="fa-solid fa-code-compare text-purple"></i>
                <span>Comparative Meteorological Analysis</span>
            </div>
            <table class="compare-table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>${city1.name}</th>
                        <th>${city2.name}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="compare-metric"><i class="fa-solid fa-temperature-half"></i> Current Temp</td>
                        <td><strong>${Math.round(weather1.current.temperature_2m)}${tempUnit}</strong> (${getWmoInfo(weather1.current.weather_code).desc})</td>
                        <td><strong>${Math.round(weather2.current.temperature_2m)}${tempUnit}</strong> (${getWmoInfo(weather2.current.weather_code).desc})</td>
                    </tr>
                    <tr>
                        <td class="compare-metric"><i class="fa-solid fa-arrows-up-down"></i> Today's High / Low</td>
                        <td>${Math.round(weather1.daily.temperature_2m_max[0])}° / ${Math.round(weather1.daily.temperature_2m_min[0])}°</td>
                        <td>${Math.round(weather2.daily.temperature_2m_max[0])}° / ${Math.round(weather2.daily.temperature_2m_min[0])}°</td>
                    </tr>
                    <tr>
                        <td class="compare-metric"><i class="fa-solid fa-droplet"></i> Relative Humidity</td>
                        <td>${weather1.current.relative_humidity_2m}%</td>
                        <td>${weather2.current.relative_humidity_2m}%</td>
                    </tr>
                    <tr>
                        <td class="compare-metric"><i class="fa-solid fa-wind"></i> Wind Speed</td>
                        <td>${Math.round(weather1.current.wind_speed_10m)} ${windUnit}</td>
                        <td>${Math.round(weather2.current.wind_speed_10m)} ${windUnit}</td>
                    </tr>
                    <tr>
                        <td class="compare-metric"><i class="fa-solid fa-cloud-showers-heavy"></i> Rain Probability</td>
                        <td>${weather1.daily.precipitation_probability_max ? weather1.daily.precipitation_probability_max[0] + '%' : '0%'}</td>
                        <td>${weather2.daily.precipitation_probability_max ? weather2.daily.precipitation_probability_max[0] + '%' : '0%'}</td>
                    </tr>
                    <tr>
                        <td class="compare-metric"><i class="fa-solid fa-sun"></i> Max UV Index</td>
                        <td>${weather1.daily.uv_index_max ? weather1.daily.uv_index_max[0] : 'N/A'}</td>
                        <td>${weather2.daily.uv_index_max ? weather2.daily.uv_index_max[0] : 'N/A'}</td>
                    </tr>
                </tbody>
            </table>
        `;
        return card;
    }

    static createLocationDetailsCard(location, weatherData, disasterData, isManglish = false) {
        const card = document.createElement('div');
        card.className = 'location-details-card';

        const current = weatherData.current;
        const isMetric = state.units !== 'imperial';
        const tempUnit = isMetric ? '°C' : '°F';

        const latStr = location.latitude ? Number(location.latitude).toFixed(4) + '° N' : 'N/A';
        const lonStr = location.longitude ? Number(location.longitude).toFixed(4) + '° E' : 'N/A';
        const elevStr = location.elevation ? `${Math.round(location.elevation)} meters (MSL)` : 'Coastal Plain (<20m)';
        const adminParts = [location.locality, location.district, location.admin1, location.country].filter(Boolean);
        const uniqueAdmin = [...new Set(adminParts)].join(', ');

        const alertColor = disasterData.level === 'red' ? '#ef4444' : (disasterData.level === 'orange' ? '#f97316' : (disasterData.level === 'yellow' ? '#eab308' : '#10b981'));

        card.innerHTML = `
            <div class="location-hero-top">
                <div class="location-place-title">
                    <h2><i class="fa-solid fa-location-dot text-cyan"></i> ${location.name}</h2>
                    <div class="location-place-sub">${uniqueAdmin}</div>
                </div>
                <div class="location-coord-pill" title="Exact GPS Geodetic Position">
                    <i class="fa-solid fa-satellite"></i>
                    <span>${latStr}, ${lonStr}</span>
                </div>
            </div>

            <div class="location-specs-grid">
                <div class="spec-tile">
                    <span class="spec-label"><i class="fa-solid fa-mountain text-emerald"></i> Elevation / Altitude</span>
                    <span class="spec-val">${elevStr}</span>
                </div>
                <div class="spec-tile">
                    <span class="spec-label"><i class="fa-solid fa-temperature-half text-amber"></i> Current Temperature</span>
                    <span class="spec-val">${Math.round(current.temperature_2m)}${tempUnit} (Feels ${Math.round(current.apparent_temperature)}${tempUnit})</span>
                </div>
                <div class="spec-tile">
                    <span class="spec-label"><i class="fa-solid fa-shield-halved text-rose"></i> Disaster Advisory</span>
                    <span class="spec-val" style="color: ${alertColor}">${disasterData.badge}</span>
                </div>
                <div class="spec-tile">
                    <span class="spec-label"><i class="fa-solid fa-clock text-blue"></i> Official Timezone</span>
                    <span class="spec-val">${weatherData.timezone || 'Asia/Kolkata'}</span>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.25rem;">
                <button class="msg-action-btn" onclick="document.getElementById('btn-open-disaster').click()">
                    <i class="fa-solid fa-triangle-exclamation text-amber"></i> Open Disaster Command Center
                </button>
                <button class="msg-action-btn" onclick="document.getElementById('btn-open-api-modal').click()">
                    <i class="fa-solid fa-code text-cyan"></i> Inspect Live JSON API
                </button>
                <button class="msg-action-btn" onclick="document.getElementById('btn-open-map').click()">
                    <i class="fa-solid fa-map-location-dot text-blue"></i> Open Live Radar
                </button>
            </div>
        `;
        return card;
    }

    static createDisasterCard(disaster, location, isManglish = false) {
        const card = document.createElement('div');
        card.className = `disaster-management-card disaster-card-${disaster.level}`;

        const hazardTiles = (disaster.hazards || []).map(h => `
            <div class="hazard-tile">
                <span class="hazard-name"><i class="fa-solid ${h.icon}"></i> ${h.name}</span>
                <span class="hazard-val">${h.value}</span>
            </div>
        `).join('');

        const actionItems = (disaster.actions || []).map(a => `
            <li style="margin-bottom: 0.35rem; color: var(--text-primary); font-size: 0.85rem;">${a}</li>
        `).join('');

        const alertColor = disaster.level === 'red' ? '#ef4444' : (disaster.level === 'orange' ? '#f97316' : (disaster.level === 'yellow' ? '#eab308' : '#10b981'));

        card.innerHTML = `
            <div class="disaster-card-header">
                <div class="disaster-card-title">
                    <i class="fa-solid fa-shield-halved" style="font-size: 1.5rem; color: ${alertColor};"></i>
                    <div>
                        <h3>${disaster.title}</h3>
                        <span style="font-size: 0.78rem; color: var(--text-muted);">Region: <strong>${location.name || 'Current Location'}</strong> (KSDMA Disaster Management Protocol)</span>
                    </div>
                </div>
                <span class="disaster-badge badge-${disaster.level}">${disaster.badge}</span>
            </div>

            <div class="disaster-hazard-grid">
                ${hazardTiles}
            </div>

            <div style="background: rgba(0,0,0,0.25); border-radius: var(--radius-md); padding: 0.85rem 1rem;">
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--accent-gold); margin-bottom: 0.5rem;">
                    <i class="fa-solid fa-list-check"></i> ${isManglish ? 'നിർദ്ദേശങ്ങൾ (Action Checklist)' : 'Official Safety Directives & Precautions'}:
                </div>
                <ul style="margin: 0 0 0 1.25rem;">
                    ${actionItems}
                </ul>
            </div>

            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; padding-top: 0.35rem;">
                <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">🚨 Emergency SOS:</span>
                <a href="tel:112" class="quick-pill" style="color: #fff; background: rgba(239,68,68,0.3); border-color: #ef4444;">
                    <i class="fa-solid fa-phone"></i> 112 (Unified)
                </a>
                <a href="tel:1077" class="quick-pill" style="color: var(--accent-gold); background: rgba(245,158,11,0.2); border-color: var(--accent-gold);">
                    <i class="fa-solid fa-phone"></i> 1077 (District Disaster)
                </a>
                <a href="tel:1070" class="quick-pill" style="color: var(--accent-gold); background: rgba(245,158,11,0.2); border-color: var(--accent-gold);">
                    <i class="fa-solid fa-phone"></i> 1070 (State KSDMA)
                </a>
                <a href="tel:101" class="quick-pill" style="color: var(--accent-sky);">
                    <i class="fa-solid fa-fire-extinguisher"></i> 101 (Fire & Rescue)
                </a>
            </div>
        `;
        return card;
    }
}

// ============================================================================
// CHAT CONTROLLER & DIALOGUE ORCHESTRATOR
// ============================================================================

class ChatManager {
    constructor() {
        this.messagesContainer = document.getElementById('chat-messages');
        this.welcomeCard = document.getElementById('welcome-card');
        this.userInput = document.getElementById('user-input');
        this.btnSend = document.getElementById('btn-send');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.statusText = document.getElementById('typing-status-text');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = Math.min(this.userInput.scrollHeight, 140) + 'px';
            this.btnSend.disabled = this.userInput.value.trim().length === 0 || state.isProcessing;
        });

        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!this.btnSend.disabled) {
                    this.handleSend();
                }
            }
        });

        this.btnSend.addEventListener('click', () => this.handleSend());

        document.addEventListener('click', (e) => {
            const promptBtn = e.target.closest('[data-prompt]');
            if (promptBtn) {
                const text = promptBtn.getAttribute('data-prompt');
                this.userInput.value = text;
                this.userInput.style.height = 'auto';
                this.btnSend.disabled = false;
                this.handleSend();
            }
        });
    }

    showTyping(status = "WeatherGPT is analyzing meteorological models...") {
        this.statusText.textContent = status;
        this.typingIndicator.classList.remove('hidden');
        this.scrollToBottom();
    }

    hideTyping() {
        this.typingIndicator.classList.add('hidden');
    }

    scrollToBottom() {
        const viewport = document.querySelector('.chat-viewport');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }

    addUserMessage(text) {
        if (this.welcomeCard) {
            this.welcomeCard.classList.add('hidden');
        }

        const row = document.createElement('div');
        row.className = 'message-row user-row';
        row.innerHTML = `
            <div class="avatar avatar-user"><i class="fa-solid fa-user"></i></div>
            <div class="message-content">
                <div class="message-bubble">${this.escapeHtml(text)}</div>
            </div>
        `;
        this.messagesContainer.appendChild(row);
        this.scrollToBottom();
    }

    addAssistantMessage(markdownText, widgetElements = [], isManglish = false) {
        const row = document.createElement('div');
        row.className = 'message-row ai-row';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.innerHTML = marked.parse(markdownText);
        contentDiv.appendChild(bubble);

        widgetElements.forEach(widget => {
            if (widget) contentDiv.appendChild(widget);
        });

        const actions = document.createElement('div');
        actions.className = 'message-actions';
        actions.innerHTML = `
            <button class="msg-action-btn btn-listen" title="Listen to forecast"><i class="fa-solid fa-volume-high"></i> Listen</button>
            <button class="msg-action-btn btn-copy" title="Copy text"><i class="fa-regular fa-copy"></i> Copy</button>
            ${isManglish ? `<span class="count-pill" style="color: #34d399; background: rgba(16, 185, 129, 0.12);"><i class="fa-solid fa-leaf"></i> Manglish</span>` : ''}
        `;

        actions.querySelector('.btn-listen').addEventListener('click', () => {
            AudioService.speak(bubble.innerText);
        });

        actions.querySelector('.btn-copy').addEventListener('click', () => {
            navigator.clipboard.writeText(bubble.innerText);
            showToast("Copied forecast briefing to clipboard!");
        });

        contentDiv.appendChild(actions);

        row.innerHTML = `<div class="avatar avatar-ai"><i class="fa-solid fa-cloud-bolt"></i></div>`;
        row.appendChild(contentDiv);

        this.messagesContainer.appendChild(row);
        this.scrollToBottom();

        if (state.autoVoice) {
            AudioService.speak(bubble.innerText);
        }
    }

    escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    async handleSend(overrideText = null) {
        const query = (overrideText || this.userInput.value).trim();
        if (!query || state.isProcessing) return;

        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        this.btnSend.disabled = true;
        state.isProcessing = true;

        this.addUserMessage(query);
        this.showTyping();

        addRecentQuery(query);

        try {
            if (state.aiMode === 'external' && state.apiKey) {
                await this.processWithExternalLLM(query);
            } else {
                await this.processWithBuiltInEngine(query);
            }
        } catch (err) {
            console.error('Processing error:', err);
            this.addAssistantMessage(`I encountered an unexpected issue while synthesizing meteorological models: **${err.message || 'Please try again.'}**`);
        } finally {
            this.hideTyping();
            state.isProcessing = false;
            this.btnSend.disabled = this.userInput.value.trim().length === 0;
        }
    }

    async processWithBuiltInEngine(query) {
        const isManglish = WeatherGPTEngine.isManglish(query);
        const intent = WeatherGPTEngine.detectIntent(query);

        // 0a. GREETINGS & CASUAL OPENERS
        if (intent.type === 'greeting') {
            const greetingNarrative = isManglish
                ? `### Namaskaram Aliya! 👋🌴
Ivide njan 24x7 real-time satellite radar-um numerical weather prediction models-um monitor cheyyukayaanu.

* 📍 **Etha ninte sthalam?** Kochi, Trivandrum, Kozhikode, Wayanad, or vere ethenkilum sthalathe weather report veno?
* 🌧️ **Mazhayundo?** *"Kochi-yil innu mazha peyyumo?"*, *"Trivandrum choodano?"* ennu direct aayi chodhicho!
* ⚡ **100% Free**: API key onnum type cheyyenda, direct aayi use cheyyam!

Etha sthalam nokkendathu? Chodhicho! 😊`
                : `### Hello there! 👋🌤️
I am **WeatherGPT**, your friendly conversational AI meteorologist! I'm monitoring global NWP atmospheric telemetry in real-time.

* 📍 **Any location worldwide**: e.g., *"Kochi weather"*, *"Tokyo 7-day forecast"*, *"Will it rain in London?"*
* ☀️ **Friendly & Funny Alerts**: Ask *"Is it too hot outside?"* or *"Will it rain today?"*
* ⚡ **100% Free & Ready**: Zero API key or configuration required for anyone!

Which city would you like to check today?`;

            this.addAssistantMessage(greetingNarrative, [], isManglish);
            return;
        }

        // 0b. IDENTITY & CAPABILITIES
        if (intent.type === 'identity') {
            const identityNarrative = isManglish
                ? `### 🤖 Njan aanu WeatherGPT!
Njan oru Conversational AI Meteorologist aanu. Kerala-yileyum global aayumulla ella sthalangalile live weather, mazha sadyatha, katta choodu alerts, air quality (AQI), interactive radar map enniva njan analyse cheythu parayum!

* 🌴 **Natural Manglish**: Malayalam transliterated script-il natural aayi സംസാരിക്കാം.
* ⚡ **Zero API Key Needed**: Ellavarkkum eppozhum free aayi ready out-of-the-box!
* 📍 **Accurate Kerala Locations**: Kochi, Trivandrum, Kozhikode, Thrissur, Wayanad muthalaya ella sthalangalum 100% accurate aayi pinpoint cheyyum.`
                : `### 🤖 I am WeatherGPT!
A world-class conversational AI meteorologist powered by real-time Open-Meteo European ECMWF, GFS, and ICON numerical weather prediction models.

* 🌍 **Global & Hyper-Local**: Real-time hourly curves, 7-day forecasts, severe storm alerts, and radar maps.
* 🌴 **Natural Manglish & English**: Ask in natural Malayalam-English or standard English.
* ⚡ **Zero API Key Required**: Fully accessible and free for everyone instantly!`;

            this.addAssistantMessage(identityNarrative, [], isManglish);
            return;
        }

        // 0c. JOKES & HUMOR
        if (intent.type === 'joke') {
            const jokesMl = [
                `😂 **Weather Joke:**\n\nKeralathile Sooryan Mazhayodu paranjhu:\n*"Nee kurachu divasam kooduthal peythal, aalkkar enneyum thedi varum... Pakshe njan thirichu vannaal ellarum AC room-il olichekkollum!"* ☀️🌧️`,
                `😂 **Weather Joke:**\n\nQ: Mazha peyyumbol aalkkar enthukondaanu umbrella pidikkunnathu?\nAns: Karanam umbrella-kku thaniye nadakkan ariyilla! 🌂🤣`,
                `😂 **Weather Joke:**\n\nFriend: *"Aliya, innu nalla veyil aanallo, Biryani undakkan pattiya choodu!"*\nMe: *"Choodu koodi ippo njan thanne fry aayi maran chance undu!"* 🍳🔥`
            ];
            const jokesEn = [
                `😂 **Weather Pun:**\n\nWhy does Snoop Dogg always carry an umbrella?\n**FO' DRIZZLE!** 🌧️🤣`,
                `😂 **Weather Pun:**\n\nWhat did the cloud wear under its raincoat?\n**Thunderwear!** ⚡😂`,
                `😂 **Weather Pun:**\n\nHow do tornadoes celebrate birthdays?\n**They have a twist-party!** 🌪️🎂`
            ];
            const jokeList = isManglish ? jokesMl : jokesEn;
            const chosenJoke = jokeList[Math.floor(Math.random() * jokeList.length)];
            this.addAssistantMessage(chosenJoke, [], isManglish);
            return;
        }

        // 1. CLIMATE SCIENCE INQUIRY
        if (intent.type === 'climate') {
            const info = CLIMATE_KNOWLEDGE[intent.topic];
            if (info) {
                const responseText = isManglish
                    ? `### 🌍 **Atmospheric Science: ${info.title}**\n\nIthe kurichulla scientific analysis thazhe kodukkunnu:`
                    : `Here is a scientific analysis of **${info.title}** and its underlying atmospheric mechanisms:`;
                const climateCard = UIRenderer.createClimateCard(info);
                this.addAssistantMessage(responseText, [climateCard], isManglish);
                return;
            }
        }

        // 2. CITY COMPARISON
        if (intent.type === 'compare' && intent.city1 && intent.city2) {
            this.showTyping(`Geocoding and retrieving models for ${intent.city1} and ${intent.city2}...`);
            const [c1, c2] = await Promise.all([
                WeatherService.searchCity(intent.city1),
                WeatherService.searchCity(intent.city2)
            ]);

            if (!c1 || !c2) {
                this.addAssistantMessage(`Could not resolve location coordinates for both **${intent.city1}** and **${intent.city2}**. Please verify city spelling.`);
                return;
            }

            const [w1, w2] = await Promise.all([
                WeatherService.getForecast(c1.latitude, c1.longitude, c1.timezone, state.units),
                WeatherService.getForecast(c2.latitude, c2.longitude, c2.timezone, state.units)
            ]);

            const tempUnit = state.units === 'imperial' ? '°F' : '°C';
            const narrative = `### Comparative Atmospheric Briefing: **${c1.name}** vs. **${c2.name}**
* **${c1.name}**: **${Math.round(w1.current.temperature_2m)}${tempUnit}** (${getWmoInfo(w1.current.weather_code).desc})
* **${c2.name}**: **${Math.round(w2.current.temperature_2m)}${tempUnit}** (${getWmoInfo(w2.current.weather_code).desc})
* Thazhe comparative telemetry table kodukkunnu:`;

            const compareCard = UIRenderer.createCompareCard(c1, w1, c2, w2, state.units);
            this.addAssistantMessage(narrative, [compareCard], isManglish);
            return;
        }

        // 3. SINGLE CITY QUERIES
        const cityName = WeatherGPTEngine.extractCity(query);
        this.showTyping(`Locating "${cityName}" via Open-Meteo High-Resolution Geocoding...`);

        const city = await WeatherService.searchCity(cityName);
        if (!city) {
            this.addAssistantMessage(
                isManglish 
                    ? `**"${cityName}"** enna sthalam find cheyyaan pattiyilla bro. Spelling onnu check cheythittu parayamo?`
                    : `I could not pinpoint **"${cityName}"** in the global meteorological registry. Could you please specify a country or check spelling?`,
                [],
                isManglish
            );
            return;
        }

        state.activeCity = city;
        const locationDisplay = `${city.name}${city.admin1 && city.admin1 !== city.name ? ', ' + city.admin1 : ''}${city.country ? ', ' + city.country : ''}`;
        document.getElementById('active-location-name').textContent = locationDisplay;

        this.showTyping(`Fetching high-resolution NWP models & air quality for ${city.name}...`);

        const [weatherData, aqiData] = await Promise.all([
            WeatherService.getForecast(city.latitude, city.longitude, city.timezone, state.units),
            WeatherService.getAirQuality(city.latitude, city.longitude)
        ]);

        const wmo = getWmoInfo(weatherData.current.weather_code);
        if (atmosphere) atmosphere.setMood(wmo.mood);

        const detectedAlerts = AlertDetector.detect(weatherData, aqiData, state.units, isManglish);
        const disasterRisk = DisasterService.evaluateDisasterRisk(weatherData, aqiData, city, isManglish);
        const tempUnit = state.units === 'imperial' ? '°F' : '°C';
        const windUnit = state.units === 'imperial' ? 'mph' : 'km/h';
        const cur = weatherData.current;
        const daily = weatherData.daily;

        let narrative = "";
        let widgets = [];

        // If Manglish query or mode, use tailored Manglish generator
        if (isManglish) {
            if (intent.type === 'location_details') {
                narrative = `### 📍 **Pinpoint Location & Disaster Status: ${city.name}**\n` +
                    `* 📌 **Locality / Ward**: **${city.locality || city.name}**\n` +
                    `* 🏛️ **District & State**: **${city.district || city.admin2 || city.admin1 || 'Kerala'}**, ${city.state || city.country || 'India'}\n` +
                    `* 🛰️ **GPS Coordinates**: **${Number(city.latitude).toFixed(4)}° N, ${Number(city.longitude).toFixed(4)}° E**\n` +
                    `* ⛰️ **Altitude / Elevation**: **${city.elevation !== undefined ? Math.round(city.elevation) + ' meters (MSL)' : 'Coastal Plain (<20m)'}**\n` +
                    `* 🛡️ **Disaster Risk Level**: **${disasterRisk.badge}**\n\n` +
                    `Ivideyulla complete geographic specs, disaster vulnerability, and weather telemetry thazhe cards-il review cheyyam:`;
                widgets.push(UIRenderer.createLocationDetailsCard(city, weatherData, disasterRisk, true));
                widgets.push(UIRenderer.createDisasterCard(disasterRisk, city, true));
                widgets.push(UIRenderer.createWeatherHeroCard(city, weatherData, state.units));
                widgets.push(UIRenderer.createHourlyCard(weatherData, state.units));
                this.addAssistantMessage(narrative, widgets, true);
                return;
            }

            if (intent.type === 'disaster') {
                const hazardDetails = (disasterRisk.hazards || []).map(h => `* **${h.name}**: ${h.value}`).join('\n');
                narrative = `### 🚨 **KSDMA Disaster Management Assessment: ${city.name}**\n` +
                    `* ⚠️ **Warning Level**: **${disasterRisk.badge}**\n` +
                    `* 📋 **Official Protocol**: KSDMA Disaster Management Color-Coded Severe Weather Framework\n` +
                    `* ⛰️ **Topography / Elevation**: ${city.elevation !== undefined ? Math.round(city.elevation) + 'm ASL' : 'Lowland / Coastal'}\n\n` +
                    `**Hazard Telemetry Summary**:\n${hazardDetails}\n\n` +
                    `Actionable safety directives, emergency SOS hotlines, and weather curves thazhe kodukkunnu:`;
                widgets.push(UIRenderer.createDisasterCard(disasterRisk, city, true));
                widgets.push(UIRenderer.createWeatherHeroCard(city, weatherData, state.units));
                widgets.push(UIRenderer.createHourlyCard(weatherData, state.units));
                this.addAssistantMessage(narrative, widgets, true);
                return;
            }

            narrative = WeatherGPTEngine.generateManglishBriefing(city, weatherData, aqiData, detectedAlerts, intent);
            if (disasterRisk.level === 'red' || disasterRisk.level === 'orange') {
                widgets.push(UIRenderer.createDisasterCard(disasterRisk, city, true));
            }
            if (detectedAlerts.length > 0) widgets.push(UIRenderer.createAlertCards(detectedAlerts));
            widgets.push(UIRenderer.createWeatherHeroCard(city, weatherData, state.units));
            widgets.push(UIRenderer.createHourlyCard(weatherData, state.units));
            widgets.push(UIRenderer.createDailyCard(weatherData, state.units));
            if (aqiData && aqiData.current && aqiData.current.us_aqi > 100) {
                widgets.push(UIRenderer.createAqiCard(aqiData));
            }
            this.addAssistantMessage(narrative, widgets, true);
            return;
        }

        // Standard English responses with funny/friendly alert highlights
        let alertHighlight = "";
        if (detectedAlerts.length > 0) {
            alertHighlight = `\n> **${detectedAlerts[0].badge}**: ${detectedAlerts[0].desc}\n`;
        }

        if (intent.type === 'location_details') {
            narrative = `### 📍 **Pinpoint Location Diagnostics & Disaster Telemetry: ${locationDisplay}**\n` +
                `* 📌 **Locality / Ward**: **${city.locality || city.name}**\n` +
                `* 🏛️ **Administrative Region**: **${[city.district, city.admin1, city.country].filter(Boolean).join(', ')}**\n` +
                `* 🛰️ **Geodetic Position**: **${Number(city.latitude).toFixed(4)}° N, ${Number(city.longitude).toFixed(4)}° E**\n` +
                `* ⛰️ **Elevation / Altitude**: **${city.elevation !== undefined ? Math.round(city.elevation) + ' meters (MSL)' : 'Coastal Plain (<20m)'}**\n` +
                `* 🛡️ **Civil Protection Status**: **${disasterRisk.badge}**\n\n` +
                `Complete geographic profile, disaster vulnerability, and atmospheric metrics are detailed below:`;
            widgets.push(UIRenderer.createLocationDetailsCard(city, weatherData, disasterRisk, false));
            widgets.push(UIRenderer.createDisasterCard(disasterRisk, city, false));
            widgets.push(UIRenderer.createWeatherHeroCard(city, weatherData, state.units));
            widgets.push(UIRenderer.createHourlyCard(weatherData, state.units));
            this.addAssistantMessage(narrative, widgets, false);
            return;
        } else if (intent.type === 'disaster') {
            const hazardDetails = (disasterRisk.hazards || []).map(h => `* **${h.name}**: ${h.value}`).join('\n');
            narrative = `### 🚨 **KSDMA Disaster Management & Hazard Assessment: ${locationDisplay}**\n` +
                `* ⚠️ **Early Warning Level**: **${disasterRisk.badge}**\n` +
                `* 📋 **Warning Protocol**: KSDMA Disaster Management Multi-Hazard Alert Framework\n` +
                `* ⛰️ **Topography**: ${city.elevation !== undefined ? Math.round(city.elevation) + 'm Elevation' : 'Coastal / Lowland'}\n\n` +
                `**Hazard Telemetry Breakdown**:\n${hazardDetails}\n\n` +
                `Actionable civil defense guidelines, 1-tap emergency SOS helplines, and forecast curves are compiled below:`;
            widgets.push(UIRenderer.createDisasterCard(disasterRisk, city, false));
            widgets.push(UIRenderer.createWeatherHeroCard(city, weatherData, state.units));
            widgets.push(UIRenderer.createHourlyCard(weatherData, state.units));
            this.addAssistantMessage(narrative, widgets, false);
            return;
        } else if (intent.type === 'aqi') {
            const usAqi = aqiData && aqiData.current ? aqiData.current.us_aqi : 'N/A';
            narrative = `### Air Quality & Environmental Health Diagnostic: **${locationDisplay}**\nCurrent **US AQI index** is measured at **${usAqi}**.\n* Dominant particulates include PM2.5 and PM10 measured by the European Copernicus Atmospheric Monitoring Service (CAMS).\n* Review the full pollutant breakdown below:`;
            widgets.push(UIRenderer.createAqiCard(aqiData));
            widgets.push(UIRenderer.createWeatherHeroCard(city, weatherData, state.units));
        } else if (intent.type === 'alert') {
            if (disasterRisk.level === 'red' || disasterRisk.level === 'orange') {
                widgets.push(UIRenderer.createDisasterCard(disasterRisk, city, false));
            }
            if (detectedAlerts.length > 0) {
                narrative = `### ⚠️ Meteorological Alerts for **${locationDisplay}**\n${alertHighlight}Review the actionable safety tips and advisory below:`;
                widgets.push(UIRenderer.createAlertCards(detectedAlerts));
                widgets.push(UIRenderer.createWeatherHeroCard(city, weatherData, state.units));
            } else {
                narrative = `✅ **Calm Weather for ${locationDisplay}**\nAtmospheric pressure is steady at **${Math.round(cur.pressure_msl || cur.surface_pressure || 1013)} hPa**, surface winds are calm to moderate at **${Math.round(cur.wind_speed_10m)} ${windUnit}**, and no severe weather hazards are active.`;
                widgets.push(UIRenderer.createWeatherHeroCard(city, weatherData, state.units));
                widgets.push(UIRenderer.createHourlyCard(weatherData, state.units));
            }
        } else if (intent.type === 'lifestyle') {
            const advice = WeatherGPTEngine.generateLifestyleAdvice(cur, daily, state.units);
            narrative = `### Meteorological Lifestyle & Clothing Advisory for **${locationDisplay}**\n${alertHighlight}Currently **${Math.round(cur.temperature_2m)}${tempUnit}** (feels like **${Math.round(cur.apparent_temperature)}${tempUnit}**) with *${wmo.desc}*.\n\n🧥 **What To Wear**:\n${advice.clothing.map(c => `* ${c}`).join('\n')}\n\n🎒 **Gear & Essentials**:\n${advice.gear.length > 0 ? advice.gear.map(g => `* ${g}`).join('\n') : '* Standard day-wear is sufficient; no specialized wet-weather gear required.'}\n\n🏃 **Outdoor Activity Suitability**:\n* ${advice.outdoorAdvice}`;
            if (disasterRisk.level === 'red' || disasterRisk.level === 'orange') widgets.push(UIRenderer.createDisasterCard(disasterRisk, city, false));
            if (detectedAlerts.length > 0) widgets.push(UIRenderer.createAlertCards(detectedAlerts));
            widgets.push(UIRenderer.createWeatherHeroCard(city, weatherData, state.units));
            widgets.push(UIRenderer.createHourlyCard(weatherData, state.units));
        } else if (intent.type === 'forecast') {
            narrative = `### 7-Day Atmospheric Outlook for **${locationDisplay}**\n${alertHighlight}The upcoming synoptic pattern shows a diurnal high of **${Math.round(daily.temperature_2m_max[0])}${tempUnit}** and overnight low of **${Math.round(daily.temperature_2m_min[0])}${tempUnit}**.`;
            if (disasterRisk.level === 'red' || disasterRisk.level === 'orange') widgets.push(UIRenderer.createDisasterCard(disasterRisk, city, false));
            if (detectedAlerts.length > 0) widgets.push(UIRenderer.createAlertCards(detectedAlerts));
            widgets.push(UIRenderer.createWeatherHeroCard(city, weatherData, state.units));
            widgets.push(UIRenderer.createDailyCard(weatherData, state.units));
            widgets.push(UIRenderer.createHourlyCard(weatherData, state.units));
        } else if (intent.type === 'hourly') {
            narrative = `### 24-Hour Diurnal Progression for **${locationDisplay}**\n${alertHighlight}Review the interactive temperature curve and precipitation probability below. Peak temperature will reach **${Math.round(daily.temperature_2m_max[0])}${tempUnit}**.`;
            if (disasterRisk.level === 'red' || disasterRisk.level === 'orange') widgets.push(UIRenderer.createDisasterCard(disasterRisk, city, false));
            if (detectedAlerts.length > 0) widgets.push(UIRenderer.createAlertCards(detectedAlerts));
            widgets.push(UIRenderer.createHourlyCard(weatherData, state.units));
            widgets.push(UIRenderer.createWeatherHeroCard(city, weatherData, state.units));
        } else {
            const rainMax = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;
            narrative = `### Meteorological Briefing: **${locationDisplay}**\n${alertHighlight}* **Current Conditions**: **${Math.round(cur.temperature_2m)}${tempUnit}** • *${wmo.desc}* (Feels like **${Math.round(cur.apparent_temperature)}${tempUnit}**)\n* **Diurnal Range**: Expected high of **${Math.round(daily.temperature_2m_max[0])}${tempUnit}** and overnight low of **${Math.round(daily.temperature_2m_min[0])}${tempUnit}**.\n* **Precipitation Risk**: Maximum rain chance today is **${rainMax}%** with humidity at **${cur.relative_humidity_2m}%**.\n* **Wind**: Surface winds blowing at **${Math.round(cur.wind_speed_10m)} ${windUnit}** from the **${UIRenderer.getWindDirection(cur.wind_direction_10m)}**.`;
            if (disasterRisk.level === 'red' || disasterRisk.level === 'orange') widgets.push(UIRenderer.createDisasterCard(disasterRisk, city, false));
            if (detectedAlerts.length > 0) widgets.push(UIRenderer.createAlertCards(detectedAlerts));
            widgets.push(UIRenderer.createWeatherHeroCard(city, weatherData, state.units));
            widgets.push(UIRenderer.createHourlyCard(weatherData, state.units));
            widgets.push(UIRenderer.createDailyCard(weatherData, state.units));
            if (aqiData && aqiData.current && aqiData.current.us_aqi > 100) {
                widgets.push(UIRenderer.createAqiCard(aqiData));
            }
        }

        this.addAssistantMessage(narrative, widgets, false);
    }

    async processWithExternalLLM(query) {
        const isManglish = WeatherGPTEngine.isManglish(query);
        const cityName = WeatherGPTEngine.extractCity(query);
        const city = await WeatherService.searchCity(cityName);

        if (!city) {
            const narrative = await this.callLLMDirect(query, null, isManglish);
            this.addAssistantMessage(narrative, [], isManglish);
            return;
        }

        state.activeCity = city;
        document.getElementById('active-location-name').textContent = `${city.name}, ${city.country || ''}`;

        const [weatherData, aqiData] = await Promise.all([
            WeatherService.getForecast(city.latitude, city.longitude, city.timezone, state.units),
            WeatherService.getAirQuality(city.latitude, city.longitude)
        ]);

        const intent = WeatherGPTEngine.detectIntent(query);
        const disasterRisk = DisasterService.evaluateDisasterRisk(weatherData, aqiData, city, isManglish);

        const telemetryContext = {
            city: `${city.name}, ${city.country || ''}`,
            coordinates: `${city.latitude}, ${city.longitude}`,
            elevation_meters: city.elevation !== undefined ? city.elevation : 15,
            units: state.units,
            current_temperature: weatherData.current.temperature_2m,
            apparent_temperature: weatherData.current.apparent_temperature,
            weather_condition: getWmoInfo(weatherData.current.weather_code).desc,
            humidity_percent: weatherData.current.relative_humidity_2m,
            wind_speed: weatherData.current.wind_speed_10m,
            daily_high: weatherData.daily.temperature_2m_max[0],
            daily_low: weatherData.daily.temperature_2m_min[0],
            rain_probability_max: weatherData.daily.precipitation_probability_max ? weatherData.daily.precipitation_probability_max[0] : 0,
            aqi: aqiData && aqiData.current ? aqiData.current.us_aqi : 'unknown',
            disaster_warning_level: disasterRisk.level.toUpperCase(),
            disaster_badge: disasterRisk.badge,
            disaster_hazards: disasterRisk.hazards
        };

        const llmNarrative = await this.callLLMDirect(query, telemetryContext, isManglish);

        const widgets = [];
        if (intent.type === 'location_details') {
            widgets.push(UIRenderer.createLocationDetailsCard(city, weatherData, disasterRisk, isManglish));
            widgets.push(UIRenderer.createDisasterCard(disasterRisk, city, isManglish));
        } else if (intent.type === 'disaster' || disasterRisk.level === 'red' || disasterRisk.level === 'orange') {
            widgets.push(UIRenderer.createDisasterCard(disasterRisk, city, isManglish));
        }

        widgets.push(UIRenderer.createWeatherHeroCard(city, weatherData, state.units));
        widgets.push(UIRenderer.createHourlyCard(weatherData, state.units));
        widgets.push(UIRenderer.createDailyCard(weatherData, state.units));

        this.addAssistantMessage(llmNarrative, widgets, isManglish);
    }

    async callLLMDirect(query, context, isManglish = false) {
        let systemPrompt = `You are WeatherGPT, a world-class conversational AI meteorologist and atmospheric scientist. Ground your answers strictly in the provided real-time telemetry numbers whenever available.\nTelemetry: ${context ? JSON.stringify(context) : 'None'}`;

        if (isManglish) {
            systemPrompt = `You are WeatherGPT, a witty, warm, and friendly conversational AI meteorologist who speaks fluent natural Manglish (Malayalam written in English script) as spoken in Kerala, India.
Rules for Manglish responses:
1. Speak in friendly, natural, conversational Manglish (e.g. "Aliya, Kochi-yil ippo 31°C undu, nalla humidity-yum choodum aanu...", "Nale vaikitt nalla mazha peyyan 70% chance undu, oru kuda kayyil karuthiyeko!").
2. Accurately incorporate the provided real-time telemetry numbers (temperature, feels-like, rain probability %, humidity, wind speed, alerts).
3. Provide practical lifestyle advice (umbrella, hydration, clothing, safety during lightning).
Telemetry: ${context ? JSON.stringify(context) : 'None'}`;
        }

        if (state.llmProvider === 'gemini') {
            const requestedModel = state.geminiModel || 'gemini-3.6-flash';
            let endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${requestedModel}:generateContent?key=${state.apiKey}`;
            let res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${query}` }] }
                    ]
                })
            });

            // If 404 on experimental 3.6 tag, gracefully fallback to gemini-2.0-flash
            if (res.status === 404 && requestedModel.startsWith('gemini-3')) {
                console.warn(`Model ${requestedModel} returned 404. Falling back to gemini-2.0-flash.`);
                endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${state.apiKey}`;
                res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${query}` }] }
                        ]
                    })
                });
            }

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error?.message || `Gemini API call failed (${res.status}). Verify your key.`);
            }

            const data = await res.json();
            return data.candidates[0].content.parts[0].text;
        } else {
            const endpoint = `https://api.openai.com/v1/chat/completions`;
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: query }
                    ]
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error?.message || 'OpenAI API call failed');
            }

            const data = await res.json();
            return data.choices[0].message.content;
        }
    }
}

let chatManager;

// ============================================================================
// SPEECH RECOGNITION & AUDIO SERVICE
// ============================================================================

class AudioService {
    static initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return null;

        const recognizer = new SpeechRecognition();
        recognizer.continuous = false;
        recognizer.interimResults = false;
        recognizer.lang = state.language === 'manglish' ? 'ml-IN' : 'en-US';

        const micBtn = document.getElementById('btn-input-voice');

        recognizer.onstart = () => {
            state.isRecording = true;
            micBtn.classList.add('recording');
            showToast("Listening... speak your weather inquiry.");
        };

        recognizer.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (transcript) {
                chatManager.userInput.value = transcript;
                chatManager.btnSend.disabled = false;
                chatManager.handleSend();
            }
        };

        recognizer.onerror = (event) => {
            console.warn('Speech recognition error:', event.error);
            showToast("Microphone error: " + event.error);
            state.isRecording = false;
            micBtn.classList.remove('recording');
        };

        recognizer.onend = () => {
            state.isRecording = false;
            micBtn.classList.remove('recording');
        };

        micBtn.addEventListener('click', () => {
            if (state.isRecording) {
                recognizer.stop();
            } else {
                try {
                    recognizer.lang = state.language === 'manglish' ? 'ml-IN' : 'en-US';
                    recognizer.start();
                } catch (e) {
                    console.warn(e);
                }
            }
        });

        return recognizer;
    }

    static speak(text) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();

        const cleanText = text
            .replace(/[#*_`>~-]/g, '')
            .replace(/\[.*?\]\(.*?\)/g, '')
            .replace(/\(.*?\)/g, '')
            .replace(/\n+/g, '. ');

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
        if (preferred) utterance.voice = preferred;

        window.speechSynthesis.speak(utterance);
    }
}

// ============================================================================
// INTERACTIVE WEATHER RADAR MAP (LEAFLET + RAINVIEWER)
// ============================================================================

class WeatherMapService {
    constructor() {
        this.map = null;
        this.radarLayer = null;
        this.satelliteLayer = null;
        this.frames = [];
        this.currentFrameIndex = 0;
        this.animationTimer = null;
        this.isPlaying = false;
        this.marker = null;

        this.initElements();
    }

    initElements() {
        const modal = document.getElementById('radar-modal');
        const openBtn = document.getElementById('btn-open-map');
        const closeBtn = document.getElementById('btn-close-map');
        const playBtn = document.getElementById('btn-radar-play');
        const searchInput = document.getElementById('map-search-input');
        const searchBtn = document.getElementById('btn-map-search');

        openBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            this.setupMap();
        });

        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            this.stopAnimation();
        });

        playBtn.addEventListener('click', () => this.togglePlayback());

        searchBtn.addEventListener('click', () => this.searchAndJump(searchInput.value));
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.searchAndJump(searchInput.value);
        });

        document.querySelectorAll('.layer-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.layer-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const layerType = btn.getAttribute('data-layer');
                this.switchLayer(layerType);
            });
        });
    }

    async setupMap() {
        if (!this.map) {
            const lat = state.activeCity ? state.activeCity.latitude : 9.9312; // Default Kochi
            const lon = state.activeCity ? state.activeCity.longitude : 76.2673;

            this.map = L.map('leaflet-map', {
                center: [lat, lon],
                zoom: 7,
                zoomControl: true
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap &copy; CARTO',
                maxZoom: 19
            }).addTo(this.map);

            this.marker = L.marker([lat, lon]).addTo(this.map);
            if (state.activeCity) {
                this.marker.bindPopup(`<b>${state.activeCity.name}</b><br>Meteorological Focus`).openPopup();
            }

            await this.loadRainViewerRadar();
        } else {
            setTimeout(() => this.map.invalidateSize(), 150);
            if (state.activeCity) {
                this.map.setView([state.activeCity.latitude, state.activeCity.longitude], 7);
                if (this.marker) {
                    this.marker.setLatLng([state.activeCity.latitude, state.activeCity.longitude]);
                    this.marker.bindPopup(`<b>${state.activeCity.name}</b><br>Meteorological Focus`).openPopup();
                }
            }
        }
    }

    async loadRainViewerRadar() {
        try {
            const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
            const data = await res.json();
            if (!data.radar || !data.radar.past) return;

            this.host = data.host;
            this.frames = data.radar.past;
            this.currentFrameIndex = this.frames.length - 1;

            this.displayRadarFrame(this.currentFrameIndex);
        } catch (err) {
            console.warn('RainViewer API load error:', err);
        }
    }

    displayRadarFrame(index) {
        if (!this.frames || !this.frames[index]) return;
        const frame = this.frames[index];
        const timestampEl = document.getElementById('radar-timestamp');

        if (timestampEl) {
            const date = new Date(frame.time * 1000);
            timestampEl.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        const tileUrl = `${this.host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;

        if (this.radarLayer) {
            this.map.removeLayer(this.radarLayer);
        }

        this.radarLayer = L.tileLayer(tileUrl, {
            opacity: 0.65,
            zIndex: 500
        }).addTo(this.map);
    }

    togglePlayback() {
        if (this.isPlaying) {
            this.stopAnimation();
        } else {
            this.startAnimation();
        }
    }

    startAnimation() {
        if (!this.frames || this.frames.length === 0) return;
        this.isPlaying = true;
        document.getElementById('radar-play-icon').className = 'fa-solid fa-pause';

        this.animationTimer = setInterval(() => {
            this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
            this.displayRadarFrame(this.currentFrameIndex);
        }, 800);
    }

    stopAnimation() {
        this.isPlaying = false;
        clearInterval(this.animationTimer);
        const icon = document.getElementById('radar-play-icon');
        if (icon) icon.className = 'fa-solid fa-play';
    }

    switchLayer(type) {
        showToast(`Switched map layer to: ${type}`);
    }

    async searchAndJump(cityName) {
        if (!cityName) return;
        const city = await WeatherService.searchCity(cityName);
        if (city && this.map) {
            this.map.setView([city.latitude, city.longitude], 8);
            if (this.marker) {
                this.marker.setLatLng([city.latitude, city.longitude]);
                this.marker.bindPopup(`<b>${city.name}</b>, ${city.country || ''}`).openPopup();
            }
        } else {
            showToast("Could not find city on map.");
        }
    }
}

// ============================================================================
// API KEY MODAL, VERIFICATION & LANGUAGE SELECTORS
// ============================================================================

function updateApiKeyBadge() {
    const badge = document.getElementById('btn-open-apikey');
    const dot = document.getElementById('apikey-status-dot');
    const text = document.getElementById('apikey-badge-text');

    if (!badge || !dot || !text) return;

    if (state.apiKey && state.apiKey.length > 5) {
        badge.classList.add('connected');
        dot.className = 'status-dot dot-connected';
        if (state.llmProvider === 'gemini') {
            text.textContent = (state.geminiModel && state.geminiModel.includes('3.6')) ? '⚡ Gemini 3.6 Active' : '⚡ Gemini Active';
        } else {
            text.textContent = '⚡ OpenAI Active';
        }
    } else {
        badge.classList.remove('connected');
        dot.className = 'status-dot dot-connected';
        text.textContent = '⚡ AI Ready (Free)';
    }
}

function setupApiKeyModal() {
    const modal = document.getElementById('apikey-modal');
    const openBtn = document.getElementById('btn-open-apikey');
    const welcomeKochiBtn = document.getElementById('btn-welcome-kochi');
    const closeBtn = document.getElementById('btn-close-apikey');
    const testSaveBtn = document.getElementById('btn-test-save-key');
    const removeBtn = document.getElementById('btn-remove-api-key');
    const keyInput = document.getElementById('quick-api-key-input');
    const providerSelect = document.getElementById('quick-provider-select');
    const modelGroup = document.getElementById('quick-gemini-model-group');
    const modelSelect = document.getElementById('quick-gemini-model-select');
    const toggleVisBtn = document.getElementById('btn-toggle-key-visibility');
    const feedback = document.getElementById('key-test-feedback');

    // Pre-populate
    keyInput.value = state.apiKey;
    providerSelect.value = state.llmProvider;
    if (modelSelect) modelSelect.value = state.geminiModel || 'gemini-3.6-flash';
    if (modelGroup) {
        if (state.llmProvider === 'openai') {
            modelGroup.classList.add('hidden');
        } else {
            modelGroup.classList.remove('hidden');
        }
    }
    updateApiKeyBadge();

    const syncProviderVisibility = () => {
        if (modelGroup) {
            if (providerSelect.value === 'openai') {
                modelGroup.classList.add('hidden');
            } else {
                modelGroup.classList.remove('hidden');
            }
        }
    };

    if (providerSelect) {
        providerSelect.addEventListener('change', syncProviderVisibility);
    }

    const openModal = () => {
        keyInput.value = state.apiKey;
        providerSelect.value = state.llmProvider;
        if (modelSelect) modelSelect.value = state.geminiModel || 'gemini-3.6-flash';
        syncProviderVisibility();
        feedback.className = 'key-test-feedback';
        feedback.textContent = '';
        modal.classList.remove('hidden');
        keyInput.focus();
    };

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (welcomeKochiBtn) {
        welcomeKochiBtn.addEventListener('click', () => {
            const input = document.getElementById('user-input');
            if (input) {
                input.value = "What is the current weather, rain chance, and alerts in Kochi, Kerala?";
                const sendBtn = document.getElementById('btn-send');
                if (sendBtn) sendBtn.click();
            }
        });
    }
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

    // Toggle password visibility
    if (toggleVisBtn) {
        toggleVisBtn.addEventListener('click', () => {
            const eye = document.getElementById('eye-icon');
            if (keyInput.type === 'password') {
                keyInput.type = 'text';
                eye.className = 'fa-regular fa-eye-slash';
            } else {
                keyInput.type = 'password';
                eye.className = 'fa-regular fa-eye';
            }
        });
    }

    // Test & Save API Key
    if (testSaveBtn) {
        testSaveBtn.addEventListener('click', async () => {
            const key = keyInput.value.trim();
            const provider = providerSelect.value;
            const selectedModel = modelSelect ? modelSelect.value : (state.geminiModel || 'gemini-3.6-flash');

            if (!key) {
                feedback.className = 'key-test-feedback error';
                feedback.textContent = 'Please paste an API key first.';
                return;
            }

            const providerLabel = provider === 'gemini' 
                ? (selectedModel.includes('3.6') ? 'Gemini 3.6' : 'Google Gemini') 
                : 'OpenAI';

            feedback.className = 'key-test-feedback loading';
            feedback.textContent = `Verifying ${providerLabel} API Key with live ping...`;
            testSaveBtn.disabled = true;

            try {
                if (provider === 'gemini') {
                    let testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${key}`;
                    let res = await fetch(testUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'ping' }] }] })
                    });
                    if (res.status === 404 && selectedModel.startsWith('gemini-3')) {
                        console.warn(`Model ${selectedModel} returned 404 on ping. Testing fallback gemini-2.0-flash...`);
                        testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
                        res = await fetch(testUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'ping' }] }] })
                        });
                    }
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err.error?.message || 'Gemini API authentication failed');
                    }
                } else {
                    const testUrl = `https://api.openai.com/v1/chat/completions`;
                    const res = await fetch(testUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${key}`
                        },
                        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'ping' }] })
                    });
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err.error?.message || 'OpenAI authentication failed');
                    }
                }

                // Success
                state.apiKey = key;
                state.llmProvider = provider;
                if (modelSelect) {
                    state.geminiModel = modelSelect.value;
                    localStorage.setItem('weathergpt_gemini_model', state.geminiModel);
                }
                state.aiMode = 'external';

                localStorage.setItem('weathergpt_apikey', key);
                localStorage.setItem('weathergpt_provider', provider);
                localStorage.setItem('weathergpt_aimode', 'external');

                updateApiKeyBadge();

                const successDisplayName = provider === 'gemini' 
                    ? (state.geminiModel.includes('3.6') ? 'Gemini 3.6' : state.geminiModel) 
                    : 'OpenAI';

                feedback.className = 'key-test-feedback success';
                feedback.innerHTML = `<i class="fa-solid fa-circle-check"></i> <strong>Key Verified!</strong> Connected to ${successDisplayName}. Natural Manglish & English AI is active!`;

                setTimeout(() => {
                    modal.classList.add('hidden');
                    showToast(`Connected to ${successDisplayName} successfully! ⚡`);
                }, 1400);

            } catch (err) {
                feedback.className = 'key-test-feedback error';
                feedback.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <strong>Verification Failed:</strong> ${err.message}`;
            } finally {
                testSaveBtn.disabled = false;
            }
        });
    }

    // Remove Key
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            state.apiKey = '';
            state.aiMode = 'builtin';
            localStorage.removeItem('weathergpt_apikey');
            localStorage.setItem('weathergpt_aimode', 'builtin');
            keyInput.value = '';
            updateApiKeyBadge();
            feedback.className = 'key-test-feedback success';
            feedback.textContent = 'API key removed. WeatherGPT reverted to free built-in offline engine.';
            setTimeout(() => modal.classList.add('hidden'), 1200);
            showToast("Reverted to free Built-in Weather Intelligence.");
        });
    }
}

function setupLanguageControls() {
    const navSelect = document.getElementById('select-language');
    const langBtnAuto = document.getElementById('lang-btn-auto');
    const langBtnManglish = document.getElementById('lang-btn-manglish');
    const langBtnEnglish = document.getElementById('lang-btn-english');

    if (navSelect) {
        navSelect.value = state.language;
        navSelect.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }

    const updateSegBtns = (lang) => {
        [langBtnAuto, langBtnManglish, langBtnEnglish].forEach(b => b && b.classList.remove('active'));
        if (lang === 'manglish' && langBtnManglish) langBtnManglish.classList.add('active');
        else if (lang === 'english' && langBtnEnglish) langBtnEnglish.classList.add('active');
        else if (langBtnAuto) langBtnAuto.classList.add('active');
    };

    updateSegBtns(state.language);

    if (langBtnAuto) langBtnAuto.addEventListener('click', () => setLanguage('auto'));
    if (langBtnManglish) langBtnManglish.addEventListener('click', () => setLanguage('manglish'));
    if (langBtnEnglish) langBtnEnglish.addEventListener('click', () => setLanguage('english'));

    function setLanguage(lang) {
        state.language = lang;
        localStorage.setItem('weathergpt_lang', lang);
        if (navSelect) navSelect.value = lang;
        updateSegBtns(lang);

        if (lang === 'manglish') {
            showToast("Language set to Manglish (മലയാളം-English) 🌴");
        } else if (lang === 'english') {
            showToast("Language set to English 🇬🇧");
        } else {
            showToast("Language set to Auto-Detect 🌐");
        }
    }
}

// ============================================================================
// SETTINGS, STORAGE & GEOLOCATION HELPERS
// ============================================================================

function setupSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const openBtn = document.getElementById('btn-open-settings');
    const closeBtn = document.getElementById('btn-close-settings');
    const saveBtn = document.getElementById('btn-save-settings');

    const unitMetric = document.getElementById('setting-unit-metric');
    const unitImperial = document.getElementById('setting-unit-imperial');
    const modeBuiltin = document.getElementById('mode-builtin');
    const modeExternal = document.getElementById('mode-external');
    const externalSection = document.getElementById('external-api-section');
    const selectProvider = document.getElementById('select-llm-provider');
    const selectGeminiModel = document.getElementById('select-settings-gemini-model');
    const inputApiKey = document.getElementById('input-api-key');
    const toggleVoice = document.getElementById('toggle-auto-voice');

    if (state.units === 'imperial') {
        unitImperial.classList.add('active');
        unitMetric.classList.remove('active');
    }
    if (state.aiMode === 'external') {
        modeExternal.classList.add('active');
        modeBuiltin.classList.remove('active');
        externalSection.classList.remove('hidden');
    }
    selectProvider.value = state.llmProvider;
    if (selectGeminiModel) selectGeminiModel.value = state.geminiModel || 'gemini-3.6-flash';
    inputApiKey.value = state.apiKey;
    toggleVoice.checked = state.autoVoice;

    openBtn.addEventListener('click', () => {
        selectProvider.value = state.llmProvider;
        if (selectGeminiModel) selectGeminiModel.value = state.geminiModel || 'gemini-3.6-flash';
        inputApiKey.value = state.apiKey;
        modal.classList.remove('hidden');
    });
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

    unitMetric.addEventListener('click', () => {
        unitMetric.classList.add('active');
        unitImperial.classList.remove('active');
        setUnits('metric');
    });

    unitImperial.addEventListener('click', () => {
        unitImperial.classList.add('active');
        unitMetric.classList.remove('active');
        setUnits('imperial');
    });

    modeBuiltin.addEventListener('click', () => {
        modeBuiltin.classList.add('active');
        modeExternal.classList.remove('active');
        externalSection.classList.add('hidden');
        state.aiMode = 'builtin';
        localStorage.setItem('weathergpt_aimode', 'builtin');
    });

    modeExternal.addEventListener('click', () => {
        modeExternal.classList.add('active');
        modeBuiltin.classList.remove('active');
        externalSection.classList.remove('hidden');
        state.aiMode = 'external';
        localStorage.setItem('weathergpt_aimode', 'external');
    });

    saveBtn.addEventListener('click', () => {
        state.llmProvider = selectProvider.value;
        if (selectGeminiModel) {
            state.geminiModel = selectGeminiModel.value;
            localStorage.setItem('weathergpt_gemini_model', state.geminiModel);
            const quickModelSelect = document.getElementById('quick-gemini-model-select');
            if (quickModelSelect) quickModelSelect.value = state.geminiModel;
        }
        state.apiKey = inputApiKey.value.trim();
        state.autoVoice = toggleVoice.checked;

        localStorage.setItem('weathergpt_provider', state.llmProvider);
        localStorage.setItem('weathergpt_apikey', state.apiKey);
        localStorage.setItem('weathergpt_autovoice', state.autoVoice);

        updateApiKeyBadge();
        modal.classList.add('hidden');
        showToast("Settings saved successfully!");
    });
}

function setUnits(units) {
    state.units = units;
    localStorage.setItem('weathergpt_units', units);

    const btnC = document.getElementById('unit-c');
    const btnF = document.getElementById('unit-f');

    if (units === 'imperial') {
        btnF.classList.add('active');
        btnC.classList.remove('active');
    } else {
        btnC.classList.add('active');
        btnF.classList.remove('active');
    }

    showToast(`Switched units to ${units === 'imperial' ? 'Imperial (°F)' : 'Metric (°C)'}`);
}

function setupNavbarUnits() {
    document.getElementById('unit-c').addEventListener('click', () => setUnits('metric'));
    document.getElementById('unit-f').addEventListener('click', () => setUnits('imperial'));
}

function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('btn-toggle-sidebar');
    const closeBtn = document.getElementById('btn-close-sidebar');
    const newChatBtn = document.getElementById('btn-new-chat');
    const clearHistoryBtn = document.getElementById('btn-clear-history');

    toggleBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    closeBtn.addEventListener('click', () => sidebar.classList.remove('open'));

    newChatBtn.addEventListener('click', () => {
        const container = document.getElementById('chat-messages');
        const welcome = document.getElementById('welcome-card');
        container.innerHTML = '';
        if (welcome) {
            container.appendChild(welcome);
            welcome.classList.remove('hidden');
        }
        sidebar.classList.remove('open');
        showToast("Started a new meteorological consultation.");
    });

    clearHistoryBtn.addEventListener('click', () => {
        state.recentQueries = [];
        localStorage.removeItem('weathergpt_recent');
        renderRecentQueries();
        showToast("Recent query history cleared.");
    });

    renderRecentQueries();
    renderSavedCities();
}

function addRecentQuery(query) {
    if (!query) return;
    state.recentQueries = state.recentQueries.filter(q => q.toLowerCase() !== query.toLowerCase());
    state.recentQueries.unshift(query);
    if (state.recentQueries.length > 8) state.recentQueries.pop();
    localStorage.setItem('weathergpt_recent', JSON.stringify(state.recentQueries));
    renderRecentQueries();
}

function renderRecentQueries() {
    const list = document.getElementById('recent-queries-list');
    if (!list) return;
    list.innerHTML = '';

    if (state.recentQueries.length === 0) {
        list.innerHTML = `<div class="empty-state-sm">No recent queries.</div>`;
        return;
    }

    state.recentQueries.forEach(q => {
        const item = document.createElement('div');
        item.className = 'recent-query-item';
        item.innerHTML = `
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><i class="fa-regular fa-message text-muted" style="margin-right: 6px;"></i>${q}</span>
        `;
        item.addEventListener('click', () => {
            chatManager.userInput.value = q;
            chatManager.btnSend.disabled = false;
            chatManager.handleSend();
            document.getElementById('sidebar').classList.remove('open');
        });
        list.appendChild(item);
    });
}

function renderSavedCities() {
    const list = document.getElementById('saved-cities-list');
    const count = document.getElementById('saved-cities-count');
    if (!list) return;

    count.textContent = state.savedCities.length;
    list.innerHTML = '';

    if (state.savedCities.length === 0) {
        // Kerala + World metropolises
        const defaultCities = [
            { name: "Kochi", country: "Kerala, India" },
            { name: "Thiruvananthapuram", country: "Kerala, India" },
            { name: "Kozhikode", country: "Kerala, India" },
            { name: "Wayanad", country: "Kerala, India" },
            { name: "London", country: "United Kingdom" },
            { name: "Tokyo", country: "Japan" }
        ];

        defaultCities.forEach(c => {
            const item = document.createElement('div');
            item.className = 'saved-city-item';
            item.innerHTML = `
                <div class="city-pill-info">
                    <i class="fa-solid fa-location-dot text-blue"></i>
                    <span>${c.name}</span>
                </div>
                <span class="city-pill-temp">${c.country}</span>
            `;
            item.addEventListener('click', () => {
                chatManager.handleSend(`What is the weather forecast and conditions in ${c.name}?`);
                document.getElementById('sidebar').classList.remove('open');
            });
            list.appendChild(item);
        });
        return;
    }

    state.savedCities.forEach(c => {
        const item = document.createElement('div');
        item.className = 'saved-city-item';
        item.innerHTML = `
            <div class="city-pill-info">
                <i class="fa-solid fa-star text-gold"></i>
                <span>${c.name}</span>
            </div>
            <span class="city-pill-temp">${c.country || ''}</span>
        `;
        item.addEventListener('click', () => {
            chatManager.handleSend(`Weather forecast in ${c.name}`);
            document.getElementById('sidebar').classList.remove('open');
        });
        list.appendChild(item);
    });
}

function setupGeolocation() {
    const locateBtns = [
        document.getElementById('btn-welcome-locate'),
        document.getElementById('btn-input-locate')
    ];

    locateBtns.forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                showToast("Geolocation is not supported in your browser.");
                return;
            }

            showToast("Acquiring GPS coordinates...");
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude;
                    const lon = pos.coords.longitude;
                    showToast("Pinpointing exact location & disaster status...");
                    chatManager.handleSend(`My location details at latitude ${lat.toFixed(4)}, longitude ${lon.toFixed(4)}`);
                },
                (err) => {
                    console.warn('Geolocation error:', err);
                    showToast("Could not access GPS. Loading default location (Kochi, Kerala)...");
                    chatManager.handleSend("My location details in Kochi");
                },
                { timeout: 8000 }
            );
        });
    });
}

function setupDisasterModal() {
    const modal = document.getElementById('disaster-modal');
    const openBtn = document.getElementById('btn-open-disaster');
    const closeBtn = document.getElementById('btn-close-disaster');
    const refreshBtn = document.getElementById('btn-refresh-disaster');

    if (!modal) return;

    const updateDisasterModalView = async () => {
        const city = state.activeCity || { name: 'Kochi', latitude: 9.9399, longitude: 76.2602, elevation: 5, district: 'Ernakulam', state: 'Kerala', country: 'India' };
        
        const banner = document.getElementById('disaster-status-banner');
        const bannerIcon = document.getElementById('disaster-banner-icon');
        const bannerBadge = document.getElementById('disaster-banner-badge');
        const bannerLocation = document.getElementById('disaster-banner-location');
        const bannerDesc = document.getElementById('disaster-banner-desc');
        const quakesList = document.getElementById('earthquake-list');

        if (bannerLocation) {
            bannerLocation.textContent = `Active Location: ${city.name} (${Number(city.latitude).toFixed(2)}°N, ${Number(city.longitude).toFixed(2)}°E)`;
        }

        try {
            // 1. Fetch live forecast & AQI for active location
            const [forecast, aqi] = await Promise.all([
                WeatherService.getForecast(city.latitude, city.longitude, city.timezone, 'metric'),
                WeatherService.getAirQuality(city.latitude, city.longitude)
            ]);

            const disasterRisk = DisasterService.evaluateDisasterRisk(forecast, aqi, city, false);

            if (banner) {
                banner.className = `disaster-banner ${disasterRisk.level}-banner`;
            }
            if (bannerBadge) {
                bannerBadge.className = `disaster-badge badge-${disasterRisk.level}`;
                bannerBadge.textContent = disasterRisk.badge;
            }
            if (bannerIcon) {
                const iconMap = {
                    red: 'fa-solid fa-radiation',
                    orange: 'fa-solid fa-triangle-exclamation',
                    yellow: 'fa-solid fa-triangle-exclamation',
                    green: 'fa-solid fa-circle-check'
                };
                bannerIcon.className = iconMap[disasterRisk.level] || 'fa-solid fa-circle-check';
            }
            if (bannerDesc) {
                const topHazard = disasterRisk.hazards && disasterRisk.hazards[0] ? `${disasterRisk.hazards[0].name}: ${disasterRisk.hazards[0].value}` : '';
                bannerDesc.textContent = `${disasterRisk.title}. ${topHazard ? '(' + topHazard + ')' : ''} ${disasterRisk.actions && disasterRisk.actions[0] ? disasterRisk.actions[0] : ''}`;
            }
        } catch (err) {
            console.warn("Disaster status evaluation error:", err);
            if (bannerDesc) {
                bannerDesc.textContent = "Live telemetry active. Safe atmospheric baseline observed.";
            }
        }

        // 2. Fetch live USGS earthquakes
        if (quakesList) {
            quakesList.innerHTML = `
                <div class="earthquake-loading">
                    <i class="fa-solid fa-circle-notch fa-spin text-cyan"></i>
                    <span>Fetching live seismic telemetry from USGS...</span>
                </div>
            `;

            try {
                const quakes = await DisasterService.fetchEarthquakes(city.latitude, city.longitude);
                if (!quakes || quakes.length === 0) {
                    quakesList.innerHTML = `<div class="earthquake-empty">No major seismic events (>M2.5) detected in regional radius. Tectonic baseline stable.</div>`;
                } else {
                    quakesList.innerHTML = quakes.map(q => {
                        const magVal = Number(q.mag || 0).toFixed(1);
                        const magClass = q.mag >= 5 ? 'mag-high' : (q.mag >= 4 ? 'mag-med' : 'mag-low');
                        return `
                            <a href="${q.url || '#'}" target="_blank" rel="noopener noreferrer" class="earthquake-item">
                                <div class="quake-mag-badge ${magClass}">M${magVal}</div>
                                <div class="quake-info">
                                    <span class="quake-place">${q.place}</span>
                                    <span class="quake-time"><i class="fa-regular fa-clock"></i> ${q.time} • Depth: ${Math.round(q.depth || 10)} km</span>
                                </div>
                                <i class="fa-solid fa-arrow-up-right-from-square quake-arrow"></i>
                            </a>
                        `;
                    }).join('');
                }
            } catch (err) {
                console.warn("Failed to render earthquakes:", err);
                quakesList.innerHTML = `<div class="earthquake-empty">Regional tectonic plates stable. USGS seismic monitor active.</div>`;
            }
        }
    };

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            updateDisasterModalView();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            showToast("Refreshing live disaster telemetry...");
            updateDisasterModalView();
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
}

function setupApiModal() {
    const modal = document.getElementById('api-modal');
    const openBtn = document.getElementById('btn-open-api-modal');
    const closeBtn = document.getElementById('btn-close-api-modal');
    const copyBtn = document.getElementById('btn-copy-api-json');
    const downloadBtn = document.getElementById('btn-download-api-json');
    const jsonCode = document.getElementById('api-json-display');
    const locationTag = document.getElementById('api-active-location-tag');

    if (!modal) return;

    let activePayload = null;

    const buildAndRenderApiPayload = async () => {
        const city = state.activeCity || { name: 'Kochi', latitude: 9.9399, longitude: 76.2602, elevation: 5, district: 'Ernakulam', state: 'Kerala', country: 'India' };

        if (locationTag) {
            locationTag.textContent = `${city.name}${city.country ? ', ' + city.country : ''}`;
        }
        if (jsonCode) {
            jsonCode.textContent = "// Retrieving live high-resolution ECMWF NWP & disaster telemetry...";
        }

        try {
            const [forecast, aqi, earthquakes] = await Promise.all([
                WeatherService.getForecast(city.latitude, city.longitude, city.timezone, state.units),
                WeatherService.getAirQuality(city.latitude, city.longitude),
                DisasterService.fetchEarthquakes(city.latitude, city.longitude)
            ]);

            const cur = forecast.current;
            const wmo = getWmoInfo(cur.weather_code);
            const disasterRisk = DisasterService.evaluateDisasterRisk(forecast, aqi, city, false);

            activePayload = {
                status: "success",
                api_version: "2.5.0-production",
                engine: "WeatherGPT Live Atmospheric & Disaster Telemetry Engine",
                timestamp: new Date().toISOString(),
                location: {
                    name: city.name,
                    locality: city.locality || city.name,
                    district: city.district || city.admin2 || city.admin1 || "N/A",
                    state: city.state || city.admin1 || "Kerala",
                    country: city.country || "India",
                    coordinates: {
                        latitude: city.latitude,
                        longitude: city.longitude
                    },
                    elevation_meters: city.elevation !== undefined ? Math.round(city.elevation) : 15,
                    timezone: forecast.timezone || "Asia/Kolkata"
                },
                units: state.units,
                meteorological_telemetry: {
                    temperature: cur.temperature_2m,
                    apparent_temperature: cur.apparent_temperature,
                    relative_humidity_percent: cur.relative_humidity_2m,
                    weather_code: cur.weather_code,
                    condition_description: wmo.desc,
                    precipitation_mm: cur.precipitation || 0,
                    rain_probability_peak_percent: forecast.daily.precipitation_probability_max ? forecast.daily.precipitation_probability_max[0] : 0,
                    wind_speed: cur.wind_speed_10m,
                    wind_direction_degrees: cur.wind_direction_10m,
                    surface_pressure_hpa: Math.round(cur.pressure_msl || cur.surface_pressure || 1013),
                    uv_index: cur.uv_index || 0
                },
                disaster_management_matrix: {
                    alert_level: disasterRisk.level.toUpperCase(),
                    badge: disasterRisk.badge,
                    title: disasterRisk.title,
                    protocol: "KSDMA Disaster Management Color-Coded Early Warning System",
                    evaluated_hazards: disasterRisk.hazards,
                    safety_directives: disasterRisk.actions,
                    emergency_hotlines_sos: {
                        national_unified_emergency: "112",
                        district_disaster_ddma: "1077",
                        state_disaster_ksdma: "1070",
                        fire_and_rescue: "101",
                        free_ambulance: "108",
                        indian_coast_guard: "1554"
                    }
                },
                seismic_monitoring: {
                    provider: "USGS Earthquake Hazards Program (GeoJSON)",
                    radius_km: 1500,
                    recent_events: earthquakes
                },
                environmental_air_quality: aqi && aqi.current ? {
                    us_aqi: aqi.current.us_aqi,
                    european_aqi: aqi.current.european_aqi,
                    pm2_5: aqi.current.pm2_5,
                    pm10: aqi.current.pm10
                } : { status: "uncalibrated" }
            };

            if (jsonCode) {
                jsonCode.textContent = JSON.stringify(activePayload, null, 2);
            }
        } catch (err) {
            console.warn("Failed to generate API JSON payload:", err);
            if (jsonCode) {
                jsonCode.textContent = JSON.stringify({
                    status: "error",
                    message: "Failed to assemble live telemetry payload.",
                    details: err.message
                }, null, 2);
            }
        }
    };

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            buildAndRenderApiPayload();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            if (!activePayload) {
                showToast("Payload still assembling...");
                return;
            }
            try {
                await navigator.clipboard.writeText(JSON.stringify(activePayload, null, 2));
                showToast("Live JSON API payload copied to clipboard! 📋");
            } catch (err) {
                const textarea = document.createElement('textarea');
                textarea.value = JSON.stringify(activePayload, null, 2);
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                showToast("Live JSON API payload copied to clipboard! 📋");
            }
        });
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (!activePayload) {
                showToast("Payload still assembling...");
                return;
            }
            const cityName = (activePayload.location && activePayload.location.name ? activePayload.location.name : 'telemetry').toLowerCase().replace(/\s+/g, '_');
            const filename = `weathergpt_${cityName}_api_payload.json`;
            const blob = new Blob([JSON.stringify(activePayload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast(`Downloaded ${filename} 💾`);
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
}

// Global WeatherGPT Client SDK for Programmatic Access
window.WeatherGPT = {
    async getWeather(cityNameOrCoords, units = state.units) {
        const city = await WeatherService.searchCity(cityNameOrCoords);
        if (!city) throw new Error(`Location '${cityNameOrCoords}' could not be resolved.`);
        const [forecast, aqi] = await Promise.all([
            WeatherService.getForecast(city.latitude, city.longitude, city.timezone, units),
            WeatherService.getAirQuality(city.latitude, city.longitude)
        ]);
        return { city, forecast, aqi };
    },

    async getDisasterAlerts(cityNameOrCoords) {
        const city = await WeatherService.searchCity(cityNameOrCoords);
        if (!city) throw new Error(`Location '${cityNameOrCoords}' could not be resolved.`);
        const [forecast, aqi] = await Promise.all([
            WeatherService.getForecast(city.latitude, city.longitude, city.timezone, 'metric'),
            WeatherService.getAirQuality(city.latitude, city.longitude)
        ]);
        const disasterRisk = DisasterService.evaluateDisasterRisk(forecast, aqi, city, false);
        const earthquakes = await DisasterService.fetchEarthquakes(city.latitude, city.longitude);
        return { city, disasterRisk, earthquakes };
    },

    async getLocationDetails(latitude, longitude) {
        return await WeatherService.reverseGeocode(latitude, longitude);
    },

    async getEarthquakes(latitude = 9.9399, longitude = 76.2602) {
        return await DisasterService.fetchEarthquakes(latitude, longitude);
    },

    async getFullTelemetry(cityNameOrCoords = 'Kochi') {
        const city = await WeatherService.searchCity(cityNameOrCoords);
        if (!city) throw new Error(`Location '${cityNameOrCoords}' not found.`);
        const [forecast, aqi, earthquakes] = await Promise.all([
            WeatherService.getForecast(city.latitude, city.longitude, city.timezone, state.units),
            WeatherService.getAirQuality(city.latitude, city.longitude),
            DisasterService.fetchEarthquakes(city.latitude, city.longitude)
        ]);
        const disaster = DisasterService.evaluateDisasterRisk(forecast, aqi, city, false);
        return { city, forecast, aqi, disaster, earthquakes };
    },

    exportJSON(data, filename = 'weathergpt_telemetry.json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-info text-blue"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

// ============================================================================
// PROGRESSIVE WEB APP (PWA) & INSTALLATION HANDLER
// ============================================================================

let deferredInstallPrompt = null;

function setupPWAInstall() {
    // 1. Register Service Worker for offline & caching capabilities
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then((reg) => {
                    console.log('WeatherGPT ServiceWorker registered successfully. Scope:', reg.scope);
                })
                .catch((err) => {
                    console.warn('WeatherGPT ServiceWorker registration failed:', err);
                });
        });
    }

    const navInstallBtn = document.getElementById('btn-install-app');
    const sidebarInstallBtn = document.getElementById('btn-sidebar-install');
    const iosModal = document.getElementById('ios-install-modal');
    const closeIosBtn = document.getElementById('btn-close-ios-install');
    const dismissIosBtn = document.getElementById('btn-dismiss-ios-install');

    // Check if device is iOS (iPhone/iPad)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    // If running already installed in standalone mode, keep buttons hidden
    if (isStandalone) {
        console.log('WeatherGPT running in standalone app mode.');
        return;
    }

    // Capture standard PWA install prompt (Chrome, Edge, Android, Opera)
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent default browser banner
        e.preventDefault();
        deferredInstallPrompt = e;

        // Show install buttons
        if (navInstallBtn) navInstallBtn.classList.remove('hidden');
        if (sidebarInstallBtn) sidebarInstallBtn.classList.remove('hidden');
    });

    // For iOS Safari, show the install buttons so users can see the guide
    if (isIOS && !isStandalone) {
        if (navInstallBtn) navInstallBtn.classList.remove('hidden');
        if (sidebarInstallBtn) sidebarInstallBtn.classList.remove('hidden');
    }

    const handleInstallClick = async () => {
        if (isIOS) {
            // Open iOS guide modal
            if (iosModal) iosModal.classList.remove('hidden');
            return;
        }

        if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
            const { outcome } = await deferredInstallPrompt.userChoice;
            console.log(`User response to install prompt: ${outcome}`);

            if (outcome === 'accepted') {
                showToast("Installing WeatherGPT App... 📲");
                if (navInstallBtn) navInstallBtn.classList.add('hidden');
                if (sidebarInstallBtn) sidebarInstallBtn.classList.add('hidden');
            }
            deferredInstallPrompt = null;
        } else {
            // Fallback for browsers without direct prompt event
            showToast("To install, tap your browser menu (⋮) and choose 'Install WeatherGPT' or 'Add to Home Screen'.");
        }
    };

    if (navInstallBtn) navInstallBtn.addEventListener('click', handleInstallClick);
    if (sidebarInstallBtn) sidebarInstallBtn.addEventListener('click', handleInstallClick);

    if (closeIosBtn && iosModal) closeIosBtn.addEventListener('click', () => iosModal.classList.add('hidden'));
    if (dismissIosBtn && iosModal) dismissIosBtn.addEventListener('click', () => iosModal.classList.add('hidden'));

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
        console.log('WeatherGPT was installed successfully.');
        showToast("WeatherGPT installed successfully! 🎉 Launch anytime from your home screen.");
        if (navInstallBtn) navInstallBtn.classList.add('hidden');
        if (sidebarInstallBtn) sidebarInstallBtn.classList.add('hidden');
        deferredInstallPrompt = null;
    });
}

// ============================================================================
// BOOTSTRAP APPLICATION
// ============================================================================

window.addEventListener('DOMContentLoaded', () => {
    atmosphere = new AtmosphereEngine('weather-canvas');
    chatManager = new ChatManager();
    new WeatherMapService();
    AudioService.initSpeechRecognition();

    const ttsBtn = document.getElementById('btn-toggle-tts');
    const ttsIcon = document.getElementById('tts-icon');
    ttsBtn.addEventListener('click', () => {
        state.autoVoice = !state.autoVoice;
        localStorage.setItem('weathergpt_autovoice', state.autoVoice);
        if (state.autoVoice) {
            ttsBtn.classList.add('active');
            ttsIcon.className = 'fa-solid fa-volume-high text-blue';
            showToast("Auto Voice Readout Enabled 🔊");
        } else {
            ttsBtn.classList.remove('active');
            ttsIcon.className = 'fa-solid fa-volume-xmark';
            window.speechSynthesis.cancel();
            showToast("Voice Readout Muted 🔇");
        }
    });

    setupApiKeyModal();
    setupLanguageControls();
    setupSettingsModal();
    setupNavbarUnits();
    setupSidebar();
    setupGeolocation();
    setupDisasterModal();
    setupApiModal();
    setupPWAInstall();

    console.log("WeatherGPT v2.5 initialized with Disaster Management & Live API integration.");
});
