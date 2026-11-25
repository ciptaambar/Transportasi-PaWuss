import React, { useState, useEffect } from 'react';
import { Bike, Car, ShoppingBag, MapPin, Navigation, ArrowRight, Clock, ShieldCheck, Tag } from 'lucide-react';
import { getFareEstimate } from '../services/api';

const PRESET_LOCATIONS = [
  { name: 'Tugu Adipura (Tugu Gajah) Enggal', lat: -5.4262, lng: 105.2580 },
  { name: 'Mall Boemi Kedaton (MBK) Teuku Umar', lat: -5.3818, lng: 105.2589 },
  { name: 'Universitas Lampung (Unila) Rajabasa', lat: -5.3644, lng: 105.2433 },
  { name: 'Stasiun Kereta Api Tanjung Karang', lat: -5.4103, lng: 105.2604 },
  { name: 'RSUD Dr. H. Abdul Moeloek', lat: -5.4022, lng: 105.2585 },
  { name: 'Transmart Lampung Way Halim', lat: -5.3860, lng: 105.2780 }
];

export default function UserBooking({
  onOrderCreated,
  isOrdering,
  preferredDriver,
  onClearPreferredDriver
}) {
  const [serviceType, setServiceType] = useState('PAWUSS_RIDE');
  const [pickup, setPickup] = useState(PRESET_LOCATIONS[0]);
  const [destination, setDestination] = useState(PRESET_LOCATIONS[1]);
  const [estimate, setEstimate] = useState(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('PAWUSS_PAY');

  useEffect(() => {
    fetchEstimate();
  }, [pickup, destination, serviceType]);

  const fetchEstimate = async () => {
    setLoadingEstimate(true);
    try {
      const res = await getFareEstimate({
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        destinationLat: destination.lat,
        destinationLng: destination.lng,
        serviceType
      });
      if (res.success) {
        setEstimate(res.data);
      }
    } catch (err) {
      console.error('Gagal mengambil estimasi tarif:', err);
    } finally {
      setLoadingEstimate(false);
    }
  };

  const handleBook = () => {
    if (!estimate) return;
    onOrderCreated({
      serviceType,
      pickupAddress: pickup.name,
      pickupLat: pickup.lat,
      pickupLng: pickup.lng,
      destinationAddress: destination.name,
      destinationLat: destination.lat,
      destinationLng: destination.lng,
      paymentMethod,
      preferredDriverId: preferredDriver ? preferredDriver.id : null
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-5">
      
      {/* Preferred Favorite Driver Badge if active */}
      {preferredDriver && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-base">⭐</span>
            <div>
              <p className="font-extrabold text-amber-900">
                Driver Langganan Terpilih: {preferredDriver.name}
              </p>
              <p className="text-[10px] text-amber-700">
                Pesanan akan diprioritaskan langsung ke mitra langganan Anda.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearPreferredDriver}
            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline px-2 py-1"
          >
            Batal
          </button>
        </div>
      )}

      {/* Service Selection */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
          Pilih Layanan PaWuss
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setServiceType('PAWUSS_RIDE')}
            className={`p-3 rounded-xl border text-left transition-all ${
              serviceType === 'PAWUSS_RIDE'
                ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center mb-2 shadow-sm">
              <Bike className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-slate-900 leading-tight">PaWuss Ride</p>
            <p className="text-[10px] text-slate-500">Ojek Motor Cepat</p>
          </button>

          <button
            type="button"
            onClick={() => setServiceType('PAWUSS_CAR')}
            className={`p-3 rounded-xl border text-left transition-all ${
              serviceType === 'PAWUSS_CAR'
                ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center mb-2 shadow-sm">
              <Car className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-slate-900 leading-tight">PaWuss Car</p>
            <p className="text-[10px] text-slate-500">Mobil Nyaman</p>
          </button>

          <button
            type="button"
            onClick={() => setServiceType('PAWUSS_FOOD')}
            className={`p-3 rounded-xl border text-left transition-all ${
              serviceType === 'PAWUSS_FOOD'
                ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center mb-2 shadow-sm">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-slate-900 leading-tight">PaWuss Food</p>
            <p className="text-[10px] text-slate-500">Pesan Antar</p>
          </button>
        </div>
      </div>

      {/* Route Inputs (Pick-up & Destination) */}
      <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
        <div>
          <label className="text-[11px] font-semibold text-slate-600 flex items-center space-x-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Lokasi Penjemputan</span>
          </label>
          <select
            value={pickup.name}
            onChange={(e) => {
              const selected = PRESET_LOCATIONS.find(l => l.name === e.target.value);
              if (selected) setPickup(selected);
            }}
            className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {PRESET_LOCATIONS.map((loc) => (
              <option key={loc.name} value={loc.name} disabled={loc.name === destination.name}>
                📍 {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-600 flex items-center space-x-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
            <span>Lokasi Tujuan</span>
          </label>
          <select
            value={destination.name}
            onChange={(e) => {
              const selected = PRESET_LOCATIONS.find(l => l.name === e.target.value);
              if (selected) setDestination(selected);
            }}
            className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {PRESET_LOCATIONS.map((loc) => (
              <option key={loc.name} value={loc.name} disabled={loc.name === pickup.name}>
                🎯 {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fare Calculation Card */}
      {estimate && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-600 border-b border-emerald-200/60 pb-2">
            <span className="flex items-center space-x-1">
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>Jarak Tempuh:</span>
            </span>
            <span className="font-bold text-slate-900">{estimate.distanceKm} KM</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Tarif Dasar (2 KM pertama):</span>
            <span className="font-medium">Rp {estimate.baseFare.toLocaleString('id-ID')}</span>
          </div>

          {estimate.distanceFare > 0 && (
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Tarif Jarak Tambahan:</span>
              <span className="font-medium">Rp {estimate.distanceFare.toLocaleString('id-ID')}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Biaya Layanan Aplikasi:</span>
            <span className="font-medium">Rp {estimate.platformFee.toLocaleString('id-ID')}</span>
          </div>

          <div className="border-t border-emerald-200 pt-2 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Tarif Otomatis</p>
              <p className="text-lg font-extrabold text-emerald-800">
                Rp {estimate.totalFare.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center space-x-1 text-[11px] bg-white border border-emerald-300 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                <Clock className="w-3 h-3 text-emerald-600" />
                <span>~{estimate.estimatedDurationMins} Menit</span>
              </span>
              <p className="text-[10px] text-slate-500 mt-1">
                {estimate.availableDriversCount} Driver di sekitar
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Selection */}
      <div className="flex items-center justify-between text-xs pt-1">
        <span className="font-semibold text-slate-700">Metode Bayar:</span>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setPaymentMethod('PAWUSS_PAY')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
              paymentMethod === 'PAWUSS_PAY'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-600 border-slate-300'
            }`}
          >
            PaWussPay
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('CASH')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
              paymentMethod === 'CASH'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-600 border-slate-300'
            }`}
          >
            Tunai
          </button>
        </div>
      </div>

      {/* Book Button */}
      <button
        type="button"
        disabled={isOrdering || loadingEstimate || !estimate}
        onClick={handleBook}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.99]"
      >
        <span>{isOrdering ? 'Memproses Pesanan...' : 'Pesan PaWuss Sekarang'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

    </div>
  );
}
