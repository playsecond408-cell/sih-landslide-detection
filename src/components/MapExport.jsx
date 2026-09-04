import React from 'react';
import { Download } from 'lucide-react';

export default function MapExport() {
  const handleDownload = () => {
    // In a real application, this would use html2canvas or a backend service
    // to generate a PDF/PNG of the map with the current layers and legend.
    alert("Exporting Map...\n(This is a prototype feature. In production, this will generate a PDF/PNG of the current GIS view including the NER Landslide Intelligence title, legend, and timestamp.)");
  };

  return (
    <div className="bg-white border border-gray-200 p-2 shadow-sm flex items-center justify-between text-xs text-gray-600">
      <div className="flex items-center gap-4 px-2">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500"></span> Low</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-500"></span> Moderate</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500"></span> High</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500"></span> Critical</span>
      </div>
      <button 
        onClick={handleDownload}
        className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-3 py-1.5 rounded transition-colors font-medium"
      >
        <Download size={14} />
        Download Map
      </button>
    </div>
  );
}
