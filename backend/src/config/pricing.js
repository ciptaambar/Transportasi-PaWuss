// Konfigurasi Tarif PaWuss Super-App
module.exports = {
  PRICING: {
    PAWUSS_RIDE: {
      name: 'PaWuss Ride (Motor)',
      baseFare: 10000,       // Tarif minimum (termasuk 2 KM pertama)
      baseDistanceKm: 2.0,
      perKmRate: 2500,       // Tarif per KM setelah jarak dasar
      platformFee: 2000,     // Biaya jasa aplikasi
      averageSpeedKmH: 30    // Estimasi kecepatan rata-rata motor (km/jam)
    },
    PAWUSS_CAR: {
      name: 'PaWuss Car (Mobil)',
      baseFare: 18000,
      baseDistanceKm: 2.0,
      perKmRate: 4500,
      platformFee: 3000,
      averageSpeedKmH: 25
    },
    PAWUSS_FOOD: {
      name: 'PaWuss Food (Pesan-Antar)',
      baseFare: 9000,
      baseDistanceKm: 2.0,
      perKmRate: 2200,
      platformFee: 2500,
      averageSpeedKmH: 28
    }
  }
};
