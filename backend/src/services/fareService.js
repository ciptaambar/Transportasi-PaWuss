const { PRICING } = require('../config/pricing');

/**
 * Menghitung jarak antara dua koordinat GPS menggunakan formula Haversine (hasil dalam KM).
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius bumi dalam kilometer
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round 2 desimal
  return Math.round(distance * 100) / 100;
}

/**
 * Menghitung rincian tarif dan durasi perjalanan
 */
function calculateFare(serviceType, distanceKm) {
  const config = PRICING[serviceType] || PRICING.PAWUSS_RIDE;
  const dist = Math.max(0.1, distanceKm);

  let distanceFare = 0;
  if (dist > config.baseDistanceKm) {
    const extraKm = dist - config.baseDistanceKm;
    distanceFare = Math.round(extraKm * config.perKmRate);
  }

  const baseFare = config.baseFare;
  const platformFee = config.platformFee;
  const totalFare = baseFare + distanceFare + platformFee;

  // Estimasi durasi dalam menit (+ 5 menit buffer penjemputan/lampu merah)
  const travelDurationMins = Math.ceil((dist / config.averageSpeedKmH) * 60) + 5;

  return {
    serviceType,
    serviceName: config.name,
    distanceKm: dist,
    estimatedDurationMins: travelDurationMins,
    baseFare,
    distanceFare,
    platformFee,
    totalFare
  };
}

module.exports = {
  calculateHaversineDistance,
  calculateFare
};
