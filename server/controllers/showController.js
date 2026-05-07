import Show from '../models/Show.js';
import Theater from '../models/Theater.js';
import Movie from '../models/Movie.js';
import mongoose from 'mongoose';

const groupShowsByTheater = (shows) => {
  const grouped = {};
  for (const show of shows) {
    const tid = show.theater?._id?.toString() || show.theater?.toString();
    if (!grouped[tid]) {
      grouped[tid] = { theater: show.theater, shows: [] };
    }
    grouped[tid].shows.push({
      _id: show._id,
      showTime: show.showTime,
      format: show.format,
      language: show.language,
      price: show.standardPrice,
      availableSeats: show.seats?.length || 0,
      totalSeats: show.seats?.length || 100,
    });
  }
  return Object.values(grouped);
};

export const createDemoShows = async (movieId, city, date) => {
  console.log('[createDemoShows]', { movieId, city, date });
  const shows = [];
  try {
    // Find any movie
    const movie = await Movie.findOne();
    if (!movie) {
      console.log('[createDemoShows] No movies found!');
      return [];
    }
    console.log('[createDemoShows] Using movie:', movie._id, movie.title);
    
    // Always create NEW theater to get VALID ObjectId
    const cityName = city || 'Mumbai';
    const uniqueSuffix = Date.now().toString().slice(-4);
    const theater = await Theater.create({ 
      name: 'PVR ' + cityName + ' ' + uniqueSuffix,
      city: cityName,
      address: cityName + ' City Mall',
      state: 'Maharashtra',
      totalSeats: 100,
      screens: 2,
      isActive: true
    });
    console.log('[createDemoShows] Created theater with valid ObjectId:', theater._id, theater.name);
    
    const d = date || new Date().toISOString().split('T')[0];
    const hours = [10, 14.5, 19];
    const formats = ['2D', '3D', 'IMAX'];
    
    for (let i = 0; i < 3; i++) {
      const showTime = new Date(d);
      showTime.setHours(Math.floor(hours[i]), (hours[i] % 1) * 60, 0, 0);
      
      try {
        const show = await Show.create({
          movie: movie._id,
          theater: theater._id,
          showTime: showTime,
          date: d,
          format: formats[i],
          language: 'English',
          standardPrice: 150,
          premiumPrice: 250,
          reclinerPrice: 350,
          isActive: true
        });
        shows.push(show);
        console.log('[createDemoShows] Created show', i + 1, ':', show._id);
      } catch (e) {
        console.log('[createDemoShows] Show error', i + 1, ':', e.message);
      }
    }
    console.log('[createDemoShows] Total created:', shows.length);
  } catch (e) {
    console.log('[createDemoShows] Error:', e.message);
  }
  return shows;
};

export const getShowsByMovie = async (req, res) => {
  const { movieId } = req.params;
  const { date, city } = req.query;
  const queryDate = date || new Date().toISOString().split('T')[0];
  const useCity = city || 'Mumbai';

  // Try database first
  let shows = [];

// ✅ Only query MongoDB for valid ObjectIds
if (mongoose.Types.ObjectId.isValid(movieId)) {
  shows = await Show.find({
    movie: movieId,
    date: queryDate,
    isActive: true
  })
    .populate('theater', 'name city')
    .sort({ showTime: 1 });
}

  // If nothing in DB, try to create
// If nothing in DB, try to create
if (shows.length === 0) {

  const created = await createDemoShows(
    movieId,
    useCity,
    queryDate
  );

  if (
    created.length > 0 &&
    mongoose.Types.ObjectId.isValid(movieId)
  ) {

    shows = await Show.find({
      movie: movieId,
      date: queryDate,
      isActive: true
    })
      .populate('theater', 'name city')
      .sort({ showTime: 1 });

  }

}

  // FINAL FALLBACK: If still nothing, return hardcoded demo data
  if (shows.length === 0) {
    let movie = null;

// ✅ Only query MongoDB for valid ObjectIds
if (
  movieId &&
  movieId.length === 24 &&
  !movieId.startsWith('fallback-')
) {
  movie = await Movie.findById(movieId);
}
    const theaterName = `PVR ${useCity}`;
    const demoData = [
      {
        _id: 'demo-show-1-' + Date.now(),
        showTime: new Date(`${queryDate}T10:00:00.000Z`),
        format: '2D',
        language: 'English',
        standardPrice: 150,
        availableSeats: 100,
        totalSeats: 100
      },
      {
        _id: 'demo-show-2-' + Date.now(),
        showTime: new Date(`${queryDate}T14:30:00.000Z`),
        format: '3D',
        language: 'English',
        standardPrice: 200,
        availableSeats: 100,
        totalSeats: 100
      },
      {
        _id: 'demo-show-3-' + Date.now(),
        showTime: new Date(`${queryDate}T19:00:00.000Z`),
        format: 'IMAX',
        language: 'English',
        standardPrice: 350,
        availableSeats: 100,
        totalSeats: 100
      }
    ];
    
    const grouped = {
      'demo-theater': {
        theater: { _id: 'demo-theater', name: theaterName, city: useCity },
        shows: demoData
      }
    };
    
    console.log('[getShowsByMovie] Returning hardcoded demo data for movie:', movieId);
    return res.json({ success: true, data: Object.values(grouped), date: queryDate, isDemo: true });
  }

  res.json({ success: true, data: groupShowsByTheater(shows), date: queryDate });
};

export const getShowById = async (req, res) => {
  try {
    const { id } = req.params;
    let show = null;
    
    // Check for demo ID first (don't use Show.findById for demo IDs - it throws CastError)
    if (id.startsWith('demo-')) {
      const parts = id.split('-');
      const showNum = parseInt(parts[2]) || 1;
      
      // Map show number to time slot: 1=10:00, 2=14:30, 3=19:00
      const timeSlots = { 1: 10, 2: 14, 3: 19 };
      const timeSlot = timeSlots[showNum] || 10;
      
      const formats = ['2D', '3D', 'IMAX', 'Dolby'];
      const theaters = [
        { _id: 'demo-theater-1', name: 'PVR Cinemas', city: 'Mumbai', address: 'Phoenix Mall, Lower Parel' },
        { _id: 'demo-theater-2', name: 'INOX', city: 'Mumbai', address: 'R-City Mall, Ghatkopar' },
        { _id: 'demo-theater-3', name: 'Cinepolis', city: 'Delhi', address: 'DLF Mall, Saket' }
      ];
      const movies = [
        { _id: `demo-movie-${showNum}`, title: 'Demo Movie', poster: 'https://picsum.photos/seed/demo/300/450' }
      ];
      const theater = theaters[showNum % theaters.length];
      const movie = movies[0];
      const basePrice = 250;
      const format = formats[showNum % formats.length];
      
      const now = new Date();
      const showTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), timeSlot, 0);
      const endTime = new Date(showTime.getTime() + 3 * 60 * 60 * 1000);
      
      show = {
        _id: id,
        movie: movie,
        theater: theater,
        showTime: showTime,
        endTime: endTime,
        format: format,
        totalSeats: 100,
        availableSeats: Math.floor(Math.random() * 50) + 30,
        price: basePrice + (format === 'IMAX' ? 150 : format === '3D' ? 50 : format === 'Dolby' ? 100 : 0),
        isDemo: true
      };
    } else {
      // Only try MongoDB for valid ObjectIds
      show = await Show.findById(id).populate('theater', 'name city address').populate('movie', 'title poster');
    }
    
    show ? res.json({ success: true, data: show }) : res.status(404).json({ success: false, message: 'Show not found' });
  } catch (err) {
    console.error('Error in getShowById:', err);
    res.status(404).json({ success: false, message: 'Show not found' });
  }
};

export const createShow = async (req, res) => {
  try { const show = await Show.create(req.body); res.status(201).json({ success: true, data: show }); } 
  catch { res.status(400).json({ success: false }); }
};

export const updateShow = async (req, res) => {
  try { const show = await Show.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: !!show, data: show }); }
  catch { res.status(400).json({ success: false }); }
};

export const lockSeats = async (req, res) => {
  res.json({ success: true, data: [], expiresAt: new Date(Date.now() + 600000) });
};

export const releaseSeats = async (req, res) => { res.json({ success: true }); };

export const getAllShows = async (req, res) => {
  try { const shows = await Show.find({}).populate('movie', 'title').populate('theater', 'name city').limit(100); res.json({ success: true, data: shows }); }
  catch { res.json({ success: true, data: [] }); }
};