import dotenv from 'dotenv'
dotenv.config()

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE = 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p'

console.log('[TMDB] API Key loaded:', TMDB_API_KEY ? 'YES (length: ' + TMDB_API_KEY.length + ')' : 'NO')

export const TMDB = {
  getImageUrl: (path, size = 'w500') => path ? `${IMAGE_BASE}/${size}${path}` : null,

  isConfigured: () => !!TMDB_API_KEY,

  searchMovies: async (query) => {
    if (!TMDB_API_KEY) {
      console.log('[TMDB] No API key, returning empty array')
      return [];
    }
    try {
      const url = `${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
      console.log('[TMDB] Searching:', url.replace(TMDB_API_KEY, '***'))
      const res = await fetch(url)
      const data = await res.json()
      return data.results?.filter(r => r.media_type === 'movie').slice(0, 10) || []
    } catch (e) { 
      console.error('[TMDB] Search error:', e)
      return [] 
    }
  },

  getPopularMovies: async (page = 1) => {
    if (!TMDB_API_KEY) return []
    try {
      const res = await fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`)
      const data = await res.json()
      return data.results || []
    } catch { return [] }
  },

  getNowPlaying: async () => {
    if (!TMDB_API_KEY) {
      console.log('[TMDB] getNowPlaying: No API key')
      return []
    }
    try {
      const url = `${TMDB_BASE}/movie/now_playing?api_key=${TMDB_API_KEY}&page=1`
      console.log('[TMDB] Fetching now_playing:', url.replace(TMDB_API_KEY, '***'))
      const res = await fetch(url)
      const data = await res.json()
      console.log('[TMDB] now_playing results:', data.results?.length || 0)
      return data.results?.slice(0, 10) || []
    } catch (e) { 
      console.error('[TMDB] getNowPlaying error:', e)
      return [] 
    }
  },

  getUpcomingMovies: async () => {
    if (!TMDB_API_KEY) return []
    try {
      const res = await fetch(`${TMDB_BASE}/movie/upcoming?api_key=${TMDB_API_KEY}&page=1`)
      const data = await res.json()
      return data.results || []
    } catch { return [] }
  },

  getIndianMovies: async () => {
    if (!TMDB_API_KEY) return []
    try {
      const res = await fetch(`${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&sort_by=popularity.desc&page=1`)
      const data = await res.json()
      return data.results?.slice(0, 10) || []
    } catch { return [] }
  },

  getMovieDetails: async (tmdbId) => {
    if (!TMDB_API_KEY) return {}
    try {
      const res = await fetch(`${TMDB_BASE}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits`)
      if (!res.ok) {
        if (res.status === 404) throw new Error(`Movie ID ${tmdbId} not found`)
        throw new Error(`TMDB API error: ${res.status}`)
      }
      const data = await res.json()
      return data
    } catch (err) {
      throw err
    }
  },

  getTrendingMovies: async () => {
    if (!TMDB_API_KEY) {
      console.log('[TMDB] getTrendingMovies: No API key')
      return []
    }
    try {
      const url = `${TMDB_BASE}/trending/movie/day?api_key=${TMDB_API_KEY}`
      console.log('[TMDB] Fetching trending:', url.replace(TMDB_API_KEY, '***'))
      const res = await fetch(url)
      const data = await res.json()
      console.log('[TMDB] trending results:', data.results?.length || 0)
      return data.results?.slice(0, 10) || []
    } catch (e) { 
      console.error('[TMDB] getTrendingMovies error:', e)
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