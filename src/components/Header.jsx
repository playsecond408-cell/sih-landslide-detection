import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="flex items-center justify-between bg-white px-6 py-3 border-b border-gray-200 shadow-sm z-10 relative">
      <div className="flex items-center gap-8">
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-gray-900 leading-tight">
            NER LANDSLIDE INTELLIGENCE
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Landslide Early Warning & Disaster Monitoring System
          </p>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-md border border-gray-200 ml-4">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `px-4 py-1.5 text-sm font-bold rounded transition-colors ${isActive ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`
            }
            end
          >
            Command Center
          </NavLink>
          <NavLink 
            to="/susceptibility" 
            className={({ isActive }) => 
              `px-4 py-1.5 text-sm font-bold rounded transition-colors ${isActive ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`
            }
          >
            Susceptibility Explorer
          </NavLink>
          <NavLink 
            to="/evacuation" 
            className={({ isActive }) => 
              `px-4 py-1.5 text-sm font-bold rounded transition-colors ${isActive ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`
            }
          >
            Evacuation & Routing
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-gray-700">System Online</span>
        </div>
        
        <div className="text-sm text-gray-500 border-l border-gray-300 pl-6 hidden md:block">
          Last Updated: Real-Time Telemetry
        </div>
      </div>
    </header>
  );
}
