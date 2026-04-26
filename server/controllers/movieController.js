import Movie from '../models/Movie.js';
import Show from '../models/Show.js';
import { TMDB } from '../utils/tmdb.js';

export const DEMO_MOVIES = [
  {
    _id: 'demo1', tmdbId: '872585', title: 'Pushpa 2: The Rule', description: 'Pushpa rises to become a powerful businessman but faces new challenges.', poster: 'https://image.tmdb.org/t/p/w500/amWa6bZieYMoTcmFtFnlD2d7VfpF.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/amWa6bZieYMoTcmFtFnlD2d7VfpF.jpg',
    duration: 180, releaseDate: '2025-01-01', genre: ['Action', 'Thriller'], language: 'Hindi', rating: 'UA', imdbRating: 7.5, director: 'Sukumar', isActive: true
  },
  {
    _id: 'demo2', tmdbId: '122917', title: 'Dangal', description: 'A wrestling coach trains his daughters for Commonwealth Games.', poster: 'https://image.tmdb.org/t/p/w500/5K7cHAof2p0AHF3Kk1463JJoCiL.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/5K7cHAof2p0AHF3Kk1463JJoCiL.jpg',
    duration: 161, releaseDate: '2016-12-23', genre: ['Drama', 'Biography'], language: 'Hindi', rating: 'UA', imdbRating: 8.4, director: 'Nitesh Tiwari', isActive: true
  },
  {
    _id: 'demo3', tmdbId: '545611', title: 'Pathaan', description: 'A RAW agent returns to fight a terrorist organization.', poster: 'https://image.tmdb.org/t/p/w500/bjf16MJ7D2oCsU8tfMXoM8q2i4L.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/bjf16MJ7D2oCsU8tfMXoM8q2i4L.jpg',
    duration: 145, releaseDate: '2023-01-25', genre: ['Action', 'Thriller'], language: 'Hindi', rating: 'UA', imdbRating: 7.3, director: 'Siddharth Anand', isActive: true
  },
  {
    _id: 'demo4', tmdbId: '672359', title: 'RRR', description: 'Two Indian revolutionaries in the 1920s.', poster: 'https://image.tmdb.org/t/p/w500/w2P5JDrXmR2p0NHXWUNL1JXK5kF.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/w2P5JDrXmR2p0NHXWUNL1JXK5kF.jpg',
    duration: 187, releaseDate: '2022-03-24', genre: ['Action', 'Drama'], language: 'Telugu', rating: 'UA', imdbRating: 7.8, director: 'S.S. Rajamouli', isActive: true
  },
  {
    _id: 'demo5', tmdbId: '138833', title: 'Jawan', description: 'A vigilante awakens to confront corruption.', poster: 'https://image.tmdb.org/t/p/w500/qC5GYEZLCETMZq2kN2bV4G32qVF.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/qC5GYEZLCETMZq2kN2bV4G32qVF.jpg',
    duration: 165, releaseDate: '2023-09-07', genre: ['Action', 'Thriller'], language: 'Hindi', rating: 'UA', imdbRating: 7.2, director: 'Atlee', isActive: true
  },
];

export const getMovies = async (req, res) => {
  try {
    const { genre, language, search, isActive = true } = req.query;
    const filter = { isActive };

    if (genre) filter.genre = { $in: [genre] };
    if (language) filter.language = language;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const movies = await Movie.find(filter).sort({ createdAt: -1 });
    
    // If no movies in DB, return demo movies
    if (movies.length === 0 && !search) {
      return res.json({ success: true, data: DEMO_MOVIES });
    }
    
    res.json({ success: true, data: movies });
  } catch (error) {
    res.json({ success: true, data: DEMO_MOVIES });
  }
};

export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      // Check demo movies
      const demo = DEMO_MOVIES.find(m => m._id === req.params.id);
      if (demo) return res.json({ success: true, data: demo });
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({ success: true, data: movie });
  } catch (error) {
    const demo = DEMO_MOVIES.find(m => m._id === req.params.id);
    if (demo) return res.json({ success: true, data: demo });
    res.status(404).json({ success: false, message: 'Movie not found' });
  }
};

export const createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, data: movie, message: 'Movie added successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    res.json({ success: true, data: movie, message: 'Movie updated' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteMovie = async (req, res) => {
  try {
    await Movie.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Movie removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNowShowing = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const showMovieIds = await Show.distinct('movie', {
      date: { $gte: today },
      isActive: true,
    });
    const movies = await Movie.find({ _id: { $in: showMovieIds }, isActive: true });
    
    // If no shows or DB error, return demo movies
    if (movies.length === 0) {
      return res.json({ success: true, data: DEMO_MOVIES });
    }
    
    res.json({ success: true, data: movies });
  } catch (error) {
    res.json({ success: true, data: DEMO_MOVIES });
  }
};

export const searchTMDB = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Query required' });
    const results = await TMDB.searchMovies(q);
    res.json({ success: true, data: results.map(r => ({
      tmdbId: r.id,
      title: r.title,
      poster: TMDB.getImageUrl(r.poster_path),
      backdrop: TMDB.getImageUrl(r.backdrop_path),
      releaseDate: r.release_date,
      overview: r.overview,
    }))});
  } catch (error) {
    // Return filtered demo movies if TMDB not configured
    const { q } = req.query;
    const filtered = DEMO_MOVIES.filter(m => m.title.toLowerCase().includes(q?.toLowerCase())).map(m => ({
      tmdbId: m._id,
      title: m.title,
      poster: m.poster,
      backdrop: m.backdrop,
      releaseDate: m.releaseDate,
      overview: m.description,
    }));
    res.json({ success: true, data: filtered });
  }
};

export const importFromTMDB = async (req, res) => {
  try {
    const tmdbId = req.params.tmdbId || req.body.tmdbId;
    if (!tmdbId) return res.status(400).json({ success: false, message: 'TMDB ID required' });

    // Clean tmdbId - remove 'tmdb-' prefix if present
    const cleanId = tmdbId.toString().replace('tmdb-', '');

    // If TMDB not configured, create a real MongoDB entry for the demo movie
    if (!process.env.TMDB_API_KEY || process.env.TMDB_API_KEY === 'your_tmdb_api_key') {
      const demoMovie = DEMO_MOVIES.find(m => m._id === cleanId || m._id === `demo${cleanId}`);
      if (demoMovie) {
        // Create a real MongoDB document to get a real _id
        const created = await Movie.create({ ...demoMovie, tmdbId: cleanId });
        console.log('[importFromTMDB] Created demo movie in MongoDB:', created._id, demoMovie.title);
        return res.json({ success: true, data: created, message: 'Demo movie imported to MongoDB' });
      }
      // Create a generic movie entry if not found in demos
      const generic = {
        title: `Movie ${cleanId}`,
        description: 'Imported from TMDB (demo mode)',
        poster: `https://picsum.photos/seed/${cleanId}/300/450`,
        backdrop: `https://picsum.photos/seed/${cleanId}/1280/720`,
        duration: 150,
        releaseDate: new Date().toISOString().split('T')[0],
        genre: ['Action'],
        language: 'Hindi',
        rating: 'UA',
        tmdbId: cleanId,
        isActive: true
      };
      const created = await Movie.create(generic);
      console.log('[importFromTMDB] Created generic movie in MongoDB:', created._id);
      return res.json({ success: true, data: created, message: 'Movie imported to MongoDB' });
    }

    // Real TMDB - fetch and save
    const data = await TMDB.getMovieDetails(cleanId);
    const movie = TMDB.mapToMovie(data);
    const created = await Movie.create(movie);
    console.log('[importFromTMDB] Created from TMDB:', created._id, created.title);
    res.status(201).json({ success: true, data: created, message: 'Movie imported from TMDB' });
  } catch (error) {
    console.error('[importFromTMDB] Error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTrendingTMDB = async (req, res) => {
  try {
    const results = await TMDB.getTrendingMovies();
    if (results.length === 0) {
      return res.json({ success: true, data: DEMO_MOVIES.map(m => ({
        tmdbId: m._id,
        title: m.title,
        poster: m.poster,
        backdrop: m.backdrop,
        releaseDate: m.releaseDate,
        overview: m.description,
      }))});
    }
    res.json({ success: true, data: results.map(r => ({
      tmdbId: r.id,
      title: r.title,
      poster: TMDB.getImageUrl(r.poster_path),
      backdrop: TMDB.getImageUrl(r.backdrop_path),
      releaseDate: r.release_date,
      overview: r.overview,
    }))});
  } catch (error) {
    res.json({ success: true, data: DEMO_MOVIES.map(m => ({
      tmdbId: m._id,
      title: m.title,
      poster: m.poster,
      backdrop: m.backdrop,
      releaseDate: m.releaseDate,
      overview: m.description,
    }))});
  }
};
