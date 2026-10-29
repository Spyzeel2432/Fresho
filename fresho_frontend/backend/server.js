import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import reviewRoutes from './routes/reviews.js';

for (const key of ['MONGODB_URI', 'JWT_SECRET']) {
  if (!process.env[key]) throw new Error(`${key} is required. Copy .env.example to .env and configure it.`);
}

const app = express();
const configuredOrigins = (process.env.CLIENT_ORIGIN || '').split(',').map(origin => origin.trim()).filter(Boolean);
const localDevelopmentOrigin = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
app.use(cors({
  origin(origin, callback) {
    const allowed = !origin || configuredOrigins.includes(origin) || (process.env.NODE_ENV !== 'production' && localDevelopmentOrigin.test(origin));
    callback(null, allowed);
  }
}));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use((error, _req, res, _next) => {
  if (error.name === 'ValidationError') return res.status(400).json({ message: Object.values(error.errors).map(item => item.message).join(' ') });
  if (error.code === 11000) return res.status(409).json({ message: 'That record already exists.' });
  console.error(error);
  return res.status(500).json({ message: 'Something went wrong on the server.' });
});

const port = Number(process.env.PORT || 5000);
await mongoose.connect(process.env.MONGODB_URI);
app.listen(port, () => console.log(`Fresho API listening on http://localhost:${port}`));
