const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const orderRoutes = require('./routes/orderRoutes');
const driverRoutes = require('./routes/driverRoutes');
const userRoutes = require('./routes/userRoutes');
const { registerSocketHandlers } = require('./sockets/socketHandler');

const app = express();
const server = http.createServer(app);

// Inisialisasi Socket.io dengan CORS terbuka untuk local development
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'PaWuss Super-App Backend API',
    timestamp: new Date().toISOString()
  });
});

// Registrasi WebSocket Handlers
registerSocketHandlers(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🐾 PaWuss Backend Server running on port ${PORT}`);
  console.log(`📡 WebSocket ready on ws://localhost:${PORT}`);
  console.log(`🚀 REST API available at http://localhost:${PORT}/api`);
  console.log(`===============================================`);
});
