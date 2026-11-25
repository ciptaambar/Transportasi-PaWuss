import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UserBooking from './components/UserBooking';
import OrderTracker from './components/OrderTracker';
import DriverDashboard from './components/DriverDashboard';
import LiveMapSimulation from './components/LiveMapSimulation';
import RatingModal from './components/RatingModal';
import FavoriteDriversCard from './components/FavoriteDriversCard';
import PawussRiderLogo from './components/PawussRiderLogo';
import { socket } from './services/socket';
import { createOrder, getFavoriteDrivers, removeFavoriteDriver } from './services/api';

export default function App() {
  const [activeRole, setActiveRole] = useState('USER'); // 'USER' or 'DRIVER'
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [walletBalance, setWalletBalance] = useState(250000);
  const [activeOrder, setActiveOrder] = useState(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [driverCoord, setDriverCoord] = useState({ lat: -5.3900, lng: 105.2550 }); // Bandar Lampung (Kedaton)
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [selectedFavDriverId, setSelectedFavDriverId] = useState(null);

  // Default coordinate reference Bandar Lampung (Tugu Adipura ke Mall Boemi Kedaton)
  const [pickupCoord, setPickupCoord] = useState({ lat: -5.4262, lng: 105.2580 });
  const [destCoord, setDestCoord] = useState({ lat: -5.3818, lng: 105.2589 });

  useEffect(() => {
    loadFavorites();

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('order:status_update', (data) => {
      console.log('📢 Status Update received:', data);
      setActiveOrder((prev) => {
        if (!prev) return data.order || null;
        return {
          ...prev,
          ...(data.order || {}),
          status: data.status,
          driver: data.driver || prev.driver,
          driverId: data.driver ? data.driver.id : prev.driverId,
          isFavoriteDriver: data.isFavoriteDriver ?? prev.isFavoriteDriver
        };
      });

      if (data.status === 'COMPLETED') {
        setShowRatingModal(true);
      }
    });

    socket.on('order:driver_location', (data) => {
      setDriverCoord({ lat: data.lat, lng: data.lng });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('order:status_update');
      socket.off('order:driver_location');
    };
  }, []);

  const loadFavorites = async () => {
    try {
      const res = await getFavoriteDrivers('usr-001');
      if (res.success) {
        setFavorites(res.data);
      }
    } catch (err) {
      console.error('Gagal memuat driver favorit:', err);
    }
  };

  const handleRemoveFavorite = async (driverId) => {
    try {
      const res = await removeFavoriteDriver('usr-001', driverId);
      if (res.success) {
        setFavorites((prev) => prev.filter(f => f.driverId !== driverId));
        if (selectedFavDriverId === driverId) setSelectedFavDriverId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const preferredDriver = favorites.find(f => f.driverId === selectedFavDriverId)?.driver || null;

  const handleOrderCreated = async (payload) => {
    setIsOrdering(true);
    setPickupCoord({ lat: payload.pickupLat, lng: payload.pickupLng });
    setDestCoord({ lat: payload.destinationLat, lng: payload.destinationLng });

    try {
      const res = await createOrder(payload);
      if (res.success) {
        setActiveOrder(res.data);
        socket.emit('join:order', { orderId: res.data.id, role: 'USER' });

        // Kurangi saldo jika bayar pakai PaWussPay
        if (payload.paymentMethod === 'PAWUSS_PAY') {
          setWalletBalance((prev) => Math.max(0, prev - res.data.priceTotal));
        }
      }
    } catch (err) {
      console.error(err);
      alert('Gagal membuat pesanan. Pastikan backend server aktif!');
    } finally {
      setIsOrdering(false);
    }
  };

  const handleTriggerSimulation = () => {
    if (!activeOrder) {
      alert('Silakan lakukan pemesanan terlebih dahulu untuk memulai simulasi!');
      return;
    }
    socket.emit('simulate:run_trip', { orderId: activeOrder.id });
  };

  const handleDriverAcceptOrder = (driverId, orderId) => {
    socket.emit('driver:accept_order', { driverId, orderId });
  };

  const handleDriverUpdateStatus = (orderId, newStatus) => {
    socket.emit('order:change_status', { orderId, newStatus });
  };

  const handleCancelOrder = () => {
    setActiveOrder(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Bar */}
      <Navbar
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        walletBalance={walletBalance}
        isConnected={isConnected}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Banner Alert Context */}
        <div className="mb-6 bg-gradient-to-r from-emerald-700 via-emerald-800 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <PawussRiderLogo size={48} className="shadow-emerald-900/50" />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-extrabold tracking-tight">
                  PaWuss Ojek Online - Bandar Lampung
                </h1>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                  Lampung
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Layanan transportasi ojek & taksi online: Tugu Adipura, MBK, Unila, Tj. Karang & sekitarnya.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 font-medium">
              Mode Aktif: <strong className="text-emerald-300">{activeRole === 'USER' ? 'Customer' : 'Mitra Driver'}</strong>
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: Form Pemesanan / Order Tracker / Driver Panel (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {activeRole === 'USER' ? (
              <>
                {!activeOrder || activeOrder.status === 'COMPLETED' ? (
                  <>
                    <UserBooking
                      onOrderCreated={handleOrderCreated}
                      isOrdering={isOrdering}
                      preferredDriver={preferredDriver}
                      onClearPreferredDriver={() => setSelectedFavDriverId(null)}
                    />

                    {/* Driver Langganan / Favorit Management Card */}
                    <FavoriteDriversCard
                      favorites={favorites}
                      onSelectFavorite={(driverId) => setSelectedFavDriverId(driverId)}
                      onRemoveFavorite={handleRemoveFavorite}
                      selectedDriverId={selectedFavDriverId}
                    />
                  </>
                ) : (
                  <OrderTracker
                    activeOrder={activeOrder}
                    onCancelOrder={handleCancelOrder}
                    onOpenRating={() => setShowRatingModal(true)}
                    onTriggerSimulation={handleTriggerSimulation}
                  />
                )}
              </>
            ) : (
              <DriverDashboard
                activeOrder={activeOrder}
                onAcceptOrder={handleDriverAcceptOrder}
                onUpdateStatus={handleDriverUpdateStatus}
                onUpdateLocation={(lat, lng) => setDriverCoord({ lat, lng })}
              />
            )}
          </div>

          {/* Right Column: Interactive Real-time GPS Map & Architecture Highlights (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <LiveMapSimulation
              pickupCoord={pickupCoord}
              destCoord={destCoord}
              driverCoord={driverCoord}
              orderStatus={activeOrder ? activeOrder.status : 'IDLE'}
              serviceType={activeOrder ? activeOrder.serviceType : 'PAWUSS_RIDE'}
              driverName={activeOrder?.driver?.name}
              onTriggerSimulation={activeOrder ? handleTriggerSimulation : null}
            />

            {/* Architecture Highlights & Lifecycle Legend */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Siklus Transaksi & State Machine PaWuss
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                  <span className="font-bold text-slate-800 block">1. Hitung Jarak</span>
                  <p className="text-slate-500 text-[10px] mt-0.5">Formula Haversine geodesi kalkulasi otomatis tarif</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                  <span className="font-bold text-slate-800 block">2. Matching Driver</span>
                  <p className="text-slate-500 text-[10px] mt-0.5">Filter radius driver online terdekat</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                  <span className="font-bold text-slate-800 block">3. Live WebSocket</span>
                  <p className="text-slate-500 text-[10px] mt-0.5">Broadcast GPS & order room via Socket.io</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                  <span className="font-bold text-slate-800 block">4. Settle & Rating</span>
                  <p className="text-slate-500 text-[10px] mt-0.5">Settlement PaWussPay & ulasan bintang</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Rating & Review Modal */}
      {showRatingModal && (
        <RatingModal
          order={activeOrder}
          onClose={() => setShowRatingModal(false)}
          onSuccess={(ratingData) => {
            alert('Rating & Driver Langganan berhasil disimpan ke database PaWuss!');
            loadFavorites();
            setActiveOrder(null);
          }}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        🐾 <strong>PaWuss Super-App</strong> © 2026. Production Blueprint for Scalable Ride-Hailing & Delivery.
      </footer>
    </div>
  );
}
