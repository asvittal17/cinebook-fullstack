import Stripe from 'stripe';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import { createRazorpayOrder, verifyRazorpayPayment } from '../utils/razorpay.js';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const razorpay = process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID : null;

// Demo booking storage (when no DB)
const demoBookings = new Map();
let demoBookingId = 1;

export const createBooking = async (req, res) => {
  try {
    const { showId, seatNumbers, paymentMethod } = req.body;
    const userId = req.user?._id || 'demo-user';

    const totalAmount = seatNumbers.length * 250; // Default ₹250 per ticket

    let clientSecret = null;
    let orderId = null;
    let paymentIntentId = null;

    // Use Razorpay if configured
    if (paymentMethod === 'razorpay' && process.env.RAZORPAY_SECRET) {
      const order = await createRazorpayOrder({ amount: totalAmount, showId, userId, seatNumbers });
      orderId = order.id;
      paymentIntentId = order.id;
    } else if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount * 100,
        currency: 'inr',
        metadata: { showId, userId, seats: seatNumbers.join(',') },
      });
      clientSecret = paymentIntent.client_secret;
      paymentIntentId = paymentIntent.id;
    }

    // Create pending booking (demo mode if no DB)
    const bookingData = {
      _id: `demo-${demoBookingId++}`,
      user: userId,
      show: showId,
      seats: seatNumbers.map(sn => ({ seatNumber: sn, row: sn[0], column: parseInt(sn.slice(1)), type: 'Standard', price: 250 })),
      totalAmount,
      status: 'pending',
      paymentIntentId,
      createdAt: new Date(),
    };

    demoBookings.set(bookingData._id, bookingData);

    res.json({ success: true, data: { booking: bookingData, clientSecret, orderId, razorpayKeyId: razorpay } });
  } catch (error) {
    console.error('Booking error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmBooking = async (req, res) => {
  try {
    const { bookingId, paymentIntentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const booking = demoBookings.get(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // For demo without payment verification
    booking.status = 'confirmed';
    booking.confirmedAt = new Date();
    demoBookings.set(bookingId, booking);

    res.json({ success: true, data: booking, message: 'Booking confirmed!' });
  } catch (error) {
    console.error('Confirm error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user?._id || 'demo-user';
    const userBookings = Array.from(demoBookings.values()).filter(b => b.user === userId);
    res.json({ success: true, data: userBookings });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = Array.from(demoBookings.values());
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = demoBookings.get(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    demoBookings.set(id, booking);

    res.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const confirmed = Array.from(demoBookings.values()).filter(b => b.status === 'confirmed');
    const totalRevenue = confirmed.reduce((sum, b) => sum + b.totalAmount, 0);
    
    res.json({ success: true, data: { 
      totalBookings: confirmed.length, 
      totalRevenue,
      revenueByMonth: [],
      topMovies: []
    }});
  } catch (error) {
    res.json({ success: true, data: { totalBookings: 0, totalRevenue: 0, revenueByMonth: [], topMovies: [] }});
  }
};