// In-Memory Data Store (Kompatibel dengan Skema PostgreSQL PaWuss)
// Menyediakan state runtime yang cepat untuk real-time tracking dan simulasi

const users = [
  {
    id: 'usr-001',
    name: 'Budi Santoso',
    email: 'budi@pawuss.id',
    phone: '081234567890',
    role: 'CUSTOMER',
    walletBalance: 250000,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'usr-002',
    name: 'Siti Rahmawati',
    email: 'siti@pawuss.id',
    phone: '081298765432',
    role: 'CUSTOMER',
    walletBalance: 120000,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
  }
];

const drivers = [
  {
    id: 'drv-001',
    name: 'Agus Pratama',
    phone: '081311223344',
    ratingAvg: 4.95,
    totalTrips: 1240,
    isOnline: true,
    isAvailable: true,
    currentLat: -5.3900,  // Bandar Lampung (Kedaton)
    currentLng: 105.2550,
    vehicle: {
      type: 'MOTORCYCLE',
      brand: 'Honda',
      model: 'Vario 160',
      plateNumber: 'BE 4611 PWS',
      color: 'Hitam Hijau PaWuss'
    }
  },
  {
    id: 'drv-002',
    name: 'Rian Hidayat',
    phone: '081399887766',
    ratingAvg: 4.88,
    totalTrips: 860,
    isOnline: true,
    isAvailable: true,
    currentLat: -5.4200,  // Bandar Lampung (Enggal / Tj. Karang)
    currentLng: 105.2590,
    vehicle: {
      type: 'MOTORCYCLE',
      brand: 'Yamaha',
      model: 'NMAX 155',
      plateNumber: 'BE 3829 PAW',
      color: 'Abu-abu Metalik'
    }
  },
  {
    id: 'drv-003',
    name: 'Bambang Wijaya',
    phone: '081255443322',
    ratingAvg: 4.98,
    totalTrips: 2150,
    isOnline: true,
    isAvailable: true,
    currentLat: -5.3850,  // Bandar Lampung (Way Halim)
    currentLng: 105.2650,
    vehicle: {
      type: 'CAR',
      brand: 'Toyota',
      model: 'Avanza Veloz',
      plateNumber: 'BE 1988 WUS',
      color: 'Putih Mutiara'
    }
  }
];

const orders = [];
const ratings = [];
const favoriteDrivers = [
  {
    id: 'fav-001',
    userId: 'usr-001',
    driverId: 'drv-001',
    nicknameLabel: 'Pak Agus (Langganan Harian)',
    notes: 'Sopir ramah, helm wangi, bawa motor sangat tenang & hafal jalan tikus',
    isAutoDispatchPreferred: true,
    totalTripsWithUser: 14,
    createdAt: '2026-11-20T08:00:00Z'
  }
];

module.exports = {
  users,
  drivers,
  orders,
  ratings,
  favoriteDrivers
};
