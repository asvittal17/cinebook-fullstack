import Movie from '../models/Movie.js'
import { TMDB } from '../utils/tmdb.js'

const FALLBACK_MOVIES = [
  { tmdbId: 550, title: 'Fight Club', poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B7Ih7cT4D0nV8b2X.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/fCayJrkfRaCRCTh8GqN30f1yf1T.jpg', overview: 'A ticking-Loss bombsite story', releaseDate: '1999-10-15', voteAverage: 8.4 },
  { tmdbId: 238, title: 'The Godfather', poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsD7JPsXPVxXJ.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/h5UzYZquMwO9FVn15R2bkNaYUm.jpg', overview: 'Spanning the years 1945 to 1955', releaseDate: '1972-03-14', voteAverage: 8.7 },
  { tmdbId: 424, title: 'Schindler\'s List', poster: 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/loRmRzQXZeqG78TqZuyvSdEQfZb.jpg', overview: 'The true story of Oskar Schindler', releaseDate: '1993-12-15', voteAverage: 8.6 },
  { tmdbId: 680, title: 'Pulp Fiction', poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8YqGvirt.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/suaEOtk1N1hIXH8Ak5vl3S2W7b8.jpg', overview: 'The lives of two mob hitmen', releaseDate: '1994-09-10', voteAverage: 8.5 },
  { tmdbId: 155, title: 'The Dark Knight', poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6ON8EQE0X0Mw3x5S1KM1TJ.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/3cxkZ8891I5I2PKKLoE2c0bXKTG.jpg', overview: 'Batman raises the stakes', releaseDate: '2008-07-16', voteAverage: 8.5 },
]

const getMappedMovie = (r) => ({
  tmdbId: r.tmdbId || r.id,
  title: r.title,
  poster: r.poster || TMDB.getImageUrl(r.poster_path),
  backdrop: r.backdrop || TMDB.getImageUrl(r.backdrop_path),
  overview: r.overview,
  releaseDate: r.release_date,
  voteAverage: r.voteAverage || r.vote_average,
})

export const getNowPlaying = async (req, res) => {
  try {
    let results = await TMDB.getNowPlaying()
    if (!results || results.length === 0) results = FALLBACK_MOVIES.slice(0, 5)
    res.json({ success: true, data: results.map(getMappedMovie) })
  } catch (error) {
    res.json({ success: true, data: FALLBACK_MOVIES.slice(0, 5).map(getMappedMovie) })
  }
}

export const getTrending = async (req, res) => {
  try {
    let results = await TMDB.getTrendingMovies()
    if (!results || results.length === 0) results = FALLBACK_MOVIES
    res.json({ success: true, data: results.map(getMappedMovie) })
  } catch (error) {
    res.json({ success: true, data: FALLBACK_MOVIES.map(getMappedMovie) })
  }
}

export const getUpcoming = async (req, res) => {
  try {
    let results = await TMDB.getUpcomingMovies()
    if (!results || results.length === 0) results = FALLBACK_MOVIES.slice(3, 8)
    res.json({ success: true, data: results.map(getMappedMovie) })
  } catch (error) {
    res.json({ success: true, data: FALLBACK_MOVIES.slice(3, 8).map(getMappedMovie) })
  }
}

export const searchTMDB = async (req, res) => {
  try {
    const { q } = req.query
    if (!q) return res.json({ success: true, data: [] })
    const results = await TMDB.searchMovies(q)
    if (!results || results.length === 0) {
      const filtered = FALLBACK_MOVIES.filter(m => m.title.toLowerCase().includes(q.toLowerCase()))
      return res.json({ success: true, data: filtered.map(getMappedMovie) })
    }
    res.json({ success: true, data: results.map(getMappedMovie) })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Search failed' })
  }
}

export const getIndianMovies = async (req, res) => {
  try {
    let results = await TMDB.getIndianMovies()
    if (!results || results.length === 0) results = FALLBACK_MOVIES
    res.json({ success: true, data: results.slice(0, 6).map(getMappedMovie) })
  } catch (error) {
    res.json({ success: true, data: FALLBACK_MOVIES.slice(0, 6).map(getMappedMovie) })
  }
}

export const getHomeSections = async (req, res) => {
  res.json({
    success: true,
    data: {
      trending: FALLBACK_MOVIES.map(getMappedMovie),
      nowPlaying: FALLBACK_MOVIES.slice(0, 5).map(getMappedMovie),
      upcoming: FALLBACK_MOVIES.slice(2, 6).map(getMappedMovie),
    }
  })
}

export const getTMDBDetails = async (req, res) => {
  try {
    const { tmdbId } = req.params
    if (!tmdbId || isNaN(Number(tmdbId))) {
      return res.status(400).json({ success: false, message: 'Invalid TMDB ID' })
    }
    const data = await TMDB.getMovieDetails(tmdbId)
    if (!data || !data.id) {
      const fallback = FALLBACK_MOVIES.find(m => m.tmdbId === Number(tmdbId))
      if (fallback) return res.json({ success: true, data: fallback })
      return res.status(404).json({ success: false, message: 'Movie not found' })
    }
    res.json({ success: true, data })
  } catch (error) {
    res.status(404).json({ success: false, message: 'Movie not found' })
  }
}

export const importFromTMDB = async (req, res) => {
  try {
    const { tmdbId } = req.params
    if (!tmdbId || isNaN(Number(tmdbId))) {
      return res.status(400).json({ success: false, message: 'Invalid TMDB ID' })
    }
    
    const numTmdbId = Number(tmdbId)
    const existing = await Movie.findOne({ tmdbId: numTmdbId })
    if (existing) {
      return res.json({ success: true, data: existing, alreadyExists: true })
    }
    
    console.log('[TMDB] Fetching movie details for ID:', numTmdbId)
    const tmdbMovie = await TMDB.getMovieDetails(numTmdbId)
    
    if (!tmdbMovie || !tmdbMovie.id) {
      console.log('[TMDB] Not found in TMDB, using fallback')
      const fallback = FALLBACK_MOVIES.find(m => m.tmdbId === numTmdbId) || FALLBACK_MOVIES[0]
      const movieData = {
        title: fallback.title || 'Unknown Movie',
        description: fallback.overview || 'Movie description unavailable',
        poster: fallback.poster,
        backdrop: fallback.backdrop,
        duration: 120,
        releaseDate: fallback.releaseDate ? new Date(fallback.releaseDate) : new Date(),
        genre: ['Action'],
        language: 'English',
        rating: 'UA',
        imdbRating: fallback.voteAverage || 7.5,
        isActive: true,
        tmdbId: numTmdbId,
      }
      const movie = await Movie.create(movieData)
      return res.json({ success: true, data: movie })
    }
    
    const movieData = {
      title: tmdbMovie.title || 'Unknown',
      description: tmdbMovie.overview || 'No description.',
      poster: TMDB.getImageUrl(tmdbMovie.poster_path) || 'https://placehold.co/300x450',
      backdrop: TMDB.getImageUrl(tmdbMovie.backdrop_path) || '',
      duration: tmdbMovie.runtime || 120,
      releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : new Date(),
      genre: tmdbMovie.genres?.map(g => g.name) || [],
      language: tmdbMovie.original_language || 'English',
      rating: 'UA',
      imdbRating: tmdbMovie.vote_average || null,
      isActive: true,
      tmdbId: numTmdbId,
    }
    
    const movie = await Movie.create(movieData)
    console.log('[TMDB] Created movie:', movie._id, movie.title)
    res.status(201).json({ success: true, data: movie })
  } catch (err) {
    console.error('[TMDB] Import error:', err.message)
    res.status(500).json({ success: false, message: 'Import failed' })
  }
}