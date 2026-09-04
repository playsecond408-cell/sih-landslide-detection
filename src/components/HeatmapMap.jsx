import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Pure Smooth GIS Canvas Heatmap Component (Zero Dots, Zero Markers)
function PureCanvasHeatmap({ points, radius, intensity, minScoreFilter }) {
  const map = useMap();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Create or locate overlay canvas element
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '450';
      canvasRef.current = canvas;

      const pane = map.getPanes().overlayPane;
      pane.appendChild(canvas);
    }

    const renderSmoothHeat = () => {
      if (!canvas || !map) return;

      const size = map.getSize();
      const bounds = map.getBounds();
      const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());

      canvas.width = size.x;
      canvas.height = size.y;
      L.DomUtil.setPosition(canvas, topLeft);

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, size.x, size.y);

      // Offscreen canvas for alpha accumulation
      const offscreen = document.createElement('canvas');
      offscreen.width = size.x;
      offscreen.height = size.y;
      const offCtx = offscreen.getContext('2d');

      const filtered = points.filter(pt => {
        const score = pt.susceptibility_score || (pt.risk_score / 100) || 0.5;
        return (score * 100) >= minScoreFilter;
      });

      if (filtered.length === 0) return;

      // 1. Draw smooth radial alpha gradients for every heat point
      filtered.forEach(pt => {
        const score = pt.susceptibility_score || (pt.risk_score / 100) || 0.5;
        const latLng = L.latLng(pt.latitude, pt.longitude);
        const point = map.latLngToLayerPoint(latLng)._subtract(topLeft);

        const r = Math.max(30, radius * (1.2 + score * 1.5));
        const alpha = Math.min(1.0, (0.5 + score * 0.5) * intensity);

        const grad = offCtx.createRadialGradient(point.x, point.y, 0, point.x, point.y, r);
        grad.addColorStop(0, `rgba(0,0,0,${alpha})`);
        grad.addColorStop(0.5, `rgba(0,0,0,${alpha * 0.4})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        offCtx.fillStyle = grad;
        offCtx.beginPath();
        offCtx.arc(point.x, point.y, r, 0, Math.PI * 2);
        offCtx.fill();
      });

      // 2. Colorize alpha accumulation using GIS Heat Gradient Palette
      const imgData = offCtx.getImageData(0, 0, size.x, size.y);
      const pixels = imgData.data;

      // Build GIS Color Palette Gradient
      const palCanvas = document.createElement('canvas');
      palCanvas.width = 256;
      palCanvas.height = 1;
      const pCtx = palCanvas.getContext('2d');
      const pGrad = pCtx.createLinearGradient(0, 0, 256, 0);

      pGrad.addColorStop(0.0, 'rgba(37, 99, 235, 0)');     // Transparent Blue
      pGrad.addColorStop(0.2, 'rgba(22, 163, 74, 0.45)');   // Green (Low)
      pGrad.addColorStop(0.45, 'rgba(234, 179, 8, 0.7)');   // Yellow (Moderate)
      pGrad.addColorStop(0.7, 'rgba(234, 88, 12, 0.85)');   // Orange (High)
      pGrad.addColorStop(1.0, 'rgba(220, 38, 38, 0.95)');   // Red (Critical)

      pCtx.fillStyle = pGrad;
      pCtx.fillRect(0, 0, 256, 1);
      const palette = pCtx.getImageData(0, 0, 256, 1).data;

      for (let i = 0; i < pixels.length; i += 4) {
        const alpha = pixels[i + 3];
        if (alpha > 0) {
          pixels[i]     = palette[alpha * 4];       // R
          pixels[i + 1] = palette[alpha * 4 + 1];   // G
          pixels[i + 2] = palette[alpha * 4 + 2];   // B
          pixels[i + 3] = palette[alpha * 4 + 3];   // A
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };

    renderSmoothHeat();

    map.on('move', renderSmoothHeat);
    map.on('zoomend', renderSmoothHeat);
    map.on('viewreset', renderSmoothHeat);

    return () => {
      map.off('move', renderSmoothHeat);
      map.off('zoomend', renderSmoothHeat);
      map.off('viewreset', renderSmoothHeat);
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      canvasRef.current = null;
    };
  }, [map, points, radius, intensity, minScoreFilter]);

  return null;
}

function MapFlyController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 9, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function HeatmapMap({ points, radius, intensity, minScoreFilter, mapCenter }) {
  const defaultCenter = [25.923, 92.5];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={mapCenter || defaultCenter}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <MapFlyController center={mapCenter} zoom={mapCenter ? 10 : 8} />

        {/* Topographical Terrain Map Layer Only */}
        <TileLayer
          attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          maxZoom={17}
        />

        {/* True Pure Canvas Heatmap Layer (Smooth Heat Contours, Zero Dots/Markers) */}
        <PureCanvasHeatmap
          points={points}
          radius={radius}
          intensity={intensity}
          minScoreFilter={minScoreFilter}
        />
      </MapContainer>
    </div>
  );
}
