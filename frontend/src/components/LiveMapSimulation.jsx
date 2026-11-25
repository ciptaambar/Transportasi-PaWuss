import React, { useRef, useEffect } from 'react';
import { Navigation, MapPin, Compass, Bike, Car, Shield } from 'lucide-react';

export default function LiveMapSimulation({
  pickupCoord,
  destCoord,
  driverCoord,
  orderStatus,
  serviceType,
  driverName,
  onTriggerSimulation
}) {
  const canvasRef = useRef(null);

  // Bounds Kota Bandar Lampung
  // Min Lat: -5.450 (Teluk Betung / Panjang), Max Lat: -5.350 (Unila / Rajabasa)
  // Min Lng: 105.225 (Kemiling / Gedong Tataan arah barat), Max Lng: 105.295 (Way Halim / Sukarame)
  const bounds = {
    minLat: -5.450,
    maxLat: -5.350,
    minLng: 105.225,
    maxLng: 105.295
  };

  const projectToCanvas = (lat, lng, width, height) => {
    const padding = 50;
    const w = width - padding * 2;
    const h = height - padding * 2;

    const x = padding + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * w;
    // Latitude inverted on canvas
    const y = padding + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * h;

    return { x, y };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear background (Dark modern map theme like GPS navigation)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw Grid / Road network simulation
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Secondary simulated diagonal avenues
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.4);
    ctx.lineTo(width, height * 0.65);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width * 0.25, 0);
    ctx.lineTo(width * 0.75, height);
    ctx.stroke();

    const pPickup = projectToCanvas(pickupCoord.lat, pickupCoord.lng, width, height);
    const pDest = projectToCanvas(destCoord.lat, destCoord.lng, width, height);
    const pDriver = driverCoord ? projectToCanvas(driverCoord.lat, driverCoord.lng, width, height) : null;

    // 1. Draw Journey Route Line (Pickup -> Destination)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(pPickup.x, pPickup.y);
    ctx.lineTo(pDest.x, pDest.y);
    ctx.stroke();
    ctx.setLineDash([]); // Reset

    // 2. Draw Driver to Target Line if active
    if (pDriver && (orderStatus === 'PICKING_UP' || orderStatus === 'DRIVER_ASSIGNED')) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pDriver.x, pDriver.y);
      ctx.lineTo(pPickup.x, pPickup.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. Draw Pickup Pin (Green)
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(pPickup.x, pPickup.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
    ctx.fillText('Titik Jemput', pPickup.x + 14, pPickup.y + 4);

    // 4. Draw Destination Pin (Red/Orange)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(pDest.x, pDest.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
    ctx.fillText('Tujuan', pDest.x + 14, pDest.y + 4);

    // 5. Draw Driver (Pulsing marker)
    if (pDriver) {
      // Glow circle
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.arc(pDriver.x, pDriver.y, 22, 0, Math.PI * 2);
      ctx.fill();

      // Core icon circle
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(pDriver.x, pDriver.y, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
      ctx.fillText(`🛵 ${driverName || 'Mitra Driver'}`, pDriver.x - 30, pDriver.y - 18);
    }

  }, [pickupCoord, destCoord, driverCoord, orderStatus, driverName]);

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800 text-white relative">
      
      {/* Top Map Header / Telemetry Bar */}
      <div className="bg-slate-800/90 backdrop-blur px-4 py-2.5 flex items-center justify-between border-b border-slate-700 text-xs">
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span className="font-semibold text-slate-200">Radar & GPS Telemetri Kota Bandar Lampung</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
            Wilayah BDL
          </span>
        </div>

        <div className="flex items-center space-x-3 text-slate-300">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Jemput: {pickupCoord.lat.toFixed(4)}, {pickupCoord.lng.toFixed(4)}</span>
          </span>
          {driverCoord && (
            <span className="flex items-center space-x-1 text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              <span>Driver: {driverCoord.lat.toFixed(4)}, {driverCoord.lng.toFixed(4)}</span>
            </span>
          )}
        </div>
      </div>

      {/* Visual Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={700}
          height={380}
          className="w-full h-[320px] md:h-[380px] object-cover block"
        />

        {/* Floating Simulation Trigger Button */}
        {onTriggerSimulation && (
          <div className="absolute bottom-4 right-4">
            <button
              onClick={onTriggerSimulation}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 transition-all transform active:scale-95 border border-emerald-400/30"
            >
              <span>⚡ Jalankan Simulasi Live Tracking</span>
            </button>
          </div>
        )}

        {/* Legend Overlay */}
        <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 text-[11px] space-y-1.5 shadow-lg">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white"></span>
            <span className="text-slate-300">Titik Jemput Pelanggan</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-white"></span>
            <span className="text-slate-300">Titik Tujuan Pengantaran</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-sky-500 border border-white animate-pulse"></span>
            <span className="text-slate-300">Posisi Real-time Driver</span>
          </div>
        </div>
      </div>

    </div>
  );
}
