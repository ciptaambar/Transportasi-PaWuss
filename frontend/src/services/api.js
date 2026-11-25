const API_BASE = 'http://localhost:5000/api';

export async function getFareEstimate(params) {
  const res = await fetch(`${API_BASE}/orders/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return res.json();
}

export async function createOrder(payload) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function submitRating(orderId, ratingData) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/rate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ratingData)
  });
  return res.json();
}

export async function getDrivers() {
  const res = await fetch(`${API_BASE}/drivers`);
  return res.json();
}

export async function toggleDriverOnline(driverId) {
  const res = await fetch(`${API_BASE}/drivers/${driverId}/toggle-online`, {
    method: 'PATCH'
  });
  return res.json();
}

export async function getFavoriteDrivers(userId = 'usr-001') {
  const res = await fetch(`${API_BASE}/users/${userId}/favorites`);
  return res.json();
}

export async function addFavoriteDriver(userId = 'usr-001', payload) {
  const res = await fetch(`${API_BASE}/users/${userId}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function removeFavoriteDriver(userId = 'usr-001', driverId) {
  const res = await fetch(`${API_BASE}/users/${userId}/favorites/${driverId}`, {
    method: 'DELETE'
  });
  return res.json();
}
