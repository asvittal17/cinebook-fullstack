// seed.js — Run once: node seed.js
// Creates sample movies + theaters across Indian cities

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Connected to MongoDB');

const Theater = mongoose.model('Theater', new mongoose.Schema({
  name: String, city: String, address: String, state: String,
  pincode: String, totalSeats: Number, screens: Number,
  amenities: [String], isActive: Boolean,
}));

const Movie = mongoose.model('Movie', new mongoose.Schema({
  title: String, description: String, poster: String, backdrop: String,
  duration: Number, releaseDate: Date, genre: [String], language: String,
  rating: String, imdbRating: Number, director: String, isActive: Boolean,
}));

// ── Theaters ─────────────────────────────────────────────────────────────────
const theaters = [
  // Mumbai
  { name: 'PVR Juhu', city: 'Mumbai', address: 'Juhu Tara Rd, Juhu', state: 'Maharashtra', pincode: '400049', totalSeats: 120, screens: 3, amenities: ['Dolby Atmos', 'IMAX'], isActive: true },
  { name: 'INOX Nariman Point', city: 'Mumbai', address: 'Marine Lines, Nariman Point', state: 'Maharashtra', pincode: '400021', totalSeats: 150, screens: 4, amenities: ['4DX', '3D'], isActive: true },
  { name: 'Cinepolis Andheri', city: 'Mumbai', address: 'Infiniti Mall, Andheri West', state: 'Maharashtra', pincode: '400058', totalSeats: 200, screens: 5, amenities: ['Recliner', 'IMAX', 'Food Court'], isActive: true },
  // Delhi
  { name: 'PVR Select Citywalk', city: 'Delhi', address: 'Select Citywalk Mall, Saket', state: 'Delhi', pincode: '110017', totalSeats: 120, screens: 3, amenities: ['IMAX', 'Dolby Atmos'], isActive: true },
  { name: 'INOX Rajiv Chowk', city: 'Delhi', address: 'Inner Circle, Connaught Place', state: 'Delhi', pincode: '110001', totalSeats: 130, screens: 2, amenities: ['3D', 'Recliner'], isActive: true },
  { name: 'Cinepolis DLF Promenade', city: 'Delhi', address: 'DLF Promenade, Vasant Kunj', state: 'Delhi', pincode: '110070', totalSeats: 160, screens: 4, amenities: ['4DX', 'Dolby Atmos'], isActive: true },
  // Bangalore
  { name: 'PVR Forum Koramangala', city: 'Bangalore', address: 'Forum Mall, Koramangala', state: 'Karnataka', pincode: '560095', totalSeats: 130, screens: 3, amenities: ['Dolby Atmos', 'IMAX'], isActive: true },
  { name: 'INOX Garuda Mall', city: 'Bangalore', address: 'Magrath Rd, Ashok Nagar', state: 'Karnataka', pincode: '560025', totalSeats: 120, screens: 2, amenities: ['3D', 'Food Court'], isActive: true },
  // Hyderabad
  { name: 'PVR GVK One', city: 'Hyderabad', address: 'GVK One Mall, Banjara Hills', state: 'Telangana', pincode: '500034', totalSeats: 120, screens: 3, amenities: ['Dolby Atmos', 'IMAX'], isActive: true },
  { name: 'Cinepolis Manjeera', city: 'Hyderabad', address: 'Manjeera Mall, Kukatpally', state: 'Telangana', pincode: '500072', totalSeats: 180, screens: 4, amenities: ['4DX', 'Recliner'], isActive: true },
  // Chennai
  { name: 'PVR SPI Palazzo', city: 'Chennai', address: 'VR Chennai, Ambattur', state: 'Tamil Nadu', pincode: '600053', totalSeats: 120, screens: 3, amenities: ['IMAX', 'Dolby Atmos'], isActive: true },
  { name: 'AGS Cinemas Ashok Nagar', city: 'Chennai', address: '10th Avenue, Ashok Nagar', state: 'Tamil Nadu', pincode: '600083', totalSeats: 100, screens: 2, amenities: ['3D', 'Food Court'], isActive: true },
  // Pune
  { name: 'PVR Phoenix Pune', city: 'Pune', address: 'Phoenix Marketcity, Viman Nagar', state: 'Maharashtra', pincode: '411014', totalSeats: 150, screens: 4, amenities: ['IMAX', 'Recliner'], isActive: true },
  { name: 'INOX Inorbit Pune', city: 'Pune', address: 'Inorbit Mall, Wakad', state: 'Maharashtra', pincode: '411057', totalSeats: 120, screens: 3, amenities: ['Dolby Atmos', '3D'], isActive: true },
  // Kolkata
  { name: 'INOX South City', city: 'Kolkata', address: 'South City Mall, Prince Anwar Shah Rd', state: 'West Bengal', pincode: '700068', totalSeats: 130, screens: 3, amenities: ['Dolby Atmos', 'IMAX'], isActive: true },
  { name: 'Cinepolis Acropolis', city: 'Kolkata', address: 'Acropolis Mall, Kasba', state: 'West Bengal', pincode: '700107', totalSeats: 120, screens: 2, amenities: ['3D', 'Food Court'], isActive: true },
];

// ── Sample Movies ─────────────────────────────────────────────────────────────
const movies = [
  {
    title: 'Pushpa 2: The Rule',
    description: 'Pushpa Raj continues his battle against the smuggling syndicate and the corrupt police officer, taking his empire to new heights while facing an even greater threat.',
    poster: 'https://image.tmdb.org/t/p/w500/ie7TNGGW5FhBBCFiEAMFFCeVJMY.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/7HubJGjsSDg8Bk8MRBi4bfFJusp.jpg',
    duration: 179, releaseDate: new Date('2024-12-05'), genre: ['Action', 'Drama', 'Thriller'],
    language: 'Telugu', rating: 'A', imdbRating: 7.8, director: 'Sukumar', isActive: true,
  },
  {
    title: 'Kalki 2898 AD',
    description: 'Set in a dystopian future, the story revolves around Bhairava, a bounty hunter, who falls into a web of fate that connects him to the last hope of humanity.',
    poster: 'https://image.tmdb.org/t/p/w500/1cIgB2ZwO6S5DPbN0IDxODPc5N4.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/xqakNFtiqfYlsv7HJcbISFLSzrJ.jpg',
    duration: 181, releaseDate: new Date('2024-06-27'), genre: ['Sci-Fi', 'Action', 'Fantasy'],
    language: 'Telugu', rating: 'UA', imdbRating: 7.2, director: 'Nag Ashwin', isActive: true,
  },
  {
    title: 'Stree 2',
    description: 'The men of Chanderi must face a new supernatural threat while continuing to live in fear of the mysterious female ghost. A comedy horror sequel.',
    poster: 'https://image.tmdb.org/t/p/w500/y5OKIGRnrqlKfHHF0GCKJzb2nFh.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/kj29spI5TT7M7HWBRS7F4fQ9kE9.jpg',
    duration: 132, releaseDate: new Date('2024-08-15'), genre: ['Horror', 'Comedy'],
    language: 'Hindi', rating: 'UA', imdbRating: 7.5, director: 'Amar Kaushik', isActive: true,
  },
  {
    title: 'Singham Again',
    description: 'Bajirao Singham is back in this action-packed sequel, facing a new nemesis with the help of a formidable team of police officers.',
    poster: 'https://image.tmdb.org/t/p/w500/lw91hLWwgdXEKFGf8bDq0JHYcXv.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/bXCiElZKoMzRo5XsEEDTzGjUKF5.jpg',
    duration: 155, releaseDate: new Date('2024-11-01'), genre: ['Action', 'Drama'],
    language: 'Hindi', rating: 'UA', imdbRating: 6.2, director: 'Rohit Shetty', isActive: true,
  },
  {
    title: 'Devara: Part 1',
    description: 'A fearless man rules the coastal region through his power and commands the sea. Decades later his son must step into his father\'s shoes to protect the people.',
    poster: 'https://image.tmdb.org/t/p/w500/zAnzgJHQEQzJSJDpZ0kkPXJUDRJ.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/4ZRrH6X4pI76C3IqNlYl52Jg5Ri.jpg',
    duration: 166, releaseDate: new Date('2024-09-27'), genre: ['Action', 'Drama', 'Thriller'],
    language: 'Telugu', rating: 'UA', imdbRating: 6.4, director: 'Koratala Siva', isActive: true,
  },
  {
    title: 'The Sabarmati Report',
    description: 'Based on the Godhra train burning incident of 2002, the film explores the media's role in shaping public narrative around one of India's most controversial events.',
    poster: 'https://image.tmdb.org/t/p/w500/lPqoRs7tVvt4NyrmIK4V2GYbqJW.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/rOqhQVi1rM9WqbJoFHPGGjJjHXS.jpg',
    duration: 131, releaseDate: new Date('2024-11-15'), genre: ['Drama', 'Biography'],
    language: 'Hindi', rating: 'UA', imdbRating: 7.1, director: 'Dheeraj Sarna', isActive: true,
  },
];

try {
  await Theater.deleteMany({})
  await Movie.deleteMany({})
  await Theater.insertMany(theaters)
  await Movie.insertMany(movies)
  console.log(`✅ Seeded ${theaters.length} theaters and ${movies.length} movies`)
} catch (err) {
  console.error('Seed error:', err)
} finally {
  await mongoose.disconnect()
  console.log('🔌 Disconnected')
}
