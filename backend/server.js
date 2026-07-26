require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

// Attach socket io instance to req for use in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' })); // support larger payloads for images if base64 uploaded

// DB Connection & Seeding
connectDB().then(async (isConnected) => {
  if (isConnected) {
    try {
      const adminEmail = 'sashikn1429@gmail.com';
      const existingAdmin = await User.findOne({ email: adminEmail });
      if (!existingAdmin) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('sashika14*', salt);
        await User.create({
          name: 'Super Admin',
          email: adminEmail,
          password: hashedPassword,
          phone: '9999999999',
          role: 'admin'
        });
        console.log('✅ Default Admin Account Seeded (sashikn1429@gmail.com)');
      } else {
        // Ensure role is admin
        if (existingAdmin.role !== 'admin') {
          existingAdmin.role = 'admin';
          await existingAdmin.save();
          console.log('✅ Default Admin Account role updated to ADMIN');
        } else {
          console.log('✅ Default Admin Account already exists');
        }
      }
    } catch (err) {
      console.error('❌ Failed to seed default admin:', err.message);
    }
  }
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'CivicSync AI Core API Server',
    databaseMode: 'MongoDB Atlas'
  });
});

// Routes Mount
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 CivicSync Express server running on port ${PORT}`);
  console.log(`📡 Health Check URL: http://localhost:${PORT}/api/health`);
});
