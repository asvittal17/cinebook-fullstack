import dotenv from 'dotenv'
dotenv.config()

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE = 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p'

console.log('[TMDB] API Key loaded:', TMDB_API_KEY ? 'YES (length: ' + TMDB_API_KEY.length + ')' : 'NO')

// Safe fetch with timeout
const safeFetch = async (url, timeoutMs = 8000) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  
  try {
    const res = await fetch(url, { 
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    })
    clearTimeout(timeout)
    return res
  } catch (e) {
    clearTimeout(timeout)
    if (e.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw e
  }
}

export const TMDB = {
  getImageUrl: (path, size = 'w500') => path ? `${IMAGE_BASE}/${size}${path}` : null,

  isConfigured: () => !!TMDB_API_KEY,

  searchMovies: async (query) => {
    if (!TMDB_API_KEY) return []
    try {
      const res = await safeFetch(`${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`)
      const data = await res.json()
      return data.results?.filter(r => r.media_type === 'movie').slice(0, 10) || []
    } catch { return [] }
  },

  getPopularMovies: async (page = 1) => {
    if (!TMDB_API_KEY) return []
    try {
      const res = await safeFetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`)
      const data = await res.json()
      return data.results || []
    } catch { return [] }
  },

  getNowPlaying: async () => {
    if (!TMDB_API_KEY) return []
    try {
      const res = await safeFetch(`${TMDB_BASE}/movie/now_playing?api_key=${TMDB_API_KEY}&page=1`)
      const data = await res.json()
      return data.results?.slice(0, 10) || []
    } catch { return [] }
  },

  getUpcomingMovies: async () => {
    if (!TMDB_API_KEY) return []
    try {
      const res = await safeFetch(`${TMDB_BASE}/movie/upcoming?api_key=${TMDB_API_KEY}&page=1`)
      const data = await res.json()
      return data.results || []
    } catch { return [] }
  },

  getIndianMovies: async () => {
    if (!TMDB_API_KEY) return []
    try {
      const res = await safeFetch(`${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&sort_by=popularity.desc&page=1`)
      const data = await res.json()
      return data.results?.slice(0, 10) || []
    } catch { return [] }
  },

  getMovieDetails: async (tmdbId) => {
    if (!TMDB_API_KEY) return {}
    try {
      const res = await safeFetch(`${TMDB_BASE}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits`)
      if (!res.ok) return {}
      const data = await res.json()
      return data
    } catch (err) {
      console.error('[TMDB] getMovieDetails error:', err.message)
      return {}
    }
  },

  getTrendingMovies: async () => {
    if (!TMDB_API_KEY) return []
    try {
      const url = `${TMDB_BASE}/trending/movie/day?api_key=${TMDB_API_KEY}`
      console.log('[TMDB] Fetching trending:', url.replace(TMDB_API_KEY, '***'))
      const res = await safeFetch(url, 15000) // Longer timeout for trending
      const data = await res.json()
      console.log('[TMDB] trending results:', data.results?.length || 0)
      return data.results?.slice(0, 10) || []
    } catch (e) { 
      console.error('[TMDB] getTrendingMovies error:', e.message)
      return [] 
    }
  },

  mapToMovie: (data) => ({
    title: data.title,
    description: data.overview,
    poster: TMDB.getImageUrl(data.poster_path),
    backdrop: TMDB.getImageUrl(data.backdrop_path, 'w1280'),
    duration: data.runtime || 120,
    releaseDate: data.release_date,
    genre: data.genres?.map(g => g.name) || [],
    language: data.original_language,
    rating: 'UA',
    imdbRating: data.vote_average ? Math.round(data.vote_average * 10) / 10 : null,
    director: data.credits?.crew?.find(c => c.job === 'Director')?.name,
    cast: data.credits?.cast?.slice(0, 5).map(c => ({ name: c.name, role: c.character, image: TMDB.getImageUrl(c.profile_path, 'w185') })) || [],
    trailerUrl: null,
    isActive: true,
  }),
}