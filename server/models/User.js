import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  imageUrl: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: { type: String },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
