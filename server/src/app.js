require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helper to register routes on both /api/path and /path so serverless rewrites never fail
const registerSubroutes = (prefix, router) => {
  app.use(`/api${prefix}`, router);
  app.use(prefix, router);
};

// Health Check
const healthHandler = (req, res) => {
  res.json({
    status: 'ONLINE',
    network: 'NEWS24 NETWORK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// API Routes
registerSubroutes('/auth', authRoutes);
registerSubroutes('/news', newsRoutes);
registerSubroutes('/cms', cmsRoutes);
registerSubroutes('/workflow', workflowRoutes);
registerSubroutes('/subscriptions', subscriptionRoutes);
registerSubroutes('/admin', adminRoutes);

// Serve Frontend client build if dist exists (for standalone local running)
const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err.stack || err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

module.exports = app;
