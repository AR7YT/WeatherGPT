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
// ============================================================================

class WeatherService {
    static async searchCity(query) {
        try {
            // 1. Direct GPS coordinate matching (e.g. "latitude 28.613, longitude 77.209" or "37.77, -122.41")
            const coordMatch = query.match(/(?:lat|latitude)[\s:=]+([+-]?\d+(?:\.\d+)?)[,\s]+(?:lon|long|longitude)[\s:=]+([+-]?\d+(?:\.\d+)?)/i);
            if (coordMatch) {
                return {
                    name: "Local GPS Location",
                    latitude: parseFloat(coordMatch[1]),
                    longitude: parseFloat(coordMatch[2]),
                    country: "GPS Coordinates",
                    timezone: "auto"
                };
            }

            const rawCoord = query.match(/^\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)\s*$/);
            if (rawCoord) {
                return {
                    name: `${rawCoord[1]}, ${rawCoord[2]}`,
                    latitude: parseFloat(rawCoord[1]),
                    longitude: parseFloat(rawCoord[2]),
                    country: "Coordinates",
                    timezone: "auto"
                };
            }

            // 2. Clean query and check aliases
            let cleanQuery = query.replace(/[?!.]/g, '').trim();
            const lowerQuery = cleanQuery.toLowerCase();
            if (KERALA_CITY_ALIASES[lowerQuery]) {
                cleanQuery = KERALA_CITY_ALIASES[lowerQuery];
            }

            // 3. Geocoding search via Open-Meteo
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=5&language=en&format=json`);
            if (!res.ok) throw new Error('Geocoding service unavailable');
            const data = await res.json();
            if (!data.results || data.results.length === 0) return null;
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
    static detect(weatherData, aqiData, units) {
        const alerts = [];
        const current = weatherData.current;
        const daily = weatherData.daily;
        const isImperial = units === 'imperial';

        // 1. Extreme Heat Alert
        const maxTemp = isImperial ? 100 : 38;
        const currentTemp = current.temperature_2m;
        const feelsLike = current.apparent_temperature;
        const heatThreshold = isImperial ? 104 : 40;

        if (feelsLike >= heatThreshold || currentTemp >= maxTemp) {
            alerts.push({
                level: 'warning',
                badge: 'Extreme Heat Warning',
                icon: 'fa-temperature-arrow-up',
                title: 'High Heat & Thermal Strain Advisory',
                desc: `Dangerous heat index of ${Math.round(feelsLike)}°${isImperial ? 'F' : 'C'}. High risk of heat exhaustion and dehydration.`,
                safety: [
                    'Avoid prolonged outdoor exertion between 11:00 AM and 4:00 PM.',
                    'Stay hydrated with electrolytes and seek air-conditioned environments.',
                    'Never leave children or pets in closed vehicles.'
                ]
            });
        }

        // 2. Severe Thunderstorm & Hail Warning
        if ([95, 96, 99].includes(current.weather_code)) {
            const isSevereHail = current.weather_code === 99;
            alerts.push({
                level: 'warning',
                badge: isSevereHail ? 'Severe Storm & Hail Warning' : 'Thunderstorm Alert',
                icon: 'fa-cloud-bolt',
                title: isSevereHail ? 'Severe Hail & Intense Lightning Hazard' : 'Active Thunderstorm Observed',
                desc: `Dangerous electrical activity detected with wind gusts up to ${Math.round(current.wind_gusts_10m || current.wind_speed_10m)} ${isImperial ? 'mph' : 'km/h'}.`,
                safety: [
                    'Seek substantial indoor shelter immediately; avoid trees or open fields.',
                    'Disconnect sensitive electronic equipment.',
                    'Stay away from windows and do not drive through flooded roadways.'
                ]
            });
        }

        // 3. Gale Force Wind Alert
        const galeThreshold = isImperial ? 38 : 60; // mph or km/h
        const gustThreshold = isImperial ? 50 : 80;
        const currentWind = current.wind_speed_10m;
        const currentGusts = current.wind_gusts_10m || currentWind;

        if (currentWind >= galeThreshold || currentGusts >= gustThreshold) {
            alerts.push({
                level: 'watch',
                badge: 'Gale Wind Warning',
                icon: 'fa-wind',
                title: 'High Velocity Winds & Tree Hazard',
                desc: `Sustained winds of ${Math.round(currentWind)} ${isImperial ? 'mph' : 'km/h'} with severe gusts up to ${Math.round(currentGusts)} ${isImperial ? 'mph' : 'km/h'}.`,
                safety: [
                    'Secure loose outdoor furniture, umbrellas, and garbage receptacles.',
                    'Exercise extreme caution when driving high-profile vehicles.',
                    'Watch for fallen powerlines and falling tree limbs.'
                ]
            });
        }

        // 4. Freezing / Ice Risk
        const freezeThreshold = isImperial ? 32 : 0;
        if (currentTemp <= freezeThreshold && (current.precipitation > 0 || [56, 57, 66, 67, 71, 73, 75].includes(current.weather_code))) {
            alerts.push({
                level: 'watch',
                badge: 'Freezing Road & Ice Warning',
                icon: 'fa-snowflake',
                title: 'Black Ice & Glaze Hazards',
                desc: `Sub-freezing temperatures (${Math.round(currentTemp)}°${isImperial ? 'F' : 'C'}) combined with moisture create invisible black ice conditions.`,
                safety: [
                    'Significantly reduce driving speeds and increase braking distance.',
                    'Wrap outdoor exposed plumbing and pipes to prevent freezing bursts.',
                    'Wear insulated non-slip footwear to prevent slips and falls.'
                ]
            });
        }

        // 5. Air Quality Hazard
        if (aqiData && aqiData.current && aqiData.current.us_aqi >= 151) {
            const aqi = aqiData.current.us_aqi;
            const isHazardous = aqi >= 250;
            alerts.push({
                level: isHazardous ? 'warning' : 'advisory',
                badge: isHazardous ? 'Hazardous Air Warning' : 'Poor Air Quality Advisory',
                icon: 'fa-mask-ventilator',
                title: `US AQI index measured at ${aqi} (Unhealthy)`,
                desc: `Elevated particulate matter (PM2.5 / PM10) concentrations pose respiratory and cardiovascular health risks.`,
                safety: [
                    'Wear an N95/KF94 mask when outdoors.',
                    'Keep windows closed and operate indoor HEPA air purifiers.',
                    'Vulnerable groups (children, elderly, asthma patients) should remain indoors.'
                ]
            });
        }

        return alerts;
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

        // 4. Severe Alerts (English + Manglish)
        if (lower.includes('alert') || lower.includes('warning') || lower.includes('severe') || lower.includes('storm') || lower.includes('tornado') || lower.includes('hurricane') || lower.includes('flood') || lower.includes('minnal') || lower.includes('jagratha')) {
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

        // 3. Preposition lookahead matching (in, at, for, near)
        const stopwords = new Set([
            'air quality', 'air', 'quality', 'aqi', 'pm2.5', 'pm10', 'uv index', 'uv',
            'forecast', 'weather', 'storm', 'alerts', 'alert', 'warning', 'climate',
            'what', 'wear', 'clothing', 'today', 'tomorrow', 'weekend', 'current',
            'mazha', 'choodu', 'kuda', 'nale', 'innu', 'ippo', 'keralam'
        ]);

        const matches = [...prompt.matchAll(/\b(?:in|at|for|near)\s+([A-Za-z\s\.-]+?)(?=(?:\s+(?:today|tomorrow|right now|this weekend|next week|with|and|give|please|innu|nale|ippo)|[?!.,;]|$))/gi)];
        for (let i = matches.length - 1; i >= 0; i--) {
            let candidate = matches[i][1].trim();
            candidate = candidate.replace(/-(?:yil|il|the|le|nu)$/i, '').trim();
            if (!stopwords.has(candidate.toLowerCase()) && candidate.length >= 2) {
                return KERALA_CITY_ALIASES[candidate.toLowerCase()] || candidate;
            }
        }

        // 4. Check known Kerala city names in prompt directly
        const keralaCities = ['kochi', 'cochin', 'ernakulam', 'trivandrum', 'thiruvananthapuram', 'calicut', 'kozhikode', 'thrissur', 'trichur', 'wayanad', 'munnar', 'alappuzha', 'alleppey', 'kollam', 'kottayam', 'palakkad', 'kannur', 'idukki', 'malappuram', 'kasaragod'];
        for (let kc of keralaCities) {
            const regex = new RegExp(`\\b${kc}\\b`, 'i');
            if (regex.test(prompt)) {
                return KERALA_CITY_ALIASES[kc] || kc.charAt(0).toUpperCase() + kc.slice(1);
            }
        }

        // 5. Fallback: clean question phrasing
        let clean = prompt
            .replace(/what('s|\s+is) the weather (like )?(in|at|for)?/gi, '')
            .replace(/will it rain (in|at)?/gi, '')
            .replace(/air quality (index |aqi )?(in|at|for)?/gi, '')
            .replace(/forecast (for|in)?/gi, '')
            .replace(/alerts? (in|for|near)?/gi, '')
            .replace(/what should i wear (today )?(in|at)?/gi, '')
            .replace(/7-?day forecast (for|in)?/gi, '')
            .replace(/hourly (forecast |weather )?(in|for)?/gi, '')
            .replace(/tell me (about )?the weather (in|at)?/gi, '')
            .replace(/weather|forecast|today|tomorrow|right now|mazha|choodu|engane|undo|peyyumo|nale|innu/gi, '')
            .replace(/[?.,!]/g, '')
            .trim();

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

        return `### 🌤️ **Atmospheric Briefing: ${city.name}**
Aliya, **${city.name}**-yil ippo **${temp}${tempUnit}** aanu temperature. Feels like **${feelsLike}${tempUnit}**.
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
                        <span>${city.name}${city.country ? ', ' + city.country : ''}</span>
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
        document.getElementById('active-location-name').textContent = `${city.name}, ${city.country || ''}`;

        this.showTyping(`Fetching high-resolution NWP models & air quality for ${city.name}...`);

        const [weatherData, aqiData] = await Promise.all([
            WeatherService.getForecast(city.latitude, city.longitude, city.timezone, state.units),
            WeatherService.getAirQuality(city.latitude, city.longitude)
        ]);

        const wmo = getWmoInfo(weatherData.current.weather_code);
        if (atmosphere) atmosphere.setMood(wmo.mood);

        const detectedAlerts = AlertDetector.detect(weatherData, aqiData, state.units);
        const tempUnit = state.units === 'imperial' ? '°F' : '°C';
        const windUnit = state.units === 'imperial' ? 'mph' : 'km/h';
        const cur = weatherData.current;
        const daily = weatherData.daily;

        let narrative = "";
        let widgets = [];

        // If Manglish query or mode, use tailored Manglish generator
        if (isManglish) {
            narrative = WeatherGPTEngine.generateManglishBriefing(city, weatherData, aqiData, detectedAlerts, intent);
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

        // Standard English responses
        if (intent.type === 'aqi') {
            const usAqi = aqiData && aqiData.current ? aqiData.current.us_aqi : 'N/A';
            narrative = `### Air Quality & Environmental Health Diagnostic: **${city.name}**\nCurrent **US AQI index** is measured at **${usAqi}**.\n* Dominant particulates include PM2.5 and PM10 measured by the European Copernicus Atmospheric Monitoring Service (CAMS).\n* Review the full pollutant breakdown below:`;
            widgets.push(UIRenderer.createAqiCard(aqiData));
            widgets.push(UIRenderer.createWeatherHeroCard(city, weatherData, state.units));
        } else if (intent.type === 'alert') {
            if (detectedAlerts.length > 0) {
                narrative = `⚠️ **Active Meteorological Alerts Detected for ${city.name}:**\nI have analyzed real-time atmospheric telemetry and flagged **${detectedAlerts.length} critical advisory tier(s)**. Review the emergency guidance below:`;
                widgets.push(UIRenderer.createAlertCards(detectedAlerts));
                widgets.push(UIRenderer.createWeatherHeroCard(city, weatherData, state.units));
            } else {
                narrative = `✅ **No Severe Storm Warnings or Critical Watches Active for ${city.name}**\nAtmospheric pressure is steady at **${Math.round(cur.pressure_msl || cur.surface_pressure || 1013)} hPa**, surface winds are calm to moderate at **${Math.round(cur.wind_speed_10m)} ${windUnit}**, and no immediate thermal or convective hazard thresholds are breached.`;
                widgets.push(UIRenderer.createWeatherHeroCard(city, weatherData, state.units));
                widgets.push(UIRenderer.createHourlyCard(weatherData, state.units));
            }
        } else if (intent.type === 'lifestyle') {
            const advice = WeatherGPTEngine.generateLifestyleAdvice(cur, daily, state.units);
            narrative = `### Meteorological Lifestyle & Clothing Advisory for **${city.name}**\nCurrently **${Math.round(cur.temperature_2m)}${tempUnit}** (feels like **${Math.round(cur.apparent_temperature)}${tempUnit}**) with *${wmo.desc}*.\n\n🧥 **What To Wear**:\n${advice.clothing.map(c => `* ${c}`).join('\n')}\n\n🎒 **Gear & Essentials**:\n${advice.gear.length > 0 ? advice.gear.map(g => `* ${g}`).join('\n') : '* Standard day-wear is sufficient; no specialized wet-weather gear required.'}\n\n🏃 **Outdoor Activity Suitability**:\n* ${advice.outdoorAdvice}`;
            widgets.push(UIRenderer.createWeatherHeroCard(city, weatherData, state.units));
            widgets.push(UIRenderer.createHourlyCard(weatherData, state.units));
        } else if (intent.type === 'forecast') {
            narrative = `### 7-Day Atmospheric Outlook for **${city.name}, ${city.country || ''}**\nThe upcoming synoptic pattern shows a diurnal high of **${Math.round(daily.temperature_2m_max[0])}${tempUnit}** and overnight low of **${Math.round(daily.temperature_2m_min[0])}${tempUnit}**.\n${detectedAlerts.length > 0 ? `> ⚠️ **Notice:** Extreme weather thresholds detected. See alert card below.\n` : ''}`;
            if (detectedAlerts.length > 0) widgets.push(UIRenderer.createAlertCards(detectedAlerts));
            widgets.push(UIRenderer.createWeatherHeroCard(city, weatherData, state.units));
            widgets.push(UIRenderer.createDailyCard(weatherData, state.units));
            widgets.push(UIRenderer.createHourlyCard(weatherData, state.units));
        } else if (intent.type === 'hourly') {
            narrative = `### 24-Hour Diurnal Progression for **${city.name}**\nReview the interactive temperature curve and precipitation probability below. Peak temperature will reach **${Math.round(daily.temperature_2m_max[0])}${tempUnit}**.`;
            widgets.push(UIRenderer.createHourlyCard(weatherData, state.units));
            widgets.push(UIRenderer.createWeatherHeroCard(city, weatherData, state.units));
        } else {
            const rainMax = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;
            narrative = `### Meteorological Briefing: **${city.name}, ${city.country || ''}**\n* **Current Conditions**: **${Math.round(cur.temperature_2m)}${tempUnit}** • *${wmo.desc}* (Feels like **${Math.round(cur.apparent_temperature)}${tempUnit}**)\n* **Diurnal Range**: Expected high of **${Math.round(daily.temperature_2m_max[0])}${tempUnit}** and overnight low of **${Math.round(daily.temperature_2m_min[0])}${tempUnit}**.\n* **Precipitation Risk**: Maximum rain chance today is **${rainMax}%** with humidity at **${cur.relative_humidity_2m}%**.\n* **Wind**: Surface winds blowing at **${Math.round(cur.wind_speed_10m)} ${windUnit}** from the **${UIRenderer.getWindDirection(cur.wind_direction_10m)}**.`;
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

        const telemetryContext = {
            city: `${city.name}, ${city.country || ''}`,
            coordinates: `${city.latitude}, ${city.longitude}`,
            units: state.units,
            current_temperature: weatherData.current.temperature_2m,
            apparent_temperature: weatherData.current.apparent_temperature,
            weather_condition: getWmoInfo(weatherData.current.weather_code).desc,
            humidity_percent: weatherData.current.relative_humidity_2m,
            wind_speed: weatherData.current.wind_speed_10m,
            daily_high: weatherData.daily.temperature_2m_max[0],
            daily_low: weatherData.daily.temperature_2m_min[0],
            rain_probability_max: weatherData.daily.precipitation_probability_max ? weatherData.daily.precipitation_probability_max[0] : 0,
            aqi: aqiData && aqiData.current ? aqiData.current.us_aqi : 'unknown'
        };

        const llmNarrative = await this.callLLMDirect(query, telemetryContext, isManglish);

        const widgets = [
            UIRenderer.createWeatherHeroCard(city, weatherData, state.units),
            UIRenderer.createHourlyCard(weatherData, state.units),
            UIRenderer.createDailyCard(weatherData, state.units)
        ];

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
        dot.className = 'status-dot dot-empty';
        text.textContent = '🔑 Connect Gemini 3.6';
    }
}

function setupApiKeyModal() {
    const modal = document.getElementById('apikey-modal');
    const openBtn = document.getElementById('btn-open-apikey');
    const welcomeKeyBtn = document.getElementById('btn-welcome-apikey');
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
        feedback.className = 'key-test-feedback hidden';
        feedback.textContent = '';
        modal.classList.remove('hidden');
    };

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (welcomeKeyBtn) welcomeKeyBtn.addEventListener('click', openModal);
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
                    chatManager.handleSend(`What is the current weather forecast, AQI, and alerts at latitude ${lat.toFixed(3)}, longitude ${lon.toFixed(3)}?`);
                },
                (err) => {
                    console.warn('Geolocation error:', err);
                    showToast("Could not access location. Please allow browser location access.");
                },
                { timeout: 8000 }
            );
        });
    });
}

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
    setupPWAInstall();

    console.log("WeatherGPT v2.2 initialized with PWA & Gemini 3.6 integration.");
});
