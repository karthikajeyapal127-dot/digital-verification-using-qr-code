/**
 * Digital Verification Using QR Code - REST Backend Server
 * Technology Stack: Node.js + Express + MongoDB (Mongoose) + JWT + Bcrypt + Socket.IO
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

import express from 'express';
import http from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { connectDB, getDBStatus } from './config/db.js';
import { initSocket } from './services/socketService.js';

import User from './models/User.js';
import DigitalID from './models/DigitalID.js';
import Verification from './models/Verification.js';
import Notification from './models/Notification.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import holderRoutes from './routes/holderRoutes.js';
import credentialRoutes from './routes/credentialRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import digitalIdRoutes from './routes/digitalIdRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import qrRoutes from './routes/qrRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import recentRoutes from './routes/recentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import ledgerRoutes from './routes/ledgerRoutes.js';
import verifierStationRoutes from './routes/verifierStationRoutes.js';

import {
  scanVerification,
  verifyByToken,
  getVerificationHistory,
  getVerificationStats
} from './controllers/verificationController.js';
import { getAdminAnalytics } from './controllers/adminController.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Socket.IO for Real-Time Updates (Section 23)
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});
initSocket(io);

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  if (req.method !== 'OPTIONS') {
    console.log(`[API ${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// REST Routes: Mounted with and without /api prefix for 100% routing compatibility
const mountRoute = (prefix, router) => {
  app.use(`/api${prefix}`, router);
  app.use(prefix, router);
  app.use(`/api/api${prefix}`, router);
};

mountRoute('/auth', authRoutes);
mountRoute('/users', userRoutes);
mountRoute('/holders', holderRoutes);
mountRoute('/credentials', credentialRoutes);
mountRoute('/organizations', organizationRoutes);
mountRoute('/dashboard', dashboardRoutes);
mountRoute('/digital-id', digitalIdRoutes);
mountRoute('/digital-ids', digitalIdRoutes);
mountRoute('/verification', verificationRoutes);
mountRoute('/verifications', verificationRoutes);
mountRoute('/notifications', notificationRoutes);
mountRoute('/admin', adminRoutes);
mountRoute('/qr', qrRoutes);
mountRoute('/chatbot', chatbotRoutes);
mountRoute('/recent', recentRoutes);
mountRoute('/reports', reportRoutes);
mountRoute('/ledger', ledgerRoutes);
mountRoute('/stations', verifierStationRoutes);

// Direct Specification Routes (Section 25 / Section 7)
import { sendFeedback } from './controllers/supportController.js';
// Support feedback endpoint
app.post('/api/support/feedback', sendFeedback);
app.post('/support/feedback', sendFeedback);
app.post('/api/verify', scanVerification);
app.post('/verify', scanVerification);
app.get('/api/verify/:token', verifyByToken);
app.get('/verify/:token', verifyByToken);

// System Health Check (Returns Real MongoDB Status & Aggregations)
app.get('/api/health', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const idCount = await DigitalID.countDocuments();
    const verifCount = await Verification.countDocuments();
    const notifCount = await Notification.countDocuments();

    res.json({
      status: 'ONLINE',
      project: 'DIGITAL VERIFICATION USING QR CODE',
      stack: 'React (Vite) + Node.js + Express + MongoDB',
      database: getDBStatus(),
      realCounts: {
        users: userCount,
        digitalIDs: idCount,
        verifications: verifCount,
        notifications: notifCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.json({
      status: 'ONLINE',
      database: getDBStatus(),
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `API endpoint ${req.originalUrl} not found` });
});

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, '0.0.0.0', () => {
      console.log('================================================================');
      console.log(`🚀 DIGITAL VERIFICATION USING QR CODE Backend on Port ${PORT}`);
      console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
      console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
      console.log('================================================================');
    });
  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
};

startServer();
