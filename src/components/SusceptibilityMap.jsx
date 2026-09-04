import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, LayersControl, LayerGroup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapClickPredictor from './MapClickPredictor';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for historical landslides
const historicalIcon = L.divIcon({
  html: `<div style="background-color: #7f1d1d; border: 2px solid white; width: 14px; height: 14px; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
  className: 'historical-marker',
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

// Helper component to change view when location is searched
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 12, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

const getSusceptibilityColor = (level) => {
  switch (level) {
    case 'Very High': return '#ef4444'; // red-500
    case 'High': return '#f97316'; // orange-500
    case 'Moderate': return '#facc15'; // yellow-400
    case 'Low': return '#22c55e'; // green-500
    case 'Very Low': return '#3b82f6'; // blue-500
    default: return '#94a3b8'; // slate-400
  }
};

export default function SusceptibilityMap({ 
  zones, 
  historicalLandslides, 
  opacity, 
  mapCenter, 
  onZoneClick 
}) {
  const defaultCenter = [25.923, 92.5];
  
  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={mapCenter || defaultCenter} 
        zoom={8} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <MapUpdater center={mapCenter} zoom={mapCenter ? 12 : 8} />
        
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Terrain (OpenTopoMap)">
            <TileLayer
              attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              maxZoom={17}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite Imagery (Esri)">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="Landslide Susceptibility">
            <LayerGroup>
              {zones.map(zone => (
                <Circle
                  key={zone.id}
                  center={[zone.latitude, zone.longitude]}
                  pathOptions={{
                    color: getSusceptibilityColor(zone.susceptibilityLevel),
                    fillColor: getSusceptibilityColor(zone.susceptibilityLevel),
                    fillOpacity: opacity / 100, // controlled by slider
                    opacity: opacity > 0 ? 0.8 : 0,
                    weight: 1
                  }}
                  radius={zone.radius}
                  eventHandlers={{
                    click: () => onZoneClick(zone),
                  }}
                >
                  <Popup>
                    <div className="text-sm font-sans">
                      <strong className="block mb-1">{zone.id}</strong>
                      <span className="text-gray-600 block mb-1">
                        Level: <b style={{color: getSusceptibilityColor(zone.susceptibilityLevel)}}>{zone.susceptibilityLevel}</b>
                      </span>
                      <button 
                        onClick={() => onZoneClick(zone)}
                        className="w-full text-xs bg-gray-100 hover:bg-gray-200 py-1 rounded"
                      >
                        View Analysis
                      </button>
                    </div>
                  </Popup>
                </Circle>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay name="Historical Landslides">
            <LayerGroup>
              {historicalLandslides.map(ls => (
                <Marker
                  key={ls.id}
                  position={[ls.latitude, ls.longitude]}
                  icon={historicalIcon}
                >
                  <Popup>
                    <div className="text-sm font-sans">
                      <strong className="block mb-1 text-red-800">HISTORICAL LANDSLIDE</strong>
                      <span className="text-gray-700 block text-xs">Year: <b>{ls.year}</b></span>
                      <span className="text-gray-700 block text-xs">Trigger: {ls.trigger}</span>
                      <span className="text-gray-700 block text-xs">Severity: {ls.severity}</span>
                      <span className="text-gray-500 block text-[10px] mt-1">{ls.id}</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>

        {/* Live ML Prediction — click anywhere */}
        <MapClickPredictor />
      </MapContainer>
    </div>
  );
}
