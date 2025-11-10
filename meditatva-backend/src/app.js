const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import configurations and middleware
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const meditationRoutes = require('./routes/meditation');
const sessionRoutes = require('./routes/session');
const aiRoutes = require('./routes/ai');
const communityRoutes = require('./routes/community');
const { router: medicineRequestRoutes, initializeController } = require('./routes/medicineRequest');

// Import Socket.io handler
const SocketHandler = require('./socket/socketHandler');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:8080",
      "http://localhost:8081",
      "https://effective-yodel-9prqww454rjhxx5r-8080.app.github.dev",
      "https://effective-yodel-9prqww454rjhxx5r-5173.app.github.dev",
      "https://effective-yodel-9prqww454rjhxx5r-3000.app.github.dev"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Trust proxy for Codespaces/deployment
app.set('trust proxy', true);

// Security middleware
app.use(helmet());
// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:8081',
    'https://effective-yodel-9prqww454rjhxx5r-8080.app.github.dev',
    'https://effective-yodel-9prqww454rjhxx5r-5173.app.github.dev',
    'https://effective-yodel-9prqww454rjhxx5r-3000.app.github.dev',
    /^https:\/\/.*\.app\.github\.dev$/,
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Meditatva Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meditations', meditationRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/community', communityRoutes);

// Initialize Socket.IO handler
const socketHandler = new SocketHandler(io);

// Initialize medicine request routes with socket handler
const medicineRoutes = initializeController(socketHandler);
app.use('/api/medicine-requests', medicineRoutes);

// Global error handler
app.use(errorHandler);

// Socket.IO is now handled by SocketHandler class
// The socketHandler instance manages all real-time events

// 404 handler - must be at the end
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Make io available in controllers
app.set('io', io);

const PORT = process.env.PORT || 5000;
const HOST = process.env.NODE_ENV === 'development' ? '0.0.0.0' : 'localhost';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Meditatva Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (HOST === '0.0.0.0') {
    console.log(`🔗 Codespaces URL: https://${process.env.CODESPACE_NAME}-${PORT}.app.github.dev`);
  }
});

module.exports = app;