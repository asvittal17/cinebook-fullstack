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
  try {
    // ✅ Connect Database
    await connectDB();

    // ✅ Cleanup old indexes
    try {
      await Theater.collection.dropIndex('location_2dsphere').catch(() => {});
      await Theater.updateMany({}, { $unset: { location: "" } });
      console.log('✅ Cleaned up old theater indexes');
    } catch (e) {
      console.log('⚠️ Index cleanup skipped');
    }

    const app = express();

    // ✅ TRUST PROXY (important for Render)
    app.set('trust proxy', 1);

    // ✅ CORS CONFIG (FINAL FIX)
    const corsOptions = {
      origin: function (origin, callback) {
        // Allow requests with no origin (Postman, mobile apps)
        if (!origin) return callback(null, true);

        // Allow localhost (development)
        if (
          origin.includes("localhost") ||
          origin.includes("127.0.0.1")
        ) {
          return callback(null, true);
        }

        // ✅ Allow ALL Vercel deployments (FIXES YOUR ISSUE)
        if (origin.endsWith(".vercel.app")) {
          return callback(null, true);
        }

        // ❌ Block other origins
        return callback(new Error("Not allowed by CORS: " + origin));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization"
      ]
    };

    app.use(cors(corsOptions));

    // ✅ Proper preflight handling
    app.options('*', cors(corsOptions));

    // ✅ Body parser
    app.use(express.json());

    // ✅ Root route
    app.get('/', (req, res) => {
      res.json({
        status: 'ok',
        message: 'CineBook API is running',
        endpoints: {
          health: '/api/health',
          tmdb: '/api/tmdb/*',
          theaters: '/api/theaters/*',
          shows: '/api/shows/*',
          movies: '/api/movies/*',
          bookings: '/api/bookings/*',
          payment: '/api/payment/*'
        }
      });
    });

    // ✅ Health route
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        message: 'CineBook API running'
      });
    });

    // ✅ Routes
    app.use('/api/tmdb', tmdbRoutes);
    app.use('/api/shows', showRoutes);
    app.use('/api/movies', movieRoutes);
    app.use('/api/theaters', theaterRoutes);
    app.use('/api/bookings', bookingRoutes);
    app.use('/api/payment', paymentRoutes);

    // ✅ Global Error Handler
    app.use((err, req, res, next) => {
      console.error('❌ Server Error:', err.message);

      // Handle CORS errors specifically
      if (err.message.includes("CORS")) {
        return res.status(403).json({
          success: false,
          message: err.message
        });
      }

      res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
      });
    });

    // ✅ Start server
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 CineBook server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
  }
};

startServer();