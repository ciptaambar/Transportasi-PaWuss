const { drivers, favoriteDrivers } = require('./orderStore');
const { calculateHaversineDistance } = require('./fareService');

/**
 * Mencari mitra driver terdekat berdasarkan radius, tipe layanan,
 * dan prioritas Driver Langganan / Favorit milik pengguna.
 */
function findNearestDrivers(pickupLat, pickupLng, serviceType, maxRadiusKm = 10, userId = null) {
  const targetVehicleType = serviceType === 'PAWUSS_CAR' ? 'CAR' : 'MOTORCYCLE';

  // Ambil daftar driver favorit pengguna jika userId diberikan
  const userFavs = userId ? favoriteDrivers.filter(f => f.userId === userId) : [];
  const favDriverMap = new Map();
  userFavs.forEach(f => favDriverMap.set(f.driverId, f));

  const eligibleDrivers = drivers
    .filter(d => d.isOnline && d.isAvailable && d.vehicle.type === targetVehicleType)
    .map(driver => {
      const distanceToPickup = calculateHaversineDistance(
        pickupLat,
        pickupLng,
        driver.currentLat,
        driver.currentLng
      );

      const favData = favDriverMap.get(driver.id);
      const isFavorite = !!favData;

      return {
        ...driver,
        distanceToPickupKm: distanceToPickup,
        estimatedArrivalMins: Math.max(1, Math.ceil((distanceToPickup / 30) * 60)),
        isFavorite,
        favoriteInfo: favData ? {
          nicknameLabel: favData.nicknameLabel,
          notes: favData.notes,
          isAutoDispatchPreferred: favData.isAutoDispatchPreferred,
          totalTripsWithUser: favData.totalTripsWithUser
        } : null
      };
    })
    .filter(d => d.distanceToPickupKm <= maxRadiusKm)
    .sort((a, b) => {
      // Prioritas 1: Jika merupakan Driver Favorit & preferensi auto-dispatch aktif
      const aIsPreferredFav = a.isFavorite && a.favoriteInfo?.isAutoDispatchPreferred;
      const bIsPreferredFav = b.isFavorite && b.favoriteInfo?.isAutoDispatchPreferred;

      if (aIsPreferredFav && !bIsPreferredFav) return -1;
      if (!aIsPreferredFav && bIsPreferredFav) return 1;

      // Prioritas 2: Jarak terdekat
      return a.distanceToPickupKm - b.distanceToPickupKm;
    });

  return eligibleDrivers;
}

module.exports = {
  findNearestDrivers
};
