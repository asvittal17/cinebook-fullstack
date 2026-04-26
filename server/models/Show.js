import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },
  row: { type: String, required: true },
  column: { type: Number, required: true },
  type: { type: String, enum: ['standard', 'premium', 'recliner'], default: 'standard' },
  price: { type: Number, required: true },
  status: { type: String, enum: ['available', 'locked', 'booked'], default: 'available' },
  lockedBy: { type: String }, // userId
  lockedAt: { type: Date },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
});

const showSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
  showTime: { type: Date, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD for easy querying
  screen: { type: Number, default: 1 },
  seats: [seatSchema],
  format: { type: String, enum: ['2D', '3D', 'IMAX', 'Dolby'], default: '2D' },
  language: { type: String, default: 'English' },
  isActive: { type: Boolean, default: true },
  standardPrice: { type: Number, required: true, default: 180 },
  premiumPrice: { type: Number, required: true, default: 280 },
  reclinerPrice: { type: Number, required: true, default: 450 },
}, { timestamps: true });

// Auto-generate seats on show creation
showSchema.pre('save', function (next) {
  if (this.seats.length === 0) {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const cols = 12;
    const seats = [];

    rows.forEach((row, rowIndex) => {
      for (let col = 1; col <= cols; col++) {
        let type = 'standard';
        let price = this.standardPrice;

        if (rowIndex >= 7) {
          type = 'recliner';
          price = this.reclinerPrice;
        } else if (rowIndex >= 4) {
          type = 'premium';
          price = this.premiumPrice;
        }

        seats.push({
          seatNumber: `${row}${col}`,
          row,
          column: col,
          type,
          price,
          status: 'available',
        });
      }
    });

    this.seats = seats;
  }
  next();
});

export default mongoose.model('Show', showSchema);
