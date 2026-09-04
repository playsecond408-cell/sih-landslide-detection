import React, { useState, useEffect } from 'react';
import { CloudRain, MapPin, Droplets, RefreshCw } from 'lucide-react';
import { fetchRealTimeWeather } from '../services/api';

export default function WeatherSummary({ weather, selectedZone }) {
  const [liveSatelliteData, setLiveSatelliteData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedZone || !selectedZone.latitude || !selectedZone.longitude) return;

    let isMounted = true;
    const fetchWeatherForSelectedLocation = async () => {
      setLoading(true);
      try {
        const data = await fetchRealTimeWeather(selectedZone.latitude, selectedZone.longitude);
        if (isMounted) {
          setLiveSatelliteData(data);
        }
      } catch (err) {
        console.warn("Could not fetch Open-Meteo satellite weather:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWeatherForSelectedLocation();
    return () => { isMounted = false; };
  }, [selectedZone]);

  if (!weather && !selectedZone) return null;

  const locationName = selectedZone?.name || weather?.location || "Guwahati-Shillong Corridor";
  const currentRain = liveSatelliteData?.current_rain_mm_hr !== undefined 
    ? `${liveSatelliteData.current_rain_mm_hr} mm/hr` 
    : (selectedZone?.current_rain_mm_hr !== undefined ? `${selectedZone.current_rain_mm_hr} mm/hr` : weather?.current_rainfall || "38.0 mm/hr");
    
  const rain48h = liveSatelliteData?.rain_48h_mm !== undefined 
    ? `${liveSatelliteData.rain_48h_mm} mm` 
    : (selectedZone?.rain_48h_mm !== undefined ? `${selectedZone.rain_48h_mm} mm` : weather?.rainfall_24h || "175 mm");

  const soilMoisture = liveSatelliteData?.soil_moisture_pct !== undefined 
    ? `${liveSatelliteData.soil_moisture_pct}%` 
    : (selectedZone?.soil_moisture_pct !== undefined ? `${selectedZone.soil_moisture_pct}%` : "78%");

  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-4 overflow-hidden">
      <div className="bg-blue-50/80 border-b border-blue-100 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CloudRain size={16} className="text-blue-600" />
          <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider">Satellite Weather Telemetry</h3>
        </div>
        {loading ? (
          <RefreshCw size={12} className="animate-spin text-blue-600" />
        ) : (
          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
            Open-Meteo Satellite
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-700 font-bold border-b border-gray-100 pb-2">
          <MapPin size={14} className="text-red-500 shrink-0" />
          <span className="truncate">{locationName}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 p-2 rounded border border-gray-200">
            <span className="text-[10px] font-bold text-gray-500 uppercase block">Current Rain</span>
            <span className="text-sm font-bold text-blue-700 font-mono">{currentRain}</span>
          </div>

          <div className="bg-gray-50 p-2 rounded border border-gray-200">
            <span className="text-[10px] font-bold text-gray-500 uppercase block">48h Accumulation</span>
            <span className="text-sm font-bold text-blue-900 font-mono">{rain48h}</span>
          </div>
        </div>

        <div className="bg-gray-50 p-2 rounded border border-gray-200 flex items-center justify-between text-xs">
          <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
            <Droplets size={12} className="text-blue-500" /> Soil Saturation
          </span>
          <span className="font-bold text-gray-800 font-mono">{soilMoisture}</span>
        </div>
      </div>
    </div>
  );
}
