const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const storeRoutes = require('./routes/storeRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { db, ensureDatabase } = require('./config/db');

function buildCorsOptions() {
  const allowedOriginEnv = process.env.CORS_ORIGIN || '*';
  if (allowedOriginEnv === '*') {
    return { origin: true, credentials: true };
  }
  const allowedList = allowedOriginEnv
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return {
    origin(origin, callback) {
      if (!origin || allowedList.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true
  };
}

function createApp() {
  const app = express();

  app.use(cors(buildCorsOptions()));
  app.use(express.json({ limit: '5mb' }));

  // Ensure DB is initialized on Vercel Serverless cold starts
  app.use(async (_req, _res, next) => {
    try {
      await ensureDatabase();
      next();
    } catch (err) {
      next(err);
    }
  });

  const healthHandler = (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Figure Verse API',
      database_mode: db.getMode(),
      vercel: Boolean(process.env.VERCEL)
    });
  };

  app.get('/api/health', healthHandler);
  app.get('/health', healthHandler);

  // Mount under /api/* (standard) and root /* (if deployed on a dedicated API subdomain)
  app.use('/api/auth', authRoutes);
  app.use('/api', storeRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/admin', adminRoutes);

  app.use('/auth', authRoutes);
  app.use('/orders', orderRoutes);
  app.use('/admin', adminRoutes);
  app.use('/', storeRoutes);

  // Serve built React frontend if available in local full-stack mode
  if (!process.env.VERCEL) {
    const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
    const clientIndex = path.join(clientDist, 'index.html');
    if (fs.existsSync(clientIndex)) {
      app.use(express.static(clientDist));
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(clientIndex);
      });
    }
  }

  return app;
}

module.exports = { createApp };
