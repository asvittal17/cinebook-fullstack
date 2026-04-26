import mongoose from 'mongoose';

const theaterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String },
  totalSeats: { type: Number, required: true, default: 120 },
  screens: { type: Number, default: 1 },
  amenities: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Theater', theaterSchema);
