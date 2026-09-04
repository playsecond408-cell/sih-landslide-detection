import React from 'react';
import { X, Info } from 'lucide-react';

export default function SusceptibilityDetails({ zone, onClose }) {
  if (!zone) return null;

  const getRiskColor = (level) => {
    switch (level) {
      case 'Very High': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Moderate': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      case 'Very Low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white/95 backdrop-blur-md shadow-xl z-[1000] border-l border-gray-200 flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h2 className="font-bold text-gray-800 text-sm tracking-wide">SUSCEPTIBILITY ZONE</h2>
        <button 
          onClick={onClose}
          className="p-1 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-4 flex-1">
        <p className="text-gray-500 text-xs font-mono mb-2">{zone.id}</p>
        <div className={`px-3 py-1.5 rounded text-sm font-bold uppercase inline-flex items-center gap-2 mb-6 ${getRiskColor(zone.susceptibilityLevel)}`}>
          {zone.susceptibilityLevel}
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Susceptibility Score</p>
          <div className="flex items-end gap-1 text-gray-900">
            <span className="text-3xl font-light leading-none">{zone.susceptibilityScore}</span>
            <span className="text-sm font-medium text-gray-500 mb-1">/ 100</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase">Terrain</p>
            <p className="text-sm text-gray-800 font-medium">Steep</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase">Slope</p>
            <p className="text-sm text-gray-800 font-medium">{zone.slope}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase">Soil</p>
            <p className="text-sm text-gray-800 font-medium">{zone.soilType}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase">Elevation</p>
            <p className="text-sm text-gray-800 font-medium">{zone.elevation}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase">Hist. Events</p>
            <p className="text-sm text-gray-800 font-medium">{zone.historicalEvents}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase">Drainage</p>
            <p className="text-sm text-gray-800 font-medium">{zone.drainage}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Contributing Factors</p>
          <div className="space-y-3">
            {zone.contributors.map((factor, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs mb-1 text-gray-700">
                  <span>{factor.name}</span>
                  <span className="font-mono">{factor.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-gray-600 h-1.5 rounded-full" 
                    style={{ width: `${factor.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-100 p-3 rounded-md">
          <div className="flex items-start gap-2 mb-2 text-blue-800">
            <Info size={14} className="mt-0.5 flex-shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Concept Note</span>
          </div>
          <div className="text-[11px] text-gray-700 space-y-2 leading-relaxed">
            <p><strong>SUSCEPTIBILITY:</strong> Long-term tendency of terrain to experience landslides based on static factors (slope, soil, elevation).</p>
            <p><strong>RISK (Command Center):</strong> Current probability based on susceptibility + dynamic conditions (rainfall, soil moisture).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
