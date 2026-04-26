import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  tmdbId: { type: Number, unique: true, sparse: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  poster: { type: String, required: true },
  backdrop: { type: String },
  duration: { type: Number, required: true }, // in minutes
  releaseDate: { type: Date, required: true },
  genre: [{ type: String }],
  language: { type: String, default: 'English' },
  rating: { type: String, enum: ['U', 'UA', 'A', 'S'], default: 'UA' },
  imdbRating: { type: Number, min: 0, max: 10 },
  cast: [{ name: String, role: String, image: String }],
  director: { type: String },
  isActive: { type: Boolean, default: true },
  trailerUrl: { type: String },
}, { timestamps: true });

export default mongoose.model('Movie', movieSchema);
