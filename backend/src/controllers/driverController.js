const { drivers, orders } = require('../services/orderStore');

exports.getDrivers = (req, res) => {
  res.json({ success: true, data: drivers });
};

exports.toggleOnlineStatus = (req, res) => {
  const { driverId } = req.params;
  const driver = drivers.find(d => d.id === driverId);

  if (!driver) {
    return res.status(404).json({ success: false, message: 'Driver tidak ditemukan' });
  }

  driver.isOnline = !driver.isOnline;
  return res.json({
    success: true,
    message: `Status driver ${driver.name} diubah menjadi: ${driver.isOnline ? 'ONLINE' : 'OFFLINE'}`,
    data: driver
  });
};

exports.updateDriverLocation = (req, res) => {
  const { driverId } = req.params;
  const { lat, lng } = req.body;

  const driver = drivers.find(d => d.id === driverId);
  if (!driver) {
    return res.status(404).json({ success: false, message: 'Driver tidak ditemukan' });
  }

  driver.currentLat = parseFloat(lat);
  driver.currentLng = parseFloat(lng);

  return res.json({ success: true, data: driver });
};
