import React, { useState, useEffect } from 'react';
import { CloudRain, Radio, Play, Pause, RefreshCw, Zap } from 'lucide-react';
import { fetchRealTimeWeather, batchPredictWarnings } from '../services/api';

export default function LiveWeatherController({ riskZones, onUpdatePredictions }) {
  const [weather, setWeather] = useState({
    current_rain_mm_hr: 32,
    rain_48h_mm: 160,
    soil_moisture_pct: 78,
    forecast_severity: 2,
    location: "Guwahati-Shillong Corridor",
    timestamp: "Live Telemetry"
  });

  const [isAutoSimulating, setIsAutoSimulating] = useState(true);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-run ML Batch Predictions whenever weather or riskZones change
  useEffect(() => {
    let isMounted = true;
    const runBatchML = async () => {
      if (!riskZones || riskZones.length === 0) return;
      try {
        const res = await batchPredictWarnings(riskZones, weather);
        if (isMounted && res.predictions && typeof onUpdatePredictions === 'function') {
          onUpdatePredictions(res.predictions, weather);
        }
      } catch (err) {
        console.warn("ML Batch API error (using local state fallback):", err);
        if (isMounted && typeof onUpdatePredictions === 'function') {
          const fallbackPredictions = riskZones.map(z => {
            const slopeNorm = Math.min(1, Math.max(0, ((z.slope_degrees || 30) - 3) / 69));
            const elevNorm = Math.min(1, Math.max(0, ((z.elevation_m || 500) - 50) / 2950));
            const lulcRisk = (z.land_use_code || 2) / 4;
            const soilRisk = (z.soil_code || 3) / 4;
            const spatialRisk = Math.exp(-(((z.latitude || 25.5) - 25.3) ** 2 / 2.0 + (((z.longitude || 91.8) - 91.7) ** 2 / 4.0)));
            const suscProb = Math.min(100, Math.max(5, (slopeNorm * 0.35 + soilRisk * 0.25 + lulcRisk * 0.20 + elevNorm * 0.10 + spatialRisk * 0.10) * 100));

            const rainNorm = (weather.current_rain_mm_hr || 20) / 150;
            const rain48Norm = (weather.rain_48h_mm || 80) / 600;
            const moistNorm = (weather.soil_moisture_pct || 60) / 100;
            const forecastNorm = (weather.forecast_severity || 1) / 3;
            const triggerScore = Math.min(1, Math.max(0, rain48Norm * 0.40 + moistNorm * 0.25 + rainNorm * 0.25 + forecastNorm * 0.10));
            const alertLevel = triggerScore >= 0.75 ? 3 : triggerScore >= 0.50 ? 2 : triggerScore >= 0.25 ? 1 : 0;

            const combinedScore = Math.round(suscProb * 0.40 + (alertLevel / 3.0 * 100.0) * 0.60);
            const level = combinedScore >= 75 ? "Critical" : combinedScore >= 55 ? "High" : combinedScore >= 35 ? "Moderate" : "Low";

            return {
              latitude: z.latitude,
              longitude: z.longitude,
              susc_prob: Math.round(suscProb),
              alert_level: alertLevel,
              combined_score: combinedScore,
              risk_level: level,
              status: `${level} (${combinedScore}%)`
            };
          });
          onUpdatePredictions(fallbackPredictions, weather);
        }
      }
    };

    runBatchML();
    return () => { isMounted = false; };
  }, [weather, riskZones]);

  // Auto Simulation Timer (fluctuates rainfall every 4 seconds)
  useEffect(() => {
    if (!isAutoSimulating) return;

    const interval = setInterval(() => {
      setWeather(prev => {
        // Random small fluctuation in rainfall to simulate live weather stream
        const deltaRain = (Math.random() - 0.48) * 8;
        const newRain = Math.max(0, Math.min(120, Math.round((prev.current_rain_mm_hr + deltaRain) * 10) / 10));
        const new48h = Math.max(0, Math.min(600, Math.round((prev.rain_48h_mm + deltaRain * 0.5) * 10) / 10));
        const newMoisture = Math.max(10, Math.min(100, Math.round(prev.soil_moisture_pct + (deltaRain > 0 ? 0.8 : -0.5))));
        const newForecast = newRain > 35 ? 3 : newRain > 15 ? 2 : newRain > 2 ? 1 : 0;

        return {
          ...prev,
          current_rain_mm_hr: newRain,
          rain_48h_mm: new48h,
          soil_moisture_pct: newMoisture,
          forecast_severity: newForecast,
          timestamp: new Date().toLocaleTimeString()
        };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoSimulating]);

  // Fetch real Open-Meteo Satellite Data
  const handleFetchSatellite = async () => {
    setLoading(true);
    setIsAutoSimulating(false);
    setIsLiveApi(true);
    try {
      const realData = await fetchRealTimeWeather(25.5788, 91.8933);
      setWeather(realData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CloudRain size={18} className="text-blue-300 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider">Live Rainfall & ML Trigger</h3>
        </div>
        <div className="flex items-center gap-1">
          {isAutoSimulating && (
            <span className="flex items-center gap-1 text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full border border-green-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
              Auto-Streaming
            </span>
          )}
          {isLiveApi && (
            <span className="flex items-center gap-1 text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/40">
              <Radio size={10} className="animate-pulse" />
              Open-Meteo Satellite
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Main Rain Gauge */}
        <div className="flex items-center justify-between bg-blue-50/70 p-3 rounded-lg border border-blue-100">
          <div>
            <span className="text-[11px] font-bold text-blue-900 uppercase block">Current Rain Intensity</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-blue-950 font-mono">{weather.current_rain_mm_hr}</span>
              <span className="text-xs text-blue-700 font-bold">mm/hr</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-500 block">48h Cumulative</span>
            <span className="text-sm font-bold text-gray-800 font-mono">{weather.rain_48h_mm} mm</span>
            <span className="text-[10px] text-gray-500 block mt-0.5">Soil Saturation: <b className="text-blue-700">{weather.soil_moisture_pct}%</b></span>
          </div>
        </div>

        {/* Dynamic Sliders for Real-Time Parameter Tweak */}
        <div className="space-y-3 pt-1">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600 font-medium">Rainfall Intensity</span>
              <span className="font-bold text-blue-700">{weather.current_rain_mm_hr} mm/h</span>
            </div>
            <input
              type="range"
              min="0"
              max="120"
              step="0.5"
              value={weather.current_rain_mm_hr}
              onChange={(e) => {
                setIsAutoSimulating(false);
                setWeather({ ...weather, current_rain_mm_hr: parseFloat(e.target.value) });
              }}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600 font-medium">48h Antecedent Rain</span>
              <span className="font-bold text-blue-700">{weather.rain_48h_mm} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="1"
              value={weather.rain_48h_mm}
              onChange={(e) => {
                setIsAutoSimulating(false);
                setWeather({ ...weather, rain_48h_mm: parseFloat(e.target.value) });
              }}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600 font-medium">Soil Moisture</span>
              <span className="font-bold text-blue-700">{weather.soil_moisture_pct}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="1"
              value={weather.soil_moisture_pct}
              onChange={(e) => {
                setIsAutoSimulating(false);
                setWeather({ ...weather, soil_moisture_pct: parseInt(e.target.value) });
              }}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => setIsAutoSimulating(!isAutoSimulating)}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-md transition-colors ${
              isAutoSimulating
                ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isAutoSimulating ? <><Pause size={14} /> Pause Stream</> : <><Play size={14} /> Auto-Stream Rain</>}
          </button>

          <button
            onClick={handleFetchSatellite}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw size={14} className="animate-spin text-blue-600" />
            ) : (
              <><Zap size={14} className="text-amber-500" /> Fetch Satellite</>
            )}
          </button>
        </div>

        <div className="text-[10px] text-gray-400 text-center flex items-center justify-between">
          <span>Target: {weather.location}</span>
          <span>Updated: {weather.timestamp}</span>
        </div>
      </div>
    </div>
  );
}
