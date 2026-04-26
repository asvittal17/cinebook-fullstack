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

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://cinebook-fullstack-giqtgp63i-asvittal17s-projects.vercel.app',
  'https://cinebook-fullstack.vercel.app',
];

const startServer = async () => {
  await connectDB();
  
  try {
    await Theater.collection.dropIndex('location_2dsphere').catch(() => {});
    await Theater.updateMany({}, { $unset: { location: "" } });
    console.log('✅ Cleaned up old theater indexes');
  } catch (e) {}

  const app = express();

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));
  app.use(express.json());

  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      message: 'CineBook API is running',
      endpoints: {
        health: '/api/health',
        tmdb: '/api/tmdb/*',
        theaters: '/api/theaters/*',
        shows: '/api/shows/*',
        bookings: '/api/bookings/*',
        payment: '/api/payment/*'
      }
    });
  });

  app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'CineBook API running' }));

  app.use('/api/tmdb', tmdbRoutes);
  app.use('/api/shows', showRoutes);
  app.use('/api/movies', movieRoutes);
  app.use('/api/theaters', theaterRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/payment', paymentRoutes);

  app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
      return res.status(403).json({ success: false, message: 'CORS not allowed' });
    }
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => console.log(`🚀 CineBook server running on port ${PORT}`));
};

startServer();