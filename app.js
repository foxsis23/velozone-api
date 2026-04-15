import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';

import { configurePassport } from './src/config/passport.js';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import { apiRateLimiter } from './src/middleware/rateLimiter.js';
import logger from './src/utils/logger.js';

configurePassport();

const app = express();

// ─── Core middleware ──────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// ─── Rate limiting ────────────────────────────────────────────────────────────

app.use('/api/', apiRateLimiter);

// ─── Request logging ──────────────────────────────────────────────────────────

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path} — ${req.ip}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// OAuth callback page (показує токени після Google login)
app.get('/oauth/callback', (req, res) => {
  const { accessToken, refreshToken } = req.query;
  res.send(`
    <html><body style="font-family:monospace;padding:2rem">
      <h2>OAuth Login Successful</h2>
      <p><b>Access Token:</b><br><textarea rows="3" cols="80">${accessToken || ''}</textarea></p>
      <p><b>Refresh Token:</b><br><input value="${refreshToken || ''}" size="60"/></p>
      <p>Use the Access Token as <code>Authorization: Bearer &lt;token&gt;</code></p>
    </body></html>
  `);
});

// ─── 404 handler ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  logger.error(`Unhandled error: ${err.message}`, err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

export default app;
