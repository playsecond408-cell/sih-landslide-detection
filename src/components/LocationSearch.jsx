import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { getPredefinedLocations } from '../services/api';

export default function LocationSearch({ onLocationSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const locations = getPredefinedLocations();

  return (
    <div className="relative">
      <div className="flex items-center bg-white border border-gray-300 rounded overflow-hidden shadow-sm h-9">
        <div className="pl-3 pr-2 text-gray-400">
          <Search size={16} />
        </div>
        <input 
          type="text" 
          placeholder="Search NER location..."
          className="outline-none text-sm w-48 py-1.5 text-gray-700 bg-transparent"
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
      </div>

      {isOpen && (
        <div className="absolute top-10 left-0 w-full bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden z-[1001]">
          <div className="max-h-60 overflow-y-auto py-1">
            {locations.map((loc, idx) => (
              <button
                key={idx}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                onClick={() => {
                  onLocationSelect(loc);
                  setIsOpen(false);
                }}
              >
                <MapPin size={14} className="text-gray-400" />
                {loc.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
