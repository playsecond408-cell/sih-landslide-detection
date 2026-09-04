import React from 'react';
import { ShieldAlert, AlertTriangle, Route, Bell } from 'lucide-react';

export default function SummaryBar({ stats }) {
  if (!stats) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-4 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Regional Disaster Summary</h3>
        <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
          Telemetry Active
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 p-3">
        <div className="bg-red-50/70 border border-red-100 rounded-md p-2.5">
          <div className="flex items-center gap-1.5 text-xs text-red-700 font-bold mb-1">
            <ShieldAlert size={14} className="shrink-0" />
            <span>Critical Zones</span>
          </div>
          <p className="text-2xl font-black text-red-700 font-mono">{stats.criticalZones ?? 0}</p>
        </div>

        <div className="bg-orange-50/70 border border-orange-100 rounded-md p-2.5">
          <div className="flex items-center gap-1.5 text-xs text-orange-700 font-bold mb-1">
            <AlertTriangle size={14} className="shrink-0" />
            <span>High Risk</span>
          </div>
          <p className="text-2xl font-black text-orange-700 font-mono">{stats.highRiskZones ?? 0}</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-md p-2.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-700 font-bold mb-1">
            <Route size={14} className="shrink-0 text-gray-500" />
            <span>Highways at Risk</span>
          </div>
          <p className="text-2xl font-black text-gray-900 font-mono">{stats.roadsAtRisk ?? 0}</p>
        </div>

        <div className="bg-amber-50/70 border border-amber-100 rounded-md p-2.5">
          <div className="flex items-center justify-between text-xs text-amber-800 font-bold mb-1">
            <div className="flex items-center gap-1.5">
              <Bell size={14} className="shrink-0 text-amber-600" />
              <span>Active Alerts</span>
            </div>
            {stats.activeAlerts > 0 && <span className="h-2 w-2 rounded-full bg-red-600 animate-ping"></span>}
          </div>
          <p className="text-2xl font-black text-amber-900 font-mono">{stats.activeAlerts ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
