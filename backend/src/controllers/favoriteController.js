const { favoriteDrivers, drivers } = require('../services/orderStore');

// 1. Ambil daftar driver favorit pengguna
exports.getFavoriteDrivers = (req, res) => {
  const { userId } = req.params;

  const userFavs = favoriteDrivers
    .filter(f => f.userId === userId)
    .map(fav => {
      const driver = drivers.find(d => d.id === fav.driverId);
      return {
        ...fav,
        driver: driver || null
      };
    })
    .filter(f => f.driver !== null);

  return res.json({
    success: true,
    data: userFavs
  });
};

// 2. Tambahkan driver ke daftar favorit / langganan
exports.addFavoriteDriver = (req, res) => {
  const { userId } = req.params;
  const { driverId, nicknameLabel, notes, isAutoDispatchPreferred = true } = req.body;

  if (!driverId) {
    return res.status(400).json({ success: false, message: 'driverId wajib diisi!' });
  }

  const driverExists = drivers.find(d => d.id === driverId);
  if (!driverExists) {
    return res.status(404).json({ success: false, message: 'Driver tidak ditemukan' });
  }

  const existing = favoriteDrivers.find(f => f.userId === userId && f.driverId === driverId);
  if (existing) {
    existing.nicknameLabel = nicknameLabel || existing.nicknameLabel;
    existing.notes = notes || existing.notes;
    existing.isAutoDispatchPreferred = isAutoDispatchPreferred;
    return res.json({
      success: true,
      message: 'Data driver favorit berhasil diperbarui',
      data: existing
    });
  }

  const newFavorite = {
    id: `fav-${Date.now()}`,
    userId,
    driverId,
    nicknameLabel: nicknameLabel || `Mitra Langganan (${driverExists.name})`,
    notes: notes || 'Driver andalan PaWuss',
    isAutoDispatchPreferred,
    totalTripsWithUser: 1,
    createdAt: new Date().toISOString()
  };

  favoriteDrivers.push(newFavorite);

  return res.status(201).json({
    success: true,
    message: `Driver ${driverExists.name} berhasil ditambahkan ke Driver Langganan!`,
    data: {
      ...newFavorite,
      driver: driverExists
    }
  });
};

// 3. Hapus driver dari daftar favorit
exports.removeFavoriteDriver = (req, res) => {
  const { userId, driverId } = req.params;

  const index = favoriteDrivers.findIndex(f => f.userId === userId && f.driverId === driverId);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Driver langganan tidak ditemukan' });
  }

  const removed = favoriteDrivers.splice(index, 1);
  return res.json({
    success: true,
    message: 'Driver berhasil dihapus dari daftar langganan',
    data: removed[0]
  });
};
