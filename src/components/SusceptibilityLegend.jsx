import React from 'react';

export default function SusceptibilityLegend() {
  return (
    <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm border border-gray-200 p-4 shadow-lg rounded-md z-[1000] min-w-[200px]">
      <h3 className="text-xs font-bold text-gray-800 mb-3 tracking-wide">LANDSLIDE SUSCEPTIBILITY</h3>
      <div className="space-y-2 text-sm font-medium">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-600"></span> Very High</span>
          <span className="text-gray-500 text-xs">80–100</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-orange-500"></span> High</span>
          <span className="text-gray-500 text-xs">60–79</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-yellow-400"></span> Moderate</span>
          <span className="text-gray-500 text-xs">40–59</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-green-500"></span> Low</span>
          <span className="text-gray-500 text-xs">20–39</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-500"></span> Very Low</span>
          <span className="text-gray-500 text-xs">0–19</span>
        </div>
      </div>
    </div>
  );
}
