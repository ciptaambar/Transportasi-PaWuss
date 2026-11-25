# 🐾 PaWuss - Online Transportation & Delivery Super-App

Aplikasi Super-App transportasi online (ojek/mobil) dan pesan-antar makanan berbasis **Node.js Express + Socket.io** di backend dan **React + Tailwind CSS** di frontend.

## 1. Arsitektur Sistem & Direktori Proyek

```
GreenPaWuss/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # Koneksi database / mock in-memory fallback
│   │   │   └── pricing.js           # Konfigurasi tarif per KM, base fare, surge
│   │   ├── controllers/
│   │   │   ├── orderController.js   # Handler pemesanan, kalkulasi tarif, status
│   │   │   └── driverController.js  # Handler manajemen mitra driver
│   │   ├── services/
│   │   │   ├── fareService.js       # Algoritma perhitungan tarif & jarak (Haversine)
│   │   │   ├── matchingService.js   # Algoritma pencarian driver terdekat (Radius filter)
│   │   │   └── orderStore.js        # Data store (sync dengan database / state)
│   │   ├── sockets/
│   │   │   └── socketHandler.js     # WebSocket event handler (lokasi, tracking, dispatch)
│   │   ├── routes/
│   │   │   ├── orderRoutes.js       # Endpoint REST API Orders
│   │   │   └── driverRoutes.js      # Endpoint REST API Drivers
│   │   └── server.js                # Entry point Express + HTTP + Socket.io Server
│   ├── db/
│   │   └── schema.sql               # Skema PostgreSQL DDL lengkap
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Navigasi & switch mode (User / Driver)
│   │   │   ├── UserBooking.jsx      # Form pemesanan, pilih rute & estimasi biaya
│   │   │   ├── DriverDashboard.jsx  # Panel mitra: order masuk, toggle online, kontrol status
│   │   │   ├── OrderTracker.jsx     # Live tracking order & status timeline
│   │   │   ├── LiveMapSimulation.jsx# Visualisasi peta koordinat & pergerakan driver
│   │   │   └── RatingModal.jsx      # Modal ulasan & rating bintang
│   │   ├── services/
│   │   │   ├── api.js               # Axios / Fetch client
│   │   │   └── socket.js            # Socket.io client singleton
│   │   ├── App.jsx                  # Root state & view orchestration
│   │   ├── main.jsx                 # Entry point React
│   │   └── index.css                # Tailwind CSS direct entry
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```
