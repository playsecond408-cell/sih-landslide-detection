import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import HeatmapMap from '../components/HeatmapMap';
import RiskDetails from '../components/RiskDetails';
import { fetchSusceptibilityDataset } from '../services/api';
import { RISK_ZONES } from '../data/mockData';
import { Layers, MapPin, Sliders, AlertTriangle } from 'lucide-react';

const REGION_PRESETS = [
  { name: "Entire North-East Region", coords: [25.923, 92.5], zoom: 7 },
  { name: "Meghalaya (Shillong / Sohra)", coords: [25.467, 91.750], zoom: 9 },
  { name: "Sikkim (Gangtok / Mangan)", coords: [27.400, 88.550], zoom: 9 },
  { name: "Nagaland (Kohima Pass)", coords: [25.674, 94.108], zoom: 9 },
  { name: "Mizoram (Aizawl Slopes)", coords: [23.738, 92.712], zoom: 9 },
  { name: "Assam (Barak / Brahmaputra)", coords: [25.500, 92.800], zoom: 8 },
  { name: "Arunachal (Itanagar / Tawang)", coords: [27.085, 93.605], zoom: 9 },
];

export default function HeatmapExplorer() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);

  // Simple Controls
  const [radius, setRadius] = useState(25);
  const [intensity, setIntensity] = useState(1.0);
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState(REGION_PRESETS[0]);
  const [mapCenter, setMapCenter] = useState(null);

  useEffect(() => {
    const loadDataset = async () => {
      setLoading(true);
      try {
        const livePts = await fetchSusceptibilityDataset(180);
        if (livePts && livePts.length > 0) {
          setPoints(livePts);
        } else {
          // Map actual NER risk zones
          const mapped = RISK_ZONES.map(z => ({
            latitude: z.latitude,
            longitude: z.longitude,
            susceptibility_score: z.risk_score / 100,
            risk_score: z.risk_score,
            slope_degrees: z.slope_degrees || 35,
            elevation_m: z.elevation_m || 1200,
            soil_label: z.soil_code === 4 ? 'Shale' : 'Colluvial',
            name: z.name,
            id: z.id,
            risk_level: z.risk_level,
            current_rain_mm_hr: 32.5,
            rain_48h_mm: 145.0,
            soil_moisture_pct: 78
          }));
          setPoints(mapped);
        }
      } catch (err) {
        console.warn("Could not load heatmap points:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDataset();
  }, []);

  const handleRegionChange = (preset) => {
    setSelectedRegion(preset);
    setMapCenter(preset.coords);
  };

  const handleZoneSelect = (pt) => {
    const score = Math.round((pt.susceptibility_score || (pt.risk_score/100) || 0.5) * 100);
    const level = score >= 75 ? "Critical" : score >= 55 ? "High" : score >= 35 ? "Moderate" : "Low";
    setSelectedZone({
      id: pt.id || `SITE-${Math.round(pt.latitude*100)}`,
      name: pt.name || `Model Site (${pt.latitude.toFixed(2)}°, ${pt.longitude.toFixed(2)}°)`,
      latitude: pt.latitude,
      longitude: pt.longitude,
      risk_score: score,
      risk_level: level,
      slope_degrees: pt.slope_degrees || 38,
      elevation_m: pt.elevation_m || 850,
      soil_label: pt.soil_label || 'Colluvial / Weathered Shale',
      land_use_label: 'Degraded Hillside Forest',
      current_rain_mm_hr: pt.current_rain_mm_hr !== undefined ? pt.current_rain_mm_hr : 32.5,
      rain_48h_mm: pt.rain_48h_mm !== undefined ? pt.rain_48h_mm : 145.0,
      soil_moisture_pct: pt.soil_moisture_pct !== undefined ? pt.soil_moisture_pct : 78,
      trend: 'Increasing',
      forecast_window: 'Next 12h'
    });
  };

  const filteredCount = points.filter(pt => ((pt.susceptibility_score || (pt.risk_score/100) || 0.5) * 100) >= minScoreFilter).length;
  const criticalCount = points.filter(pt => ((pt.susceptibility_score || (pt.risk_score/100) || 0.5) * 100) >= 75).length;
  const highCount = points.filter(pt => ((pt.susceptibility_score || (pt.risk_score/100) || 0.5) * 100) >= 55 && ((pt.susceptibility_score || (pt.risk_score/100) || 0.5) * 100) < 75).length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50 text-gray-900">
      <Header />

      {/* Top Controls Bar (Clean Light GIS Style) */}
      <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between z-10 text-xs shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-gray-800">
            <Layers size={18} className="text-blue-600" />
            <span className="text-sm uppercase tracking-wider">Topographical Landslide Heatmap</span>
          </div>

          <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
            <span className="text-gray-500 font-bold uppercase">Region:</span>
            <select
              className="bg-gray-50 border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              value={selectedRegion.name}
              onChange={(e) => {
                const preset = REGION_PRESETS.find(p => p.name === e.target.value);
                if (preset) handleRegionChange(preset);
              }}
            >
              {REGION_PRESETS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          </div>
        </div>

        {/* Minimal Controls */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <label className="text-gray-500 font-bold uppercase">Heat Radius:</label>
            <input
              type="range"
              min="15"
              max="45"
              value={radius}
              onChange={e => setRadius(+e.target.value)}
              className="w-24 accent-blue-600 cursor-pointer"
            />
            <span className="font-mono w-6 text-gray-700 font-bold">{radius}px</span>
          </div>

          <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
            <label className="text-gray-500 font-bold uppercase">Filter Level:</label>
            <select
              className="bg-gray-50 border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-800 font-medium"
              value={minScoreFilter}
              onChange={e => setMinScoreFilter(+e.target.value)}
            >
              <option value={0}>All Evaluated Sites (0%+)</option>
              <option value={35}>Moderate Risk (35%+)</option>
              <option value={55}>High Risk Only (55%+)</option>
              <option value={75}>Critical Risk Only (75%+)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Map & Sidebar Area */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Terrain Heatmap Container */}
        <div className="flex-1 h-full relative z-0">
          <HeatmapMap
            points={points}
            radius={radius}
            intensity={intensity}
            minScoreFilter={minScoreFilter}
            mapCenter={mapCenter}
            onZoneSelect={handleZoneSelect}
          />

          {/* Details Drawer */}
          <RiskDetails zone={selectedZone} onClose={() => setSelectedZone(null)} />

          {/* Clean GIS Legend Overlay */}
          <div className="absolute bottom-6 right-6 z-[900] bg-white border border-gray-200 rounded-md p-3 shadow-lg text-xs w-60">
            <h4 className="font-bold text-gray-700 uppercase tracking-wider mb-2 text-[11px]">
              GIS Susceptibility Scale
            </h4>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-sm bg-red-600 inline-block"></span>
                <span className="font-medium text-gray-800">Critical Risk (&gt;75%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-sm bg-orange-500 inline-block"></span>
                <span className="font-medium text-gray-800">High Risk (55% - 75%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-sm bg-yellow-500 inline-block"></span>
                <span className="font-medium text-gray-800">Moderate Risk (35% - 55%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-sm bg-green-600 inline-block"></span>
                <span className="font-medium text-gray-800">Low Risk (&lt;35%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Summary Drawer */}
        <div className="w-80 bg-white border-l border-gray-200 p-4 flex flex-col z-10 overflow-y-auto space-y-4 shadow-sm">
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">PREDICTED SITES EVALUATED</span>
            <div className="text-2xl font-bold text-gray-900 font-mono mt-0.5">{filteredCount} Locations</div>
            <span className="text-[11px] text-gray-500 block mt-0.5">Topographical dataset & ML predictions</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <span className="text-[10px] font-bold text-red-600 uppercase block">Critical Zones</span>
              <span className="text-xl font-bold text-red-700 font-mono">{criticalCount}</span>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
              <span className="text-[10px] font-bold text-orange-600 uppercase block">High Risk Zones</span>
              <span className="text-xl font-bold text-orange-700 font-mono">{highCount}</span>
            </div>
          </div>

          {/* Known Predicted Landslide Clusters in North-East */}
          <div className="border border-gray-200 rounded-md p-3 space-y-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <MapPin size={14} className="text-red-500" /> High Vulnerability Clusters
            </h4>

            <div className="space-y-2 text-xs">
              <div 
                onClick={() => setMapCenter([25.282, 91.722])}
                className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-2 rounded border border-gray-200 cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-bold text-gray-900 block">Cherrapunji Precipice</span>
                  <span className="text-[10px] text-gray-500">Meghalaya • Slope 52°</span>
                </div>
                <span className="font-bold text-red-600 font-mono bg-red-100 px-2 py-0.5 rounded text-[11px]">91%</span>
              </div>

              <div 
                onClick={() => setMapCenter([27.331, 88.613])}
                className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-2 rounded border border-gray-200 cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-bold text-gray-900 block">Gangtok-Nathula Belt</span>
                  <span className="text-[10px] text-gray-500">Sikkim • Slope 48°</span>
                </div>
                <span className="font-bold text-red-600 font-mono bg-red-100 px-2 py-0.5 rounded text-[11px]">89%</span>
              </div>

              <div 
                onClick={() => setMapCenter([25.674, 94.108])}
                className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-2 rounded border border-gray-200 cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-bold text-gray-900 block">Kohima Bypass</span>
                  <span className="text-[10px] text-gray-500">Nagaland • Slope 36°</span>
                </div>
                <span className="font-bold text-orange-600 font-mono bg-orange-100 px-2 py-0.5 rounded text-[11px]">75%</span>
              </div>

              <div 
                onClick={() => setMapCenter([23.738, 92.712])}
                className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-2 rounded border border-gray-200 cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-bold text-gray-900 block">Aizawl North Ridge</span>
                  <span className="text-[10px] text-gray-500">Mizoram • Slope 34°</span>
                </div>
                <span className="font-bold text-orange-600 font-mono bg-orange-100 px-2 py-0.5 rounded text-[11px]">78%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-[11px] text-gray-600">
            <span className="font-bold text-gray-800 block mb-1">🗺️ GIS Topography Base Layer:</span>
            Topographical contour map displaying elevation, ridge lines, and slope gradients calibrated with ISRO CartoDEM data.
          </div>
        </div>
      </div>
    </div>
  );
}
