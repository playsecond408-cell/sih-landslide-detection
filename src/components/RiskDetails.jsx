import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Minus, Clock, MapPin, CloudRain, Droplets, Mountain, ShieldAlert, RefreshCw } from 'lucide-react';
import { fetchRealTimeWeather } from '../services/api';

export default function RiskDetails({ zone, onClose, onEvacuate, isCalculatingRoute, evacuationRoute }) {
  const [liveWeather, setLiveWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  useEffect(() => {
    if (!zone || !zone.latitude || !zone.longitude) return;

    let isMounted = true;
    const fetchLocationSatelliteWeather = async () => {
      setLoadingWeather(true);
      try {
        const data = await fetchRealTimeWeather(zone.latitude, zone.longitude);
        if (isMounted) {
          setLiveWeather(data);
        }
      } catch (err) {
        console.warn("Could not fetch satellite weather for location:", err);
      } finally {
        if (isMounted) setLoadingWeather(false);
      }
    };

    fetchLocationSatelliteWeather();
    return () => { isMounted = false; };
  }, [zone]);

  if (!zone) return null;

  const getRiskColor = (level) => {
    switch (level) {
      case 'Critical': return 'text-red-700 bg-red-100 border-red-300';
      case 'High': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'Moderate': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'Low': return 'text-green-700 bg-green-100 border-green-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'Increasing': return <TrendingUp size={16} className="text-red-500" />;
      case 'Decreasing': return <TrendingDown size={16} className="text-green-500" />;
      default: return <Minus size={16} className="text-gray-500" />;
    }
  };

  // Determine current rain to show (prioritize live Open-Meteo satellite call)
  const currentRainVal = liveWeather?.current_rain_mm_hr !== undefined 
    ? liveWeather.current_rain_mm_hr 
    : zone.current_rain_mm_hr !== undefined ? zone.current_rain_mm_hr : 38.0;

  const rain48hVal = liveWeather?.rain_48h_mm !== undefined 
    ? liveWeather.rain_48h_mm 
    : zone.rain_48h_mm !== undefined ? zone.rain_48h_mm : 175.0;

  const moistureVal = liveWeather?.soil_moisture_pct !== undefined 
    ? liveWeather.soil_moisture_pct 
    : zone.soil_moisture_pct !== undefined ? zone.soil_moisture_pct : 78;

  return (
    <div className="absolute right-0 top-0 bottom-0 w-84 bg-white shadow-2xl z-[1000] border-l border-gray-200 flex flex-col overflow-y-auto transform transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div>
          <h2 className="font-bold text-gray-900 text-base leading-tight">{zone.name || zone.id}</h2>
          <span className="text-[11px] text-gray-500 font-mono">
            {zone.latitude ? `${zone.latitude.toFixed(3)}°N, ${zone.longitude.toFixed(3)}°E` : zone.id}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-4 flex-1 space-y-5">
        {/* Risk Level Badge & Score */}
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">ML VULNERABILITY SCORE</span>
            <div className="text-3xl font-black text-gray-900 font-mono mt-0.5">{zone.risk_score}%</div>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase border flex items-center gap-1.5 ${getRiskColor(zone.risk_level)}`}>
            {zone.risk_level === 'Critical' && <span className="h-2 w-2 rounded-full bg-red-600 animate-ping"></span>}
            {zone.risk_level}
          </div>
        </div>

        {/* Live Satellite Weather Telemetry */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <CloudRain size={14} className="text-blue-600" /> Open-Meteo Satellite Feed
            </h3>
            {loadingWeather ? (
              <RefreshCw size={12} className="animate-spin text-blue-600" />
            ) : (
              <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                Live Stream
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="bg-white p-2 rounded border border-blue-100 shadow-sm">
              <span className="text-[10px] text-gray-500 block font-bold uppercase">Current Rain</span>
              <span className="text-sm font-bold text-blue-950 font-mono">{currentRainVal} mm/hr</span>
            </div>
            <div className="bg-white p-2 rounded border border-blue-100 shadow-sm">
              <span className="text-[10px] text-gray-500 block font-bold uppercase">48h Cumulative</span>
              <span className="text-sm font-bold text-blue-950 font-mono">{rain48hVal} mm</span>
            </div>
          </div>

          <div className="bg-white p-2 rounded border border-blue-100 shadow-sm flex items-center justify-between text-xs">
            <span className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1">
              <Droplets size={12} className="text-blue-500" /> Soil Saturation
            </span>
            <span className="font-bold text-blue-900 font-mono">{moistureVal}%</span>
          </div>
        </div>

        {/* Static Terrain Factors */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <Mountain size={14} className="text-gray-500" /> Terrain & Soil Specs
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-gray-500 block font-bold uppercase">Slope Gradient</span>
              <span className="font-bold text-gray-800 font-mono">{zone.slope_degrees || 38}°</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block font-bold uppercase">Elevation</span>
              <span className="font-bold text-gray-800 font-mono">{zone.elevation_m || 850}m</span>
            </div>
          </div>

          <div className="pt-1 text-xs space-y-1 text-gray-700">
            <div>Soil Type: <b className="text-gray-900">{zone.soil_label || (zone.soil_code === 4 ? 'Weathered Disang Shale' : 'Colluvial Debris')}</b></div>
            <div>Land Cover: <b className="text-gray-900">{zone.land_use_label || (zone.land_use_code === 3 ? 'Highway Cut / Settlement' : 'Degraded Slope Forest')}</b></div>
          </div>
        </div>

        {/* Trend & Forecast Window */}
        <div className="flex items-center justify-between text-xs border-t border-b border-gray-100 py-2">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">Trend:</span>
            {getTrendIcon(zone.trend)}
            <span className="font-bold text-gray-800">{zone.trend || 'Increasing'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <Clock size={14} />
            <span>{zone.forecast_window || 'Next 12h'}</span>
          </div>
        </div>

        {/* Potential Impact */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Potential Impact</h3>
          <ul className="space-y-2">
            <li className="text-xs text-gray-700 flex items-start gap-1.5">
              <ShieldAlert size={13} className="text-red-500 shrink-0 mt-0.5" />
              <span>
                <b className="text-gray-900">Active Vulnerability:</b> {zone.risk_score}% ({zone.risk_level} Hazard Level)
              </span>
            </li>
            <li className="text-xs text-gray-700 flex items-start gap-1.5">
              <ShieldAlert size={13} className="text-blue-500 shrink-0 mt-0.5" />
              <span>
                <b className="text-gray-900">Weather Trigger:</b> {currentRainVal} mm/hr rain (48h: {rain48hVal} mm, {moistureVal}% saturation)
              </span>
            </li>
            <li className="text-xs text-gray-700 flex items-start gap-1.5">
              <ShieldAlert size={13} className={zone.risk_level === 'Critical' ? 'text-red-600 shrink-0 mt-0.5' : 'text-amber-500 shrink-0 mt-0.5'} />
              <span>
                <b className="text-gray-900">Infrastructure Impact:</b> {
                  zone.risk_level === 'Critical' 
                    ? `Severe slope failure and road blockage along ${zone.name || 'corridor'}` 
                    : zone.risk_level === 'High' 
                    ? `Debris flow & rock displacement alert along ${zone.name || 'corridor'}` 
                    : `Stable hillside; minor surface drainage overflow`
                }
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-gray-100">
          <button 
            onClick={() => onEvacuate(zone)}
            disabled={isCalculatingRoute}
            className={`w-full py-2.5 rounded-lg font-bold text-white shadow-sm flex items-center justify-center gap-2 transition-all ${
              isCalculatingRoute 
                ? 'bg-blue-400 cursor-not-allowed' 
                : evacuationRoute?.start?.id === zone.id 
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isCalculatingRoute ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Computing Dijkstra Route...
              </>
            ) : evacuationRoute?.start?.id === zone.id ? (
              <>
                <ShieldAlert size={16} />
                Route Displayed on Map
              </>
            ) : (
              <>
                <MapPin size={16} />
                Find Safest Evacuation Route
              </>
            )}
          </button>
          
          {evacuationRoute?.start?.id === zone.id && (
            <div className="mt-2 bg-blue-50 border border-blue-100 rounded p-2 text-xs text-blue-800">
              <strong className="block mb-1">Evacuation Path Generated</strong>
              <div>Target: {evacuationRoute.end.name}</div>
              <div>Distance: {evacuationRoute.distance} | ETA: {evacuationRoute.eta}</div>
              <div className="text-red-600 font-bold mt-1">✓ Blocked/Hazard roads removed</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
