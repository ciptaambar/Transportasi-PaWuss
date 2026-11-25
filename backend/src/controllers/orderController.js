const { calculateHaversineDistance, calculateFare } = require('../services/fareService');
const { findNearestDrivers } = require('../services/matchingService');
const { orders, drivers, users, ratings, favoriteDrivers } = require('../services/orderStore');

// 1. Kalkulasi estimasi biaya & jarak
exports.calculateEstimate = (req, res) => {
  try {
    const { pickupLat, pickupLng, destinationLat, destinationLng, serviceType = 'PAWUSS_RIDE', userId = 'usr-001' } = req.body;

    if (!pickupLat || !pickupLng || !destinationLat || !destinationLng) {
      return res.status(400).json({
        success: false,
        message: 'Koordinat jemput (pickup) dan tujuan (destination) wajib diisi!'
      });
    }

    const distanceKm = calculateHaversineDistance(
      parseFloat(pickupLat),
      parseFloat(pickupLng),
      parseFloat(destinationLat),
      parseFloat(destinationLng)
    );

    const fareDetails = calculateFare(serviceType, distanceKm);
    const nearbyDrivers = findNearestDrivers(pickupLat, pickupLng, serviceType, 10, userId);
    const favoriteDriversAvailable = nearbyDrivers.filter(d => d.isFavorite);

    return res.json({
      success: true,
      data: {
        ...fareDetails,
        availableDriversCount: nearbyDrivers.length,
        nearestDriverEtaMins: nearbyDrivers.length > 0 ? nearbyDrivers[0].estimatedArrivalMins : null,
        favoriteDriversAvailable: favoriteDriversAvailable.map(d => ({
          id: d.id,
          name: d.name,
          ratingAvg: d.ratingAvg,
          vehicle: d.vehicle,
          nicknameLabel: d.favoriteInfo?.nicknameLabel,
          distanceKm: d.distanceToPickupKm,
          etaMins: d.estimatedArrivalMins
        }))
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Buat Order Baru (Status: SEARCHING_DRIVER)
exports.createOrder = (req, res) => {
  try {
    const {
      userId = 'usr-001',
      serviceType = 'PAWUSS_RIDE',
      pickupAddress,
      pickupLat,
      pickupLng,
      destinationAddress,
      destinationLat,
      destinationLng,
      paymentMethod = 'PAWUSS_PAY',
      preferredDriverId = null
    } = req.body;

    const distanceKm = calculateHaversineDistance(pickupLat, pickupLng, destinationLat, destinationLng);
    const fareDetails = calculateFare(serviceType, distanceKm);

    const orderId = `PWS-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      id: orderId,
      orderCode: orderId,
      userId,
      user: users.find(u => u.id === userId) || users[0],
      driverId: null,
      driver: null,
      preferredDriverId,
      serviceType,
      status: 'SEARCHING_DRIVER', // PENDING -> SEARCHING_DRIVER -> DRIVER_ASSIGNED -> PICKING_UP -> IN_TRIP -> COMPLETED
      pickupAddress: pickupAddress || 'Lokasi Penjemputan Pengguna',
      pickupLat: parseFloat(pickupLat),
      pickupLng: parseFloat(pickupLng),
      destinationAddress: destinationAddress || 'Lokasi Tujuan Pengguna',
      destinationLat: parseFloat(destinationLat),
      destinationLng: parseFloat(destinationLng),
      distanceKm: fareDetails.distanceKm,
      estimatedDurationMins: fareDetails.estimatedDurationMins,
      baseFare: fareDetails.baseFare,
      priceTotal: fareDetails.totalFare,
      payment: {
        method: paymentMethod,
        amount: fareDetails.totalFare,
        status: 'PENDING'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    orders.unshift(newOrder);

    return res.status(201).json({
      success: true,
      message: preferredDriverId
        ? 'Pesanan PaWuss dibuat! Meminta konfirmasi Driver Langganan prioritas...'
        : 'Pesanan PaWuss berhasil dibuat. Mencari driver terdekat...',
      data: newOrder
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Ambil detail order
exports.getOrderById = (req, res) => {
  const { id } = req.params;
  const order = orders.find(o => o.id === id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
  }

  return res.json({ success: true, data: order });
};

// 4. Beri rating & opsi simpan ke Driver Langganan
exports.rateOrder = (req, res) => {
  const { id } = req.params;
  const { score, reviewText, addToFavorites, nicknameLabel, notes } = req.body;

  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
  }

  const newRating = {
    id: `rat-${Date.now()}`,
    orderId: id,
    userId: order.userId,
    driverId: order.driverId,
    score: parseInt(score) || 5,
    reviewText: reviewText || '',
    createdAt: new Date().toISOString()
  };

  ratings.push(newRating);

  // Jika pengguna memilih untuk menjadikan driver ini langganan
  let favoriteSaved = null;
  if (addToFavorites && order.driverId) {
    const existingFav = favoriteDrivers.find(f => f.userId === order.userId && f.driverId === order.driverId);
    if (existingFav) {
      existingFav.totalTripsWithUser += 1;
      favoriteSaved = existingFav;
    } else {
      const driver = drivers.find(d => d.id === order.driverId);
      favoriteSaved = {
        id: `fav-${Date.now()}`,
        userId: order.userId,
        driverId: order.driverId,
        nicknameLabel: nicknameLabel || `Mitra ${driver ? driver.name : 'Langganan'}`,
        notes: notes || 'Driver favorit andalan saya',
        isAutoDispatchPreferred: true,
        totalTripsWithUser: 1,
        createdAt: new Date().toISOString()
      };
      favoriteDrivers.push(favoriteSaved);
    }
  }

  return res.json({
    success: true,
    message: addToFavorites
      ? 'Terima kasih atas ulasan Anda! Driver ini telah disimpan ke daftar Driver Langganan.'
      : 'Terima kasih atas ulasan bintang Anda!',
    data: {
      rating: newRating,
      favorite: favoriteSaved
    }
  });
};
