import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Polyline, Marker, Popup, LayersControl, LayerGroup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to smoothly fly map to focused zone
function MapFlyController({ selectedZone }) {
  const map = useMap();
  useEffect(() => {
    if (selectedZone && selectedZone.latitude && selectedZone.longitude) {
      map.flyTo([selectedZone.latitude, selectedZone.longitude], 11, { duration: 1.5 });
    }
  }, [selectedZone, map]);
  return null;
}

// Custom icon for community observations
const createCustomIcon = (emoji) => {
  return L.divIcon({
    html: `<div style="font-size: 20px; background: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">${emoji}</div>`,
    className: 'custom-emoji-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const createReliefIcon = (status) => {
  const isDanger = status === 'At Risk' || status === 'Full';
  const bgColor = isDanger ? '#ef4444' : '#22c55e'; // red vs green
  return L.divIcon({
    html: `<div style="font-size: 20px; background: ${bgColor}; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.4); border: 2px solid white; color: white;">🏥</div>`,
    className: 'custom-relief-icon',
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
};

const getRiskColor = (level) => {
  switch (level) {
    case 'Critical': return '#ef4444'; // red-500
    case 'High': return '#f97316'; // orange-500
    case 'Moderate': return '#eab308'; // yellow-500
    case 'Low': return '#22c55e'; // green-500
    default: return '#94a3b8'; // slate-400
  }
};

const getRoadColor = (status) => {
  switch (status) {
    case 'Blocked': return '#ef4444';
    case 'At Risk': return '#eab308';
    case 'Open': return '#22c55e';
    default: return '#94a3b8';
  }
};

export default function RiskMap({ riskZones, roadSegments, communityObservations, reliefCenters = [], evacuationRoute = null, selectedZone, onZoneClick }) {
  const center = [25.923, 92.5];
  
  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={8} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <MapFlyController selectedZone={selectedZone} />

        <LayersControl position="bottomleft">
          <LayersControl.BaseLayer checked name="OpenStreetMap Standard">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="CartoDB Positron (Minimal)">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="Landslide Risk Zones">
            <LayerGroup>
              {riskZones.map(zone => {
                const isSelected = selectedZone && selectedZone.id === zone.id;
                const dynamicRadius = zone.risk_level === 'Critical' 
                  ? 5500 
                  : zone.risk_level === 'High' 
                  ? 4200 
                  : zone.risk_level === 'Moderate' 
                  ? 3000 
                  : 2000;

                return (
                  <Circle
                    key={`${zone.id}-${zone.risk_level}-${zone.risk_score}`}
                    center={[zone.latitude, zone.longitude]}
                    pathOptions={{
                      color: getRiskColor(zone.risk_level),
                      fillColor: getRiskColor(zone.risk_level),
                      fillOpacity: isSelected ? 0.65 : zone.risk_level === 'Critical' ? 0.45 : 0.30,
                      weight: isSelected ? 4 : zone.risk_level === 'Critical' ? 3 : 1.5,
                      dashArray: zone.risk_level === 'Critical' ? '6, 6' : undefined
                    }}
                    radius={dynamicRadius}
                    eventHandlers={{
                      click: () => onZoneClick(zone),
                    }}
                  >
                    <Popup>
                      <div className="text-sm font-sans p-1">
                        <strong className="block text-gray-900 font-bold mb-1">{zone.name || zone.id}</strong>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div>Risk Level: <b style={{color: getRiskColor(zone.risk_level)}}>{zone.risk_level}</b></div>
                          <div>Risk Score: <b>{zone.risk_score}%</b></div>
                          <div>Slope: <b>{zone.slope_degrees || 32}°</b></div>
                          <div>Elevation: <b>{zone.elevation_m || 750}m</b></div>
                        </div>
                        <button 
                          onClick={() => onZoneClick(zone)}
                          className="mt-2.5 w-full text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 py-1.5 rounded transition-colors"
                        >
                          View Live Data Analysis
                        </button>
                      </div>
                    </Popup>
                  </Circle>
                );
              })}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Road Infrastructure">
            <LayerGroup>
              {roadSegments.map(road => (
                <Polyline
                  key={road.id}
                  positions={road.coordinates}
                  pathOptions={{
                    color: getRoadColor(road.status),
                    weight: 4,
                    opacity: 0.8
                  }}
                >
                  <Popup>
                    <div className="text-sm font-sans">
                      <strong className="block mb-1">ROAD {road.id}</strong>
                      <span className="text-gray-600 block">Status: <b style={{color: getRoadColor(road.status)}}>{road.status.toUpperCase()}</b></span>
                      <span className="text-gray-600 block">Risk: {road.risk_score}%</span>
                      <span className="text-gray-600 block mt-1">Impact: {road.affected_villages} villages</span>
                    </div>
                  </Popup>
                </Polyline>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay name="Community Observations">
            <LayerGroup>
              {communityObservations.map(obs => (
                <Marker
                  key={obs.id}
                  position={[obs.latitude, obs.longitude]}
                  icon={createCustomIcon(obs.icon)}
                >
                  <Popup>
                    <div className="text-sm font-sans">
                      <strong className="block mb-1">Observation</strong>
                      <span className="text-gray-600 block">Type: {obs.type}</span>
                      <span className="text-gray-600 block">Time: {obs.time}</span>
                      <span className="text-gray-600 block">Status: {obs.status}</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Relief Centers (Safe Zones)">
            <LayerGroup>
              {reliefCenters.map(rc => (
                <Marker
                  key={rc.id}
                  position={[rc.latitude, rc.longitude]}
                  icon={createReliefIcon(rc.status)}
                >
                  <Popup>
                    <div className="text-sm font-sans p-1">
                      <strong className={`block font-bold mb-1 ${rc.status === 'Secure' ? 'text-green-700' : 'text-red-700'}`}>{rc.name}</strong>
                      <span className="text-gray-600 block text-xs">Official Evacuation Site</span>
                      <span className="text-gray-600 block mt-1">Capacity: <b>{rc.capacity} people</b></span>
                      <span className="text-gray-600 block">Status: <b className={rc.status === 'Secure' ? 'text-green-600' : 'text-red-600'}>{rc.status || 'Secure'}</b></span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          {evacuationRoute && (
            <LayersControl.Overlay checked name="Active Evacuation Route">
              <LayerGroup>
                <Polyline
                  positions={evacuationRoute.path}
                  pathOptions={{
                    color: '#3b82f6', // blue-500
                    weight: 6,
                    opacity: 0.9,
                    dashArray: '10, 10'
                  }}
                >
                  <Popup>
                    <div className="text-sm font-sans">
                      <strong className="block mb-1 text-blue-700">Evacuation Route</strong>
                      <span className="text-gray-600 block text-xs mb-2">Dijkstra OSMap Algorithm</span>
                      <span className="text-gray-600 block">Distance: <b>{evacuationRoute.distance}</b></span>
                      <span className="text-gray-600 block">ETA: <b>{evacuationRoute.eta}</b></span>
                      <span className="text-red-600 block mt-1 font-bold">⚠️ Hazards Avoided!</span>
                      <span className="text-gray-600 block text-xs mt-0.5">({evacuationRoute.blocked_edges_removed || 0} blocked edges removed)</span>
                    </div>
                  </Popup>
                </Polyline>
              </LayerGroup>
            </LayersControl.Overlay>
          )}

        </LayersControl>
      </MapContainer>
    </div>
  );
}
