import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  seats: [{
    seatNumber: String,
    row: String,
    column: Number,
    type: String,
    price: Number,
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'failed'], default: 'pending' },
  paymentIntentId: { type: String },
  paymentMethod: { type: String, enum: ['stripe', 'razorpay'], default: 'stripe' },
  bookingRef: { type: String, unique: true },
  cancellationReason: { type: String },
  cancelledAt: { type: Date },
}, { timestamps: true });

// Generate booking reference
bookingSchema.pre('save', function (next) {
  if (!this.bookingRef) {
    this.bookingRef = 'CB' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

export default mongoose.model('Booking', bookingSchema);
