import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import nutritionRoutes from './routes/nutrition.js';
import aiRoutes from './routes/ai.js';
import pdfRoutes from './routes/pdf.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// ── Database ──────────────────────────────────────────────────────────────────
connectDB();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again after 15 minutes.' }
});
app.use('/api/', limiter);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:4200').split(',');
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── Request parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/pdf', pdfRoutes);

app.get('/health', (_req, res) =>
  res.json({ status: 'OK', message: 'AI Nutrition Dashboard API', version: '1.0.0', timestamp: new Date() })
);

app.get('/', (_req, res) =>
  res.json({ message: 'AI Nutrition Dashboard API', endpoints: ['/api/auth', '/api/nutrition', '/api/ai', '/api/pdf'] })
);

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
);

export default app;
