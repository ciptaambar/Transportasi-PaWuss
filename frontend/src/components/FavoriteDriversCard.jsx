import React from 'react';
import { Heart, Star, Bike, Car, Trash2, CheckCircle2, ShieldCheck, Sparkles, Navigation } from 'lucide-react';

export default function FavoriteDriversCard({
  favorites,
  onSelectFavorite,
  onRemoveFavorite,
  selectedDriverId
}) {
  if (!favorites || favorites.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-dashed border-slate-300 text-center">
        <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-2">
          <Heart className="w-4 h-4" />
        </div>
        <p className="text-xs font-bold text-slate-800">Belum Ada Driver Langganan</p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Setelah perjalanan selesai, Anda dapat menyimpan driver terbaik ke daftar langganan.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50/50 via-white to-emerald-50/40 rounded-2xl shadow-sm border border-amber-200/80 p-4 space-y-3">
      
      <div className="flex items-center justify-between border-b border-amber-100 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm">
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 flex items-center space-x-1">
              <span>Driver Langganan Saya</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-bold">
                {favorites.length}
              </span>
            </h4>
            <p className="text-[10px] text-slate-500">Prioritas otomatis saat driver sedang online</p>
          </div>
        </div>
        <Sparkles className="w-4 h-4 text-amber-500" />
      </div>

      <div className="space-y-2.5">
        {favorites.map((fav) => {
          const d = fav.driver;
          if (!d) return null;
          const isSelected = selectedDriverId === d.id;

          return (
            <div
              key={fav.id}
              className={`p-3 rounded-xl border transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20 shadow-sm'
                  : 'border-slate-200 bg-white/90 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm relative">
                    {d.name.charAt(0)}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        d.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                      title={d.isOnline ? 'Driver Online' : 'Driver Offline'}
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-1">
                      <p className="text-xs font-bold text-slate-900">{fav.nicknameLabel || d.name}</p>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="flex items-center space-x-1.5 text-[10px] text-slate-500">
                      <span className="font-semibold text-amber-500 flex items-center">
                        <Star className="w-3 h-3 fill-current mr-0.5" />
                        {d.ratingAvg}
                      </span>
                      <span>•</span>
                      <span>{fav.totalTripsWithUser || 1}x Trip bersama Anda</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveFavorite(d.id)}
                  className="text-slate-300 hover:text-red-500 p-1 transition"
                  title="Hapus dari langganan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Vehicle & Notes */}
              <div className="mt-2 text-[10px] text-slate-600 bg-slate-50 rounded-lg p-1.5 flex items-center justify-between">
                <span>{d.vehicle?.brand} {d.vehicle?.model} ({d.vehicle?.plateNumber})</span>
                <span className={`font-bold ${d.isOnline ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {d.isOnline ? '● Online & Siap' : '○ Sedang Offline'}
                </span>
              </div>

              {fav.notes && (
                <p className="text-[10px] italic text-slate-400 mt-1">"{fav.notes}"</p>
              )}

              {/* Action */}
              <div className="mt-2 pt-1 flex items-center justify-between">
                <span className="text-[10px] text-emerald-700 font-medium">
                  {fav.isAutoDispatchPreferred ? '⚡ Auto-Prioritas Aktif' : 'Prioritas Manual'}
                </span>

                <button
                  type="button"
                  disabled={!d.isOnline}
                  onClick={() => onSelectFavorite(isSelected ? null : d.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center space-x-1 ${
                    !d.isOnline
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Dipilih untuk Pesanan</span>
                    </>
                  ) : (
                    <span>Pilih Driver Ini</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
