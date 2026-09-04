import React from 'react';
import { MapPin, Crosshair } from 'lucide-react';

export default function PriorityLocations({ locations, onLocationClick }) {
  if (!locations || locations.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-4 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-red-500" />
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Priority Locations</h3>
        </div>
        <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">
          {locations.length} High Risk
        </span>
      </div>
      <div className="divide-y divide-gray-100">
        {locations.map(loc => (
          <div 
            key={loc.id} 
            className="p-3 hover:bg-gray-50 transition-colors flex items-center justify-between gap-2"
          >
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-900">{loc.name || loc.id}</span>
                {loc.risk_level === 'Critical' ? (
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                ) : loc.risk_level === 'High' ? (
                  <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                )}
              </div>
              <span className="text-[11px] text-gray-500">
                Risk Score: <b className="text-gray-800">{loc.risk_score}%</b> • {loc.risk_level}
              </span>
            </div>

            <button
              onClick={() => onLocationClick(loc)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded border border-blue-200 transition-colors flex items-center gap-1 shrink-0"
            >
              <Crosshair size={12} />
              Focus on Map
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
