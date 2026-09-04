import {
  RISK_ZONES,
  ROAD_SEGMENTS,
  COMMUNITY_OBSERVATIONS,
  WEATHER_DATA,
  ALERTS,
  RELIEF_CENTERS
} from '../data/mockData';

import {
  SUSCEPTIBILITY_ZONES,
  HISTORICAL_LANDSLIDES,
  PREDEFINED_LOCATIONS
} from '../data/mockSusceptibilityData';
export const ML_API = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

/**
 * Fetch live calculated risk zones directly from Python FastAPI ML Backend
 */
export const fetchLiveRiskZones = async () => {
  try {
    const res = await fetch(`${ML_API}/api/live-risk-zones`);
    if (!res.ok) throw new Error("Backend offline");
    const data = await res.json();
    if (data && data.zones && data.zones.length > 0) {
      return data.zones;
    }
    return RISK_ZONES;
  } catch (err) {
    console.warn("FastAPI ML backend offline, using base telemetry dataset:", err);
    return RISK_ZONES;
  }
};

export const getRiskZones = () => {
  return RISK_ZONES;
};

export const getRoadStatus = () => {
  return ROAD_SEGMENTS;
};

export const getCommunityObservations = () => {
  return COMMUNITY_OBSERVATIONS;
};

export const getWeather = () => {
  return WEATHER_DATA;
};

export const getAlerts = () => {
  return ALERTS;
};

export const getSummaryStats = () => {
  return {
    criticalZones: RISK_ZONES.filter(z => z.risk_level === 'Critical').length,
    highRiskZones: RISK_ZONES.filter(z => z.risk_level === 'High').length,
    roadsAtRisk: ROAD_SEGMENTS.filter(r => r.status === 'Blocked' || r.status === 'At Risk').length,
    activeAlerts: ALERTS.length
  };
};

export const getSusceptibilityZones = () => {
  return SUSCEPTIBILITY_ZONES;
};

export const getHistoricalLandslides = () => {
  return HISTORICAL_LANDSLIDES;
};

export const getPredefinedLocations = () => {
  return PREDEFINED_LOCATIONS;
};

/**
 * Predict susceptibility for a single map point.
 */
export const predictSusceptibility = async (lat, lng, terrain) => {
  const res = await fetch(`${ML_API}/predict/susceptibility`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      latitude:      lat,
      longitude:     lng,
      slope_degrees: terrain.slope_degrees,
      elevation_m:   terrain.elevation_m,
      land_use_code: terrain.land_use_code,
      soil_code:     terrain.soil_code,
    }),
  });
  if (!res.ok) throw new Error(`Susceptibility API error: ${res.status}`);
  return res.json();
};

/**
 * Predict early-warning alert level for a single map point.
 */
export const predictEarlyWarning = async (lat, lng, weather) => {
  const res = await fetch(`${ML_API}/predict/early-warning`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      latitude:           lat,
      longitude:          lng,
      current_rain_mm_hr: weather.current_rain_mm_hr,
      rain_48h_mm:        weather.rain_48h_mm,
      soil_moisture_pct:  weather.soil_moisture_pct,
      forecast_severity:  weather.forecast_severity,
    }),
  });
  if (!res.ok) throw new Error(`Early-Warning API error: ${res.status}`);
  return res.json();
};

/**
 * Batch early-warning: updates ALL risk zones with live ML predictions in one call.
 */
export const batchPredictWarnings = async (zones, globalWeather) => {
  const points = zones.map(z => ({
    latitude:           z.latitude,
    longitude:          z.longitude,
    slope_degrees:      z.slope_degrees ?? 30.0,
    elevation_m:        z.elevation_m   ?? 500.0,
    land_use_code:      z.land_use_code ?? 2,
    soil_code:          z.soil_code     ?? 3,
    current_rain_mm_hr: globalWeather?.current_rain_mm_hr !== undefined ? globalWeather.current_rain_mm_hr : (z.current_rain_mm_hr ?? 20),
    rain_48h_mm:        globalWeather?.rain_48h_mm !== undefined ? globalWeather.rain_48h_mm : (z.rain_48h_mm ?? 80),
    soil_moisture_pct:  globalWeather?.soil_moisture_pct !== undefined ? globalWeather.soil_moisture_pct : (z.soil_moisture_pct ?? 60),
    forecast_severity:  globalWeather?.forecast_severity ?? 1,
  }));

  const res = await fetch(`${ML_API}/predict/batch-warning`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(points),
  });
  if (!res.ok) throw new Error(`Batch Warning API error: ${res.status}`);
  return res.json();
};

/**
 * Fetch sample records directly from susceptibility dataset CSV via backend.
 */
export const fetchSusceptibilityDataset = async (limit = 100) => {
  try {
    const res = await fetch(`${ML_API}/dataset/susceptibility?limit=${limit}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn("FastAPI backend offline, skipping dataset fetch:", err);
    return [];
  }
};

/**
 * Fetch real-time satellite weather from Open-Meteo API for any North-East India coordinate
 */
export const fetchRealTimeWeather = async (lat = 25.5788, lng = 91.8933) => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=precipitation,rain,relative_humidity_2m,weather_code&hourly=precipitation&forecast_days=2`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather API error");
    const data = await res.json();
    const currentRain = data.current?.rain || data.current?.precipitation || 0;
    const humidity = data.current?.relative_humidity_2m || 75;
    
    const hourlyRain = data.hourly?.precipitation || [];
    const rain48h = hourlyRain.reduce((a, b) => a + (b || 0), 0);

    return {
      current_rain_mm_hr: Math.round(currentRain * 10) / 10,
      rain_48h_mm: Math.round((rain48h || currentRain * 24) * 10) / 10,
      soil_moisture_pct: Math.min(100, Math.round(humidity * 0.9)),
      forecast_severity: currentRain > 35 ? 3 : currentRain > 15 ? 2 : currentRain > 2 ? 1 : 0,
      location: `Coordinates (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E) - Open-Meteo Satellite`,
      timestamp: new Date().toLocaleTimeString()
    };
  } catch (err) {
    console.warn("Real-time weather API offline:", err);
    return {
      current_rain_mm_hr: 38.0,
      rain_48h_mm: 175.0,
      soil_moisture_pct: 78,
      forecast_severity: 2,
      location: "Guwahati-Shillong Corridor",
      timestamp: new Date().toLocaleTimeString()
    };
  }
};

export const getReliefCenters = () => {
  return RELIEF_CENTERS;
};

export const calculateEvacuationRoute = async (startLat, startLng, endLat, endLng, hazardZones) => {
  try {
    const res = await fetch(`${ML_API}/api/evacuation-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_lat: startLat,
        start_lng: startLng,
        end_lat: endLat,
        end_lng: endLng,
        hazard_zones: hazardZones.map(z => ({ lat: z.latitude, lng: z.longitude }))
      })
    });
    if (!res.ok) throw new Error("Backend offline");
    return await res.json();
  } catch (err) {
    console.error("Failed to calculate route:", err);
    return null;
  }
};
