import React, { useState, useEffect } from 'react';
import { Power, CheckCircle, Navigation, DollarSign, Award, BellRing, Phone } from 'lucide-react';
import { getDrivers, toggleDriverOnline } from '../services/api';

export default function DriverDashboard({
  activeOrder,
  onAcceptOrder,
  onUpdateStatus,
  onUpdateLocation
}) {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDriverData();
  }, []);

  const loadDriverData = async () => {
    try {
      const res = await getDrivers();
      if (res.success && res.data.length > 0) {
        setDriver(res.data[0]); // Ambil driver pertama (Agus Pratama) sebagai demo driver
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnline = async () => {
    if (!driver) return;
    try {
      const res = await toggleDriverOnline(driver.id);
      if (res.success) {
        setDriver(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !driver) {
    return <div className="p-6 text-center text-xs text-slate-500">Memuat data mitra driver...</div>;
  }

  return (
    <div className="space-y-5">
      
      {/* Driver Profile & Online Switch */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg font-black shadow-md">
              {driver.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-base">{driver.name}</h3>
                <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {driver.vehicle?.type}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {driver.vehicle?.brand} {driver.vehicle?.model} • {driver.vehicle?.plateNumber}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleOnline}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all ${
              driver.isOnline
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{driver.isOnline ? 'Online (Aktif)' : 'Offline'}</span>
          </button>
        </div>

        {/* Quick Driver Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-center">
          <div className="bg-slate-50 rounded-xl p-2.5">
            <p className="text-[10px] text-slate-500 font-medium">Rating Mitra</p>
            <p className="text-sm font-extrabold text-amber-500">★ {driver.ratingAvg}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5">
            <p className="text-[10px] text-slate-500 font-medium">Total Trip Selesai</p>
            <p className="text-sm font-extrabold text-slate-800">{driver.totalTrips}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5">
            <p className="text-[10px] text-slate-500 font-medium">Penghasilan Hari Ini</p>
            <p className="text-sm font-extrabold text-emerald-600">Rp 185.000</p>
          </div>
        </div>
      </div>

      {/* Incoming Order Request Notification */}
      {activeOrder && activeOrder.status === 'SEARCHING_DRIVER' && (
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-5 text-white shadow-lg space-y-4 animate-pulse-glow">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
              <BellRing className="w-3.5 h-3.5 animate-bounce" />
              <span>Pesanan Masuk Baru!</span>
            </span>
            <span className="text-lg font-black">
              Rp {activeOrder.priceTotal?.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-xs space-y-1.5 border border-white/20">
            <p className="font-semibold">📍 Jemput: {activeOrder.pickupAddress}</p>
            <p className="font-semibold">🎯 Antar: {activeOrder.destinationAddress}</p>
            <p className="text-white/80">Jarak: {activeOrder.distanceKm} KM (~{activeOrder.estimatedDurationMins} Mins)</p>
          </div>

          <button
            onClick={() => onAcceptOrder(driver.id, activeOrder.id)}
            className="w-full bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold py-3 px-4 rounded-xl shadow-md text-sm transition"
          >
            Terima Pesanan Ini (Accept)
          </button>
        </div>
      )}

      {/* Active Trip Controller for Driver */}
      {activeOrder && activeOrder.driverId === driver.id && activeOrder.status !== 'COMPLETED' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">Kontrol Perjalanan Driver</span>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {activeOrder.status}
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <p><strong>Pelanggan:</strong> {activeOrder.user?.name || 'Customer PaWuss'}</p>
            <p><strong>Alamat Jemput:</strong> {activeOrder.pickupAddress}</p>
            <p><strong>Alamat Tujuan:</strong> {activeOrder.destinationAddress}</p>
          </div>

          <div className="grid grid-cols-1 gap-2 pt-2">
            {activeOrder.status === 'DRIVER_ASSIGNED' && (
              <button
                onClick={() => onUpdateStatus(activeOrder.id, 'PICKING_UP')}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-xl text-xs shadow"
              >
                1. Menuju Titik Jemput (Meluncur)
              </button>
            )}

            {activeOrder.status === 'PICKING_UP' && (
              <button
                onClick={() => onUpdateStatus(activeOrder.id, 'IN_TRIP')}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs shadow"
              >
                2. Pelanggan Naik, Mulai Antar (In Trip)
              </button>
            )}

            {activeOrder.status === 'IN_TRIP' && (
              <button
                onClick={() => onUpdateStatus(activeOrder.id, 'COMPLETED')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow"
              >
                3. Tiba di Tujuan (Selesaikan Pesanan & Terima Pembayaran)
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
