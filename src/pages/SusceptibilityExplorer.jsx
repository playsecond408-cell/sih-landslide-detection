import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SusceptibilityMap from '../components/SusceptibilityMap';
import SusceptibilityLegend from '../components/SusceptibilityLegend';
import SusceptibilityDetails from '../components/SusceptibilityDetails';
import LocationSearch from '../components/LocationSearch';
import MapExport from '../components/MapExport';

import {
  getSusceptibilityZones,
  getHistoricalLandslides,
  fetchSusceptibilityDataset
} from '../services/api';

export default function SusceptibilityExplorer() {
  const [susceptibilityZones, setSusceptibilityZones] = useState([]);
  const [historicalLandslides, setHistoricalLandslides] = useState([]);
  
  const [opacity, setOpacity] = useState(60);
  const [mapCenter, setMapCenter] = useState(null); // will be used to zoom to searched location
  const [selectedZone, setSelectedZone] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const baseZones = getSusceptibilityZones();
      setHistoricalLandslides(getHistoricalLandslides());

      // Fetch live points from susceptibility_dataset.csv via FastAPI
      const datasetPoints = await fetchSusceptibilityDataset(60);
      if (datasetPoints && datasetPoints.length > 0) {
        const csvZones = datasetPoints.map((pt, idx) => {
          const score = Math.round(pt.susceptibility_score * 100);
          const level = score >= 75 ? "Very High" : score >= 55 ? "High" : score >= 35 ? "Moderate" : score >= 15 ? "Low" : "Very Low";
          return {
            id: `CSV-${idx + 1}`,
            name: `Data Point (${pt.latitude.toFixed(2)}°, ${pt.longitude.toFixed(2)}°)`,
            latitude: pt.latitude,
            longitude: pt.longitude,
            susceptibilityScore: score,
            susceptibilityLevel: level,
            slope: `${pt.slope_degrees}°`,
            soilType: pt.soil_label || "Mixed",
            elevation: `${pt.elevation_m} m`,
            drainage: "Variable",
            historicalEvents: pt.is_susceptible ? 1 : 0,
            contributors: [
              { name: "Slope", percentage: Math.min(100, Math.round(pt.slope_degrees * 1.5)) },
              { name: "Soil Condition", percentage: Math.round(pt.soil_code * 25) },
              { name: "Land Use", percentage: Math.round(pt.land_use_code * 25) },
            ],
            radius: 2500
          };
        });
        setSusceptibilityZones([...baseZones, ...csvZones]);
      } else {
        setSusceptibilityZones(baseZones);
      }
    };

    loadData();
  }, []);

  const handleZoneClick = (zone) => {
    setSelectedZone(zone);
  };

  const closeDetails = () => {
    setSelectedZone(null);
  };

  const handleLocationSelect = (location) => {
    setMapCenter(location.coords);
  };

  const resetView = () => {
    setMapCenter([25.923, 92.5]); // Default NER center
    setTimeout(() => setMapCenter(null), 100); // Clear to allow searching the same place again if needed, though usually not an issue if the map handles it.
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50">
      <Header />
      
      {/* Methodology Disclaimer Banner for Hackathon Context */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-center gap-2 z-20 shadow-sm relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span>
          <b>Hackathon Prototype Methodology:</b> The spatial data (slope, elevation, soil type) displayed here is <b>simulated</b> to match the physical properties of the NER terrain. In production, this layer integrates directly with the live ISRO Bhuvan/CartoDEM and GSI APIs.
        </span>
      </div>

      {/* Top minimal control bar specific to this explorer page */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-700 shadow-sm z-10 relative">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-500 uppercase">Layer:</span>
            <span>Landslide Susceptibility</span>
          </div>
          <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
            <span className="font-bold text-gray-500 uppercase">Model:</span>
            <span>Integrated Landslide Prediction Model</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Opacity Slider */}
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded border border-gray-200">
            <label htmlFor="opacity" className="font-bold text-gray-500 uppercase">Opacity:</label>
            <input 
              id="opacity"
              type="range" 
              min="0" 
              max="100" 
              value={opacity} 
              onChange={(e) => setOpacity(e.target.value)}
              className="w-24 accent-blue-600"
            />
            <span className="w-8 text-right font-mono">{opacity}%</span>
          </div>
          
          <LocationSearch onLocationSelect={handleLocationSelect} />
          
          <button 
            onClick={resetView}
            className="text-gray-600 hover:text-gray-900 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-100 transition-colors font-medium"
          >
            Reset View
          </button>
          
          <MapExport />
        </div>
      </div>

      <div className="flex-1 relative h-full bg-gray-900">
        {/* Full Screen Map Area (100% of remaining space) */}
        <SusceptibilityMap 
          zones={susceptibilityZones}
          historicalLandslides={historicalLandslides}
          opacity={opacity}
          mapCenter={mapCenter}
          onZoneClick={handleZoneClick}
        />
        
        <SusceptibilityLegend />
        
        {/* Details Drawer overlays the map */}
        <SusceptibilityDetails zone={selectedZone} onClose={closeDetails} />
      </div>
    </div>
  );
}
