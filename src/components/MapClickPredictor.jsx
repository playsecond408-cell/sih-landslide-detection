import React, { useState } from 'react';
import { useMapEvents, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { predictSusceptibility, predictEarlyWarning } from '../services/api';

// Pulsing marker for the clicked point
const clickedIcon = L.divIcon({
  html: `<div style="background-color: #6366f1; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(99,102,241,0.7); animation: pulse 1.5s infinite;"></div>`,
  className: 'clicked-marker',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const LULC_OPTIONS = [
  { value: 0, label: 'Dense Forest' },
  { value: 1, label: 'Agriculture' },
  { value: 2, label: 'Degraded Forest' },
  { value: 3, label: 'Urban' },
  { value: 4, label: 'Barren' },
];

const SOIL_OPTIONS = [
  { value: 0, label: 'Granite/Gneiss' },
  { value: 1, label: 'Laterite' },
  { value: 2, label: 'Alluvial' },
  { value: 3, label: 'Colluvial' },
  { value: 4, label: 'Shale' },
];

const FORECAST_OPTIONS = [
  { value: 0, label: 'Clear' },
  { value: 1, label: 'Light Rain' },
  { value: 2, label: 'Heavy Rain' },
  { value: 3, label: 'Extreme Storm' },
];

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function MapClickPredictor({ onPrediction }) {
  const [clickedPoint, setClickedPoint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [warningResult, setWarningResult] = useState(null);
  const [error, setError] = useState(null);

  // Terrain form values (user can adjust before predicting)
  const [terrain, setTerrain] = useState({
    slope_degrees: 35,
    elevation_m: 800,
    land_use_code: 2,
    soil_code: 3,
  });

  // Weather form values
  const [weather, setWeather] = useState({
    current_rain_mm_hr: 25,
    rain_48h_mm: 120,
    soil_moisture_pct: 65,
    forecast_severity: 2,
  });

  const handleMapClick = (latlng) => {
    setClickedPoint(latlng);
    setResult(null);
    setWarningResult(null);
    setError(null);
  };

  const runPrediction = async () => {
    if (!clickedPoint) return;
    setLoading(true);
    setError(null);

    try {
      const [suscResult, warnResult] = await Promise.all([
        predictSusceptibility(clickedPoint.lat, clickedPoint.lng, terrain),
        predictEarlyWarning(clickedPoint.lat, clickedPoint.lng, weather),
      ]);
      setResult(suscResult);
      setWarningResult(warnResult);
      if (onPrediction) onPrediction({ susceptibility: suscResult, warning: warnResult });
    } catch (err) {
      // Fallback calculation using calibrated mathematical edge formulas
      const slopeNorm = Math.min(1, Math.max(0, (terrain.slope_degrees - 3) / 69));
      const elevNorm = Math.min(1, Math.max(0, (terrain.elevation_m - 50) / 2950));
      const lulcRisk = terrain.land_use_code / 4;
      const soilRisk = terrain.soil_code / 4;
      const spatialRisk = Math.exp(-((clickedPoint.lat - 25.3) ** 2 / 2.0 + (clickedPoint.lng - 91.7) ** 2 / 4.0));
      const suscScore = Math.min(100, Math.max(5, Math.round((slopeNorm * 0.35 + soilRisk * 0.25 + lulcRisk * 0.20 + elevNorm * 0.10 + spatialRisk * 0.10) * 100)));
      const suscLabel = suscScore >= 75 ? "Critical" : suscScore >= 55 ? "High" : suscScore >= 35 ? "Moderate" : "Low";

      const rainNorm = weather.current_rain_mm_hr / 150;
      const rain48Norm = weather.rain_48h_mm / 600;
      const moistNorm = weather.soil_moisture_pct / 100;
      const forecastNorm = weather.forecast_severity / 3;
      const triggerScore = Math.min(1, Math.max(0, rain48Norm * 0.40 + moistNorm * 0.25 + rainNorm * 0.25 + forecastNorm * 0.10));
      const alertLevel = triggerScore >= 0.75 ? 3 : triggerScore >= 0.50 ? 2 : triggerScore >= 0.25 ? 1 : 0;
      const statusMap = {
        0: { status: "Safe", color: "#22c55e", action: "No immediate action required." },
        1: { status: "Watch", color: "#eab308", action: "Stay alert. Monitor conditions closely." },
        2: { status: "Warning", color: "#f97316", action: "Prepare for evacuation. Avoid slopes." },
        3: { status: "Critical", color: "#ef4444", action: "EVACUATE IMMEDIATELY. Do not delay." },
      };

      const fallbackSusc = {
        latitude: clickedPoint.lat,
        longitude: clickedPoint.lng,
        is_susceptible: suscScore > 55,
        risk_probability: suscScore,
        risk_label: suscLabel,
        message: `Point (${clickedPoint.lat.toFixed(3)}, ${clickedPoint.lng.toFixed(3)}) is ${suscLabel} risk (${suscScore}%) [Edge formula mode]`
      };
      const fallbackWarn = {
        latitude: clickedPoint.lat,
        longitude: clickedPoint.lng,
        alert_level: alertLevel,
        status: statusMap[alertLevel].status,
        color: statusMap[alertLevel].color,
        action: statusMap[alertLevel].action,
        message: `[${statusMap[alertLevel].status.toUpperCase()}] ${statusMap[alertLevel].action} [Edge formula mode]`
      };

      setResult(fallbackSusc);
      setWarningResult(fallbackWarn);
      if (onPrediction) onPrediction({ susceptibility: fallbackSusc, warning: fallbackWarn });
      setError('Live backend offline or waking up. Result computed via calibrated edge formula fallback.');
    } finally {
      setLoading(false);
    }
  };

  const riskColor = result ? (
    result.risk_probability >= 75 ? '#ef4444' :
    result.risk_probability >= 55 ? '#f97316' :
    result.risk_probability >= 35 ? '#facc15' : '#22c55e'
  ) : null;

  return (
    <>
      <MapClickHandler onMapClick={handleMapClick} />
      
      {clickedPoint && (
        <>
          <Marker position={clickedPoint} icon={clickedIcon}>
            <Popup>
              <div className="text-xs">
                <b>Selected Point</b><br />
                Lat: {clickedPoint.lat.toFixed(4)}<br />
                Lng: {clickedPoint.lng.toFixed(4)}
              </div>
            </Popup>
          </Marker>
          {result && (
            <Circle
              center={clickedPoint}
              radius={2000}
              pathOptions={{
                color: riskColor,
                fillColor: riskColor,
                fillOpacity: 0.3,
                weight: 2,
              }}
            />
          )}
        </>
      )}

      {/* Floating Prediction Panel */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-[80vh] overflow-y-auto">
        <div className="p-3 bg-indigo-600 text-white rounded-t-lg">
          <h3 className="font-bold text-sm">ML Prediction Engine</h3>
          <p className="text-xs text-indigo-200 mt-0.5">Click anywhere on the map to predict</p>
        </div>

        {clickedPoint ? (
          <div className="p-3 space-y-3">
            <div className="bg-gray-50 rounded p-2 text-xs">
              <span className="font-bold text-gray-500">SELECTED COORDINATES</span>
              <div className="font-mono text-gray-800 mt-1">
                {clickedPoint.lat.toFixed(5)}°N, {clickedPoint.lng.toFixed(5)}°E
              </div>
            </div>

            {/* Terrain Inputs */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase">Static Terrain</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold">Slope (°)</label>
                  <input type="number" className="w-full border rounded px-2 py-1 text-xs"
                    value={terrain.slope_degrees}
                    onChange={e => setTerrain({...terrain, slope_degrees: +e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold">Elevation (m)</label>
                  <input type="number" className="w-full border rounded px-2 py-1 text-xs"
                    value={terrain.elevation_m}
                    onChange={e => setTerrain({...terrain, elevation_m: +e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold">Land Use</label>
                  <select className="w-full border rounded px-1 py-1 text-xs"
                    value={terrain.land_use_code}
                    onChange={e => setTerrain({...terrain, land_use_code: +e.target.value})}
                  >
                    {LULC_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold">Soil Type</label>
                  <select className="w-full border rounded px-1 py-1 text-xs"
                    value={terrain.soil_code}
                    onChange={e => setTerrain({...terrain, soil_code: +e.target.value})}
                  >
                    {SOIL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Weather Inputs */}
            <div className="space-y-2 border-t pt-2">
              <span className="text-xs font-bold text-gray-500 uppercase">Live Weather</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold">Rain Now (mm/hr)</label>
                  <input type="number" className="w-full border rounded px-2 py-1 text-xs"
                    value={weather.current_rain_mm_hr}
                    onChange={e => setWeather({...weather, current_rain_mm_hr: +e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold">Rain 48h (mm)</label>
                  <input type="number" className="w-full border rounded px-2 py-1 text-xs"
                    value={weather.rain_48h_mm}
                    onChange={e => setWeather({...weather, rain_48h_mm: +e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold">Soil Moisture (%)</label>
                  <input type="number" className="w-full border rounded px-2 py-1 text-xs"
                    value={weather.soil_moisture_pct}
                    onChange={e => setWeather({...weather, soil_moisture_pct: +e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold">Forecast</label>
                  <select className="w-full border rounded px-1 py-1 text-xs"
                    value={weather.forecast_severity}
                    onChange={e => setWeather({...weather, forecast_severity: +e.target.value})}
                  >
                    {FORECAST_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={runPrediction}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> Running ML Models...</>
              ) : 'Run Both Predictions'}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">{error}</div>
            )}

            {/* Results */}
            {result && (
              <div className="border rounded-lg overflow-hidden">
                <div className="p-2 text-xs font-bold text-white" style={{ backgroundColor: riskColor }}>
                  MODEL 1: SUSCEPTIBILITY — {result.risk_label}
                </div>
                <div className="p-2 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Risk Probability</span>
                    <span className="font-bold">{result.risk_probability}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${result.risk_probability}%`, backgroundColor: riskColor }}></div>
                  </div>
                  <p className="text-gray-600 mt-1">{result.message}</p>
                </div>
              </div>
            )}

            {warningResult && (
              <div className="border rounded-lg overflow-hidden">
                <div className="p-2 text-xs font-bold text-white" style={{ backgroundColor: warningResult.color }}>
                  MODEL 2: EARLY WARNING — {warningResult.status}
                </div>
                <div className="p-2 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Alert Level</span>
                    <span className="font-bold">{warningResult.alert_level} / 3</span>
                  </div>
                  <p className="text-gray-600 font-medium mt-1">{warningResult.action}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-400 text-sm">
            Click on the map to select a point
          </div>
        )}
      </div>
    </>
  );
}
