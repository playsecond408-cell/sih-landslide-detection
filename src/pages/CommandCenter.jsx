import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SummaryBar from '../components/SummaryBar';
import RiskMap from '../components/RiskMap';
import RiskDetails from '../components/RiskDetails';
import AlertPanel from '../components/AlertPanel';
import LiveWeatherController from '../components/LiveWeatherController';
import WeatherSummary from '../components/WeatherSummary';
import PriorityLocations from '../components/PriorityLocations';
import MapExport from '../components/MapExport';
import LiveMonitoringPanel from '../components/LiveMonitoringPanel';

import {
  fetchLiveRiskZones,
  getRiskZones,
  getRoadStatus,
  getCommunityObservations,
  getAlerts,
  getReliefCenters,
  calculateEvacuationRoute
} from '../services/api';

export default function CommandCenter() {
  const [riskZones, setRiskZones] = useState([]);
  const [roadSegments, setRoadSegments] = useState([]);
  const [communityObservations, setCommunityObservations] = useState([]);
  const [reliefCenters, setReliefCenters] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ criticalZones: 0, highRiskZones: 0, roadsAtRisk: 0, activeAlerts: 0 });
  
  const [selectedZone, setSelectedZone] = useState(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showMonitoring, setShowMonitoring] = useState(false);
  const [evacuationRoute, setEvacuationRoute] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  useEffect(() => {
    // Initial live data load from Python FastAPI ML model backend
    const loadLiveBackendData = async () => {
      try {
        const liveZones = await fetchLiveRiskZones();
        setRiskZones(liveZones);
        
        const criticalCount = liveZones.filter(z => z.risk_level === 'Critical').length;
        const highCount = liveZones.filter(z => z.risk_level === 'High').length;
        const roads = getRoadStatus();
        const blockedRoads = roads.filter(r => r.status === 'Blocked' || r.status === 'At Risk').length;
        
        setRoadSegments(roads);
        setCommunityObservations(getCommunityObservations());
        setReliefCenters(getReliefCenters());
        setAlerts(getAlerts());
        setStats({
          criticalZones: criticalCount,
          highRiskZones: highCount,
          roadsAtRisk: blockedRoads,
          activeAlerts: getAlerts().length
        });
      } catch (err) {
        console.warn("FastAPI backend offline, loading fallback telemetry:", err);
        setRiskZones(getRiskZones());
      }
    };

    loadLiveBackendData();
  }, []);

  // Callback triggered automatically whenever LiveWeatherController receives new predictions from FastAPI
  const handleUpdatePredictions = (predictions, currentWeather) => {
    if (!riskZones || riskZones.length === 0) return;

    // Map FastAPI ML prediction back to risk zones
    const updatedZones = riskZones.map((zone, idx) => {
      const pred = predictions[idx] || predictions.find(p => Math.abs(p.latitude - zone.latitude) < 0.1);
      if (!pred) return zone;

      return {
        ...zone,
        risk_level: pred.risk_level || zone.risk_level,
        risk_score: pred.combined_score !== undefined ? pred.combined_score : zone.risk_score,
        lastMLStatus: pred.status || `${pred.risk_level} (${pred.combined_score}%)`
      };
    });

    setRiskZones(updatedZones);

    // Automatically recalculate Summary Statistics based on Live ML predictions
    const criticalCount = updatedZones.filter(z => z.risk_level === 'Critical').length;
    const highCount = updatedZones.filter(z => z.risk_level === 'High').length;
    const blockedRoads = roadSegments.filter(r => r.status === 'Blocked' || r.status === 'At Risk').length;

    // Automatically generate live alerts for Critical / High zones
    const generatedAlerts = updatedZones
      .filter(z => z.risk_level === 'Critical' || z.risk_level === 'High')
      .map((z, i) => ({
        id: `ML-ALT-${i+1}`,
        level: z.risk_level,
        zone_id: z.id,
        risk_score: z.risk_score,
        message: `[Live ML Warning] ${z.name}: High landslide probability due to ${currentWeather.current_rain_mm_hr} mm/hr rain.`,
        impact: z.potential_impact ? z.potential_impact.join(', ') : 'Potential road blockage',
        time: currentWeather.timestamp || 'Just now'
      }));

    setAlerts(generatedAlerts);
    setStats({
      criticalZones: criticalCount,
      highRiskZones: highCount,
      roadsAtRisk: blockedRoads,
      activeAlerts: generatedAlerts.length
    });
  };

  const handleZoneClick = (zone) => {
    setSelectedZone(zone);
  };

  const closeDetails = () => {
    setSelectedZone(null);
    setEvacuationRoute(null);
  };

  const toggleAlerts = () => {
    setShowAlerts(!showAlerts);
  };

  const handleEvacuate = async (zone) => {
    setIsCalculatingRoute(true);
    // Find nearest SECURE relief center mathematically
    let nearestRC = null;
    let minDist = Infinity;
    reliefCenters.filter(rc => rc.status === 'Secure').forEach(rc => {
      const dist = Math.sqrt(Math.pow(rc.latitude - zone.latitude, 2) + Math.pow(rc.longitude - zone.longitude, 2));
      if (dist < minDist) {
        minDist = dist;
        nearestRC = rc;
      }
    });

    if (nearestRC) {
      // Find all current hazard zones to avoid
      const hazardZones = riskZones.filter(z => z.risk_level === 'Critical' || z.risk_level === 'High');
      const routeData = await calculateEvacuationRoute(zone.latitude, zone.longitude, nearestRC.latitude, nearestRC.longitude, hazardZones);
      
      if (routeData && routeData.status === 'success') {
        setEvacuationRoute({
          ...routeData,
          start: zone,
          end: nearestRC
        });
      } else {
        alert("Could not find a valid road path avoiding hazards.");
      }
    }
    setIsCalculatingRoute(false);
  };

  // Filter top priority locations (critical and high)
  const priorityLocations = riskZones
    .filter(z => z.risk_level === 'Critical' || z.risk_level === 'High')
    .slice(0, 3);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50">
      <Header />
      
      {/* Alert Indicator if not showing alerts panel */}
      {alerts.length > 0 && !showAlerts && (
        <button 
          onClick={toggleAlerts}
          className="absolute top-16 right-4 z-[1000] bg-white border border-red-200 shadow-md rounded-full px-4 py-1.5 flex items-center gap-2 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          {alerts.length} LIVE ML ALERTS
        </button>
      )}

      {showAlerts && (
        <AlertPanel alerts={alerts} onClose={() => setShowAlerts(false)} />
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Map Area and Bottom Webcams (70%) */}
        <div className="flex-1 flex flex-col relative h-full bg-gray-200">
          <div className="flex-1 relative">
            <RiskMap 
              riskZones={riskZones}
              roadSegments={roadSegments}
              communityObservations={communityObservations}
              reliefCenters={reliefCenters}
              evacuationRoute={evacuationRoute}
              selectedZone={selectedZone}
              onZoneClick={handleZoneClick}
            />
          </div>
          {/* Bottom Live Camera Strip */}
          <LiveMonitoringPanel />
        </div>

        {/* Details Drawer */}
        <RiskDetails 
          zone={selectedZone} 
          onClose={closeDetails} 
          onEvacuate={handleEvacuate}
          isCalculatingRoute={isCalculatingRoute}
          evacuationRoute={evacuationRoute}
        />

        {/* Sidebar (30%) */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col z-10 shadow-[-4px_0_15px_rgba(0,0,0,0.03)] h-full">
          <div className="p-4 flex-1 overflow-y-auto">
            {stats && Object.keys(stats).length > 0 && (
              <SummaryBar stats={stats} />
            )}
            
            {/* Live Weather Controller (Auto-updates predictions based on rain) */}
            <LiveWeatherController 
              riskZones={riskZones}
              onUpdatePredictions={handleUpdatePredictions}
            />

            {/* Weather Telemetry for Selected Site */}
            <WeatherSummary selectedZone={selectedZone} />
            
            <PriorityLocations 
              locations={priorityLocations} 
              onLocationClick={handleZoneClick}
            />
          </div>
          
          <MapExport />
        </div>
      </div>
    </div>
  );
}
