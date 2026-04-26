import express from 'express';
import { createBooking, confirmBooking, getUserBookings, getAllBookings, cancelBooking, getAnalytics } from '../controllers/bookingController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', createBooking);
router.post('/confirm', confirmBooking);
router.get('/my', getUserBookings);
router.get('/all', getAllBookings);
router.get('/analytics', getAnalytics);
router.patch('/:id/cancel', cancelBooking);

export default router;