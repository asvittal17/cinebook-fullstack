import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import movieRoutes from './routes/movieRoutes.js';
import theaterRoutes from './routes/theaterRoutes.js';
import showRoutes from './routes/showRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import tmdbRoutes from './routes/tmdbRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import connectDB from './config/db.js';
import Theater from './models/Theater.js';

dotenv.config();

const startServer = async () => {
  await connectDB();
  
  // Clean up problematic 2dsphere index from old theaters
  try {
    await Theater.collection.dropIndex('location_2dsphere').catch(() => {});
    await Theater.updateMany({}, { $unset: { location: "" } });
    console.log('✅ Cleaned up old theater indexes');
  } catch (e) {
    // Ignore if no indexes to drop
  }
  
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
  app.use(express.json());

  app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'CineBook API running' }));

  app.use('/api/tmdb', tmdbRoutes);
  app.use('/api/shows', showRoutes);
  app.use('/api/movies', movieRoutes);
  app.use('/api/theaters', theaterRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/payment', paymentRoutes);

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => console.log(`🚀 CineBook server running on port ${PORT}`));
};

startServer();