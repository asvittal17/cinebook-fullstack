import Movie from '../models/Movie.js'
import { TMDB } from '../utils/tmdb.js'

export const getNowPlaying = async (req, res) => {
  try {
    const results = await TMDB.getNowPlaying()
    res.json({ 
      success: true, 
      data: results.map(r => ({ 
        tmdbId: r.id, 
        title: r.title, 
        poster: TMDB.getImageUrl(r.poster_path), 
        backdrop: TMDB.getImageUrl(r.backdrop_path), 
        overview: r.overview, 
        releaseDate: r.release_date,
        voteAverage: r.vote_average 
      })) 
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch movies' })
  }
}

export const getTrending = async (req, res) => {
  try {
    const results = await TMDB.getTrendingMovies()
    res.json({ 
      success: true, 
      data: results.map(r => ({ 
        tmdbId: r.id, 
        title: r.title, 
        poster: TMDB.getImageUrl(r.poster_path), 
        backdrop: TMDB.getImageUrl(r.backdrop_path), 
        overview: r.overview, 
        releaseDate: r.release_date,
        voteAverage: r.vote_average 
      })) 
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch trending movies' })
  }
}

export const getUpcoming = async (req, res) => {
  try {
    const results = await TMDB.getUpcomingMovies()
    res.json({ 
      success: true, 
      data: results.map(r => ({ 
        tmdbId: r.id, 
        title: r.title, 
        poster: TMDB.getImageUrl(r.poster_path), 
        backdrop: TMDB.getImageUrl(r.backdrop_path), 
        overview: r.overview, 
        releaseDate: r.release_date 
      })) 
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch upcoming movies' })
  }
}

export const searchTMDB = async (req, res) => {
  try {
    const { q } = req.query
    if (!q) return res.json({ success: true, data: [] })
    const results = await TMDB.searchMovies(q)
    res.json({ 
      success: true, 
      data: results.map(r => ({ 
        tmdbId: r.id, 
        title: r.title, 
        poster: TMDB.getImageUrl(r.poster_path), 
        overview: r.overview, 
        releaseDate: r.release_date 
      })) 
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Search failed' })
  }
}

export const getIndianMovies = async (req, res) => {
  try {
    const results = await TMDB.getIndianMovies()
    res.json({ 
      success: true, 
      data: results.map(r => ({ 
        tmdbId: r.id, 
        title: r.title, 
        poster: TMDB.getImageUrl(r.poster_path), 
        backdrop: TMDB.getImageUrl(r.backdrop_path), 
        overview: r.overview, 
        releaseDate: r.release_date 
      })) 
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch Indian movies' })
  }
}

export const getHomeSections = async (req, res) => {
  try {
    const [trending, nowPlaying, upcoming] = await Promise.all([
      TMDB.getTrendingMovies(),
      TMDB.getNowPlaying(),
      TMDB.getUpcomingMovies(),
    ])
    res.json({
      success: true,
      data: {
        trending: trending.map(r => ({ tmdbId: r.id, title: r.title, poster: TMDB.getImageUrl(r.poster_path), backdrop: TMDB.getImageUrl(r.backdrop_path), overview: r.overview, releaseDate: r.release_date })),
        nowPlaying: nowPlaying.map(r => ({ tmdbId: r.id, title: r.title, poster: TMDB.getImageUrl(r.poster_path), backdrop: TMDB.getImageUrl(r.backdrop_path), overview: r.overview, releaseDate: r.release_date })),
        upcoming: upcoming.map(r => ({ tmdbId: r.id, title: r.title, poster: TMDB.getImageUrl(r.poster_path), backdrop: TMDB.getImageUrl(r.backdrop_path), overview: r.overview, releaseDate: r.release_date })),
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch home sections' })
  }
}

export const getTMDBDetails = async (req, res) => {
  try {
    const { tmdbId } = req.params
    if (!tmdbId || isNaN(Number(tmdbId))) {
      return res.status(400).json({ success: false, message: `Invalid TMDB ID "${tmdbId}"` })
    }
    const data = await TMDB.getMovieDetails(tmdbId)
    if (!data || !data.id) {
      return res.status(404).json({ success: false, message: 'Movie not found in TMDB' })
    }
    res.json({
      success: true,
      data: {
        tmdbId: data.id,
        title: data.title,
        poster: TMDB.getImageUrl(data.poster_path),
        backdrop: TMDB.getImageUrl(data.backdrop_path),
        overview: data.overview,
        releaseDate: data.release_date,
        runtime: data.runtime || 120,
        genres: data.genres?.map(g => g.name) || ['Action'],
        language: data.original_language,
        voteAverage: data.vote_average,
      }
    })
  } catch (error) {
    res.status(404).json({ success: false, message: 'Movie not found' })
  }
}

export const importFromTMDB = async (req, res) => {
  try {
    const { tmdbId } = req.params
    if (!tmdbId || isNaN(Number(tmdbId)) || Number(tmdbId) <= 0) {
      return res.status(400).json({ success: false, message: `Invalid TMDB ID "${tmdbId}"` })
    }
    
    const existing = await Movie.findOne({ tmdbId: Number(tmdbId) })
    if (existing) {
      return res.json({ success: true, data: existing, alreadyExists: true })
    }
    
    const tmdbMovie = await TMDB.getMovieDetails(tmdbId)
    if (!tmdbMovie || !tmdbMovie.id) {
      return res.status(404).json({ success: false, message: 'Movie not found in TMDB' })
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
      imdbRating: tmdbMovie.vote_average ? Math.round(tmdbMovie.vote_average * 10) / 10 : null,
      isActive: true,
      tmdbId: Number(tmdbId),
    }
    
    const movie = await Movie.create(movieData)
    res.status(201).json({ success: true, data: movie })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to import movie: ' + err.message })
  }
}