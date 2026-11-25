import React from 'react';
import { Search, Bike, UserCheck, CheckCircle2, Phone, Star, ShieldCheck, AlertCircle, Play } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'SEARCHING_DRIVER', title: 'Mencari Driver', desc: 'Sistem mencocokkan mitra terdekat' },
  { key: 'DRIVER_ASSIGNED', title: 'Driver Ditemukan', desc: 'Mitra telah menerima order Anda' },
  { key: 'PICKING_UP', title: 'Menjemput', desc: 'Mitra meluncur ke titik jemput' },
  { key: 'IN_TRIP', title: 'Dalam Perjalanan', desc: 'Menuju ke alamat tujuan' },
  { key: 'COMPLETED', title: 'Selesai', desc: 'Perjalanan aman telah tuntas' }
];

export default function OrderTracker({
  activeOrder,
  onCancelOrder,
  onOpenRating,
  onTriggerSimulation
}) {
  if (!activeOrder) return null;

  const getStepIndex = (status) => {
    switch (status) {
      case 'SEARCHING_DRIVER': return 0;
      case 'DRIVER_ASSIGNED': return 1;
      case 'PICKING_UP': return 2;
      case 'IN_TRIP': return 3;
      case 'COMPLETED': return 4;
      default: return 0;
    }
  };

  const currentIdx = getStepIndex(activeOrder.status);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Status Pesanan Aktif</span>
          <p className="text-sm font-extrabold text-slate-900">Kode: {activeOrder.orderCode}</p>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            {activeOrder.serviceType.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Step Indicator Progress Bar */}
      <div>
        <div className="grid grid-cols-5 gap-1 text-center">
          {STATUS_STEPS.map((step, idx) => {
            const isDone = idx < currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 animate-pulse'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
                <p className={`text-[10px] mt-1.5 font-bold leading-tight ${isCurrent ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {step.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Searching State Banner */}
      {activeOrder.status === 'SEARCHING_DRIVER' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-spin">
            <Search className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-900">Mencari Driver PaWuss Terdekat...</p>
            <p className="text-[11px] text-slate-600">
              Sedang mencocokkan mitra di radius terdekat lokasi Anda.
            </p>
          </div>
        </div>
      )}

      {/* Driver Info Card (Saat driver sudah di-assign) */}
      {activeOrder.driver && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
          
          {/* Favorite Driver Banner */}
          {(activeOrder.isFavoriteDriver || activeOrder.driver.isFavorite || activeOrder.preferredDriverId === activeOrder.driver.id) && (
            <div className="bg-amber-100/80 border border-amber-300 text-amber-900 rounded-lg px-2.5 py-1 text-[11px] font-bold flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <span>⭐</span>
                <span>Mitra Driver Langganan Anda</span>
              </span>
              <span className="text-[10px] bg-amber-200 px-1.5 py-0.2 rounded font-extrabold uppercase">
                Prioritas
              </span>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {activeOrder.driver.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-1.5">
                <p className="text-sm font-bold text-slate-900">{activeOrder.driver.name}</p>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <span className="flex items-center text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                  {activeOrder.driver.ratingAvg}
                </span>
                <span>•</span>
                <span>{activeOrder.driver.phone}</span>
              </div>
            </div>
            <a
              href={`tel:${activeOrder.driver.phone}`}
              className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 shadow-sm"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          {activeOrder.driver.vehicle && (
            <div className="bg-white rounded-lg p-2.5 border border-slate-200/80 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                {activeOrder.driver.vehicle.brand} {activeOrder.driver.vehicle.model}
              </span>
              <span className="font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded text-[11px]">
                {activeOrder.driver.vehicle.plateNumber}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Completed State & Rating Trigger */}
      {activeOrder.status === 'COMPLETED' && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-emerald-950">Perjalanan Berhasil Selesai!</p>
            <p className="text-xs text-emerald-800">
              Total pembayaran Rp {activeOrder.priceTotal?.toLocaleString('id-ID')} ({activeOrder.payment?.method}) telah lunas.
            </p>
          </div>
          <button
            onClick={onOpenRating}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow transition"
          >
            ⭐ Beri Ulasan & Rating Mitra
          </button>
        </div>
      )}

      {/* Simulator Shortcut for Quick Evaluation */}
      {activeOrder.status !== 'COMPLETED' && (
        <div className="pt-2">
          <button
            onClick={onTriggerSimulation}
            className="w-full bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 border border-slate-700 shadow-md transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simulasikan Perjalanan Driver (Demo Otomatis)</span>
          </button>
        </div>
      )}

    </div>
  );
}
