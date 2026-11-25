const { orders, drivers } = require('../services/orderStore');
const { findNearestDrivers } = require('../services/matchingService');
const { calculateHaversineDistance } = require('../services/fareService');

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 [Socket.io] Client connected: ${socket.id}`);

    // Bergabung ke channel pesanan tertentu
    socket.on('join:order', ({ orderId, role }) => {
      socket.join(`order:${orderId}`);
      console.log(`👤 ${role || 'User'} bergabung ke room order:${orderId}`);
    });

    // Driver memperbarui lokasi GPS secara berkala
    socket.on('driver:update_location', ({ driverId, orderId, lat, lng }) => {
      const driver = drivers.find(d => d.id === driverId);
      if (driver) {
        driver.currentLat = parseFloat(lat);
        driver.currentLng = parseFloat(lng);
      }

      if (orderId) {
        const order = orders.find(o => o.id === orderId);
        let distanceRemaining = null;
        if (order) {
          const targetLat = order.status === 'IN_TRIP' ? order.destinationLat : order.pickupLat;
          const targetLng = order.status === 'IN_TRIP' ? order.destinationLng : order.pickupLng;
          distanceRemaining = calculateHaversineDistance(lat, lng, targetLat, targetLng);
        }

        io.to(`order:${orderId}`).emit('order:driver_location', {
          driverId,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          distanceRemainingKm: distanceRemaining,
          updatedAt: new Date().toISOString()
        });
      }
    });

    // Driver menerima pesanan yang sedang mencari driver
    socket.on('driver:accept_order', ({ driverId, orderId }) => {
      const order = orders.find(o => o.id === orderId);
      const driver = drivers.find(d => d.id === driverId);

      if (order && driver) {
        order.driverId = driver.id;
        order.driver = driver;
        order.status = 'DRIVER_ASSIGNED';
        order.matchedAt = new Date().toISOString();
        driver.isAvailable = false;

        io.to(`order:${orderId}`).emit('order:status_update', {
          orderId,
          status: 'DRIVER_ASSIGNED',
          driver: {
            id: driver.id,
            name: driver.name,
            phone: driver.phone,
            ratingAvg: driver.ratingAvg,
            vehicle: driver.vehicle,
            currentLat: driver.currentLat,
            currentLng: driver.currentLng
          },
          message: `Driver ${driver.name} telah menerima pesanan!`
        });
      }
    });

    // Update status siklus perjalanan (Mencari -> Menjemput -> Dalam Perjalanan -> Selesai)
    socket.on('order:change_status', ({ orderId, newStatus }) => {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        order.status = newStatus;
        if (newStatus === 'PICKING_UP') order.pickedUpAt = new Date().toISOString();
        if (newStatus === 'COMPLETED') {
          order.completedAt = new Date().toISOString();
          order.payment.status = 'SETTLED';
          if (order.driver) {
            order.driver.isAvailable = true;
            order.driver.totalTrips += 1;
          }
        }

        io.to(`order:${orderId}`).emit('order:status_update', {
          orderId,
          status: newStatus,
          order
        });
      }
    });

    // Simulasi Otomatis Siklus Pesanan PaWuss (Full Lifecycle Simulator)
    socket.on('simulate:run_trip', async ({ orderId }) => {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      // 1. Cari driver terdekat otomatis jika belum di-assign
      if (!order.driverId) {
        let assignedDriver = null;

        // Cek jika pengguna memilih preferred driver khusus
        if (order.preferredDriverId) {
          assignedDriver = drivers.find(d => d.id === order.preferredDriverId && d.isOnline);
        }

        // Jika tidak, cari berdasarkan prioritas driver favorit & radius terdekat
        if (!assignedDriver) {
          const eligible = findNearestDrivers(order.pickupLat, order.pickupLng, order.serviceType, 10, order.userId);
          assignedDriver = eligible[0] || drivers[0];
        }

        order.driverId = assignedDriver.id;
        order.driver = assignedDriver;
        order.status = 'DRIVER_ASSIGNED';
        assignedDriver.isAvailable = false;

        const isFav = assignedDriver.isFavorite || order.preferredDriverId === assignedDriver.id;

        io.to(`order:${orderId}`).emit('order:status_update', {
          orderId,
          status: 'DRIVER_ASSIGNED',
          driver: assignedDriver,
          isFavoriteDriver: isFav,
          message: isFav
            ? `⭐ Driver Langganan Anda (${assignedDriver.name}) telah menerima pesanan!`
            : `Driver ${assignedDriver.name} ditemukan dan menerima pesanan!`
        });
      }

      const driver = order.driver;

      // Fungsi bantuan interpolasi koordinat
      const stepsCount = 6;
      const sleep = ms => new Promise(res => setTimeout(res, ms));

      // Tahap 1: Driver Menuju Titik Jemput (PICKING_UP)
      order.status = 'PICKING_UP';
      io.to(`order:${orderId}`).emit('order:status_update', {
        orderId,
        status: 'PICKING_UP',
        message: 'Driver sedang melaju menuju lokasi penjemputan Anda'
      });

      const startLat = driver.currentLat;
      const startLng = driver.currentLng;

      for (let i = 1; i <= stepsCount; i++) {
        await sleep(1200);
        const curLat = startLat + ((order.pickupLat - startLat) * i) / stepsCount;
        const curLng = startLng + ((order.pickupLng - startLng) * i) / stepsCount;
        driver.currentLat = curLat;
        driver.currentLng = curLng;

        io.to(`order:${orderId}`).emit('order:driver_location', {
          driverId: driver.id,
          lat: curLat,
          lng: curLng,
          heading: 45,
          distanceRemainingKm: calculateHaversineDistance(curLat, curLng, order.pickupLat, order.pickupLng),
          phase: 'PICKING_UP'
        });
      }

      // Tahap 2: Tiba di Titik Jemput -> Mulai Perjalanan (IN_TRIP)
      await sleep(1500);
      order.status = 'IN_TRIP';
      io.to(`order:${orderId}`).emit('order:status_update', {
        orderId,
        status: 'IN_TRIP',
        message: 'Pelanggan telah dijemput. Dalam perjalanan menuju tujuan!'
      });

      for (let i = 1; i <= stepsCount; i++) {
        await sleep(1200);
        const curLat = order.pickupLat + ((order.destinationLat - order.pickupLat) * i) / stepsCount;
        const curLng = order.pickupLng + ((order.destinationLng - order.pickupLng) * i) / stepsCount;
        driver.currentLat = curLat;
        driver.currentLng = curLng;

        io.to(`order:${orderId}`).emit('order:driver_location', {
          driverId: driver.id,
          lat: curLat,
          lng: curLng,
          heading: 90,
          distanceRemainingKm: calculateHaversineDistance(curLat, curLng, order.destinationLat, order.destinationLng),
          phase: 'IN_TRIP'
        });
      }

      // Tahap 3: Tiba di Tujuan -> Selesai (COMPLETED)
      await sleep(1500);
      order.status = 'COMPLETED';
      order.completedAt = new Date().toISOString();
      order.payment.status = 'SETTLED';
      driver.isAvailable = true;
      driver.totalTrips += 1;

      io.to(`order:${orderId}`).emit('order:status_update', {
        orderId,
        status: 'COMPLETED',
        message: 'Perjalanan selesai! Pembayaran berhasil diselesaikan.',
        order
      });
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = { registerSocketHandlers };
