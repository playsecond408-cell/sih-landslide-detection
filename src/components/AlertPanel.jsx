import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function AlertPanel({ alerts, onClose }) {
  if (!alerts || alerts.length === 0) return null;

  const levelColor = (level) => {
    switch (level) {
      case 'Critical': return 'border-l-red-600 bg-red-50/70 border-red-200';
      case 'High': return 'border-l-orange-500 bg-orange-50/70 border-orange-200';
      default: return 'border-l-yellow-500 bg-yellow-50/70 border-yellow-200';
    }
  };

  return (
    <div className="absolute top-16 right-4 w-84 bg-white shadow-2xl border border-red-200 rounded-lg z-[999] overflow-hidden">
      <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
          <AlertCircle size={16} className="animate-pulse" />
          <span>Emergency Alert Feed ({alerts.length} Active)</span>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto p-4 space-y-3">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border border-l-4 ${levelColor(alert.level)}`}
          >
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-bold text-gray-900 text-xs uppercase">
                {alert.level} HAZARD: {alert.zone_id}
              </h4>
              <span className="text-[10px] font-mono text-gray-500">{alert.time || 'Just now'}</span>
            </div>
            <p className="text-xs font-semibold text-red-700 mb-1">
              Risk Vulnerability: {alert.risk_score}%
            </p>
            <p className="text-xs text-gray-700 font-medium leading-snug">
              {alert.message}
            </p>
            {alert.impact && (
              <p className="text-[11px] text-gray-500 italic mt-1">
                Impact: {alert.impact}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

