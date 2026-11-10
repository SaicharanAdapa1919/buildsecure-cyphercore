import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import budgetRoutes from './routes/budgets.js';
import dashboardRoutes from './routes/dashboard.js';
import aiRoutes from './routes/ai.js';
import reportRoutes from './routes/reports.js';
import { notFound, errorHandler } from './middleware/error.js';
import { enforceBrowserOrigin, requireSecureConfig } from './middleware/security.js';

dotenv.config();
requireSecureConfig();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://buildsecure-frontend.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
].filter(Boolean);

const mutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: (req) => req.method === 'GET' || req.path.startsWith('/api/auth'),
  message: { success: false, message: 'Too many requests. Please slow down and try again later.' }
});

app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === 'true');

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(enforceBrowserOrigin);
app.use(express.json({ limit: '50kb', strict: true }));
app.use(mutationLimiter);

app.get('/', (req, res) => res.json({ success: true, service: 'FinTrack API', status: 'healthy' }));
app.get('/health', (req, res) => res.json({ success: true, service: 'FinTrack API' }));
app.get('/api/health', (req, res) => res.json({ success: true, service: 'FinTrack API' }));

// Mount routes on /api
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);

// Also mount routes on root in case Vercel rewrites strip /api prefix
app.use('/auth', authRoutes);
app.use('/transactions', transactionRoutes);
app.use('/budgets', budgetRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/ai', aiRoutes);
app.use('/reports', reportRoutes);

app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`FinTrack API listening on port ${PORT}`);
  });
}

export default app;
