import dotenv from 'dotenv'
dotenv.config()

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE = 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p'

console.log('[TMDB] API Key loaded:', TMDB_API_KEY ? `YES (length: ${TMDB_API_KEY.length})` : 'NO')
console.log('[TMDB] Base URL:', TMDB_BASE)

// Fetch is built-in since Node 18, but let's handle it properly
const fetch = globalThis.fetch || (await import('node-fetch')).default

// Retry fetch with multiple attempts
const fetchWithRetry = async (url, options = {}, retries = 3, delay = 2000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[TMDB] Attempt ${attempt}/${retries}: ${url}`)
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)
      
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers
        }
      })
      clearTimeout(timeout)
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      
      return res
    } catch (err) {
      console.error(`[TMDB] Attempt ${attempt} failed:`, err.message)
      if (attempt < retries) {
        console.log(`[TMDB] Waiting ${delay}ms before retry...`)
        await new Promise(r => setTimeout(r, delay))
      }
    }
  }
  throw new Error(`Failed after ${retries} attempts`)
}

export const TMDB = {
  getImageUrl: (path, size = 'w500') => path ? `${IMAGE_BASE}/${size}${path}` : null,

  isConfigured: () => !!TMDB_API_KEY,

  searchMovies: async (query) => {
    if (!TMDB_API_KEY) {
      console.warn('[TMDB] No API key configured')
      return []
    }
    try {
      const url = `${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
      const res = await fetchWithRetry(url)
      const data = await res.json()
      return data.results?.filter(r => r.media_type === 'movie').slice(0, 10) || []
    } catch (err) {
      console.error('[TMDB] searchMovies error:', err.message)
      return []
    }
  },

  getPopularMovies: async (page = 1) => {
    if (!TMDB_API_KEY) return []
    try {
      const url = `${TMDB_BASE}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`
      const res = await fetchWithRetry(url)
      const data = await res.json()
      return data.results || []
    } catch (err) {
      console.error('[TMDB] getPopularMovies error:', err.message)
      return []
    }
  },

  getNowPlaying: async () => {
    if (!TMDB_API_KEY) return []
    try {
      const url = `${TMDB_BASE}/movie/now_playing?api_key=${TMDB_API_KEY}&page=1`
      const res = await fetchWithRetry(url)
      const data = await res.json()
      console.log('[TMDB] now_playing results:', data.results?.length || 0)
      return data.results?.slice(0, 10) || []
    } catch (err) {
      console.error('[TMDB] getNowPlaying error:', err.message)
      return []
    }
  },

  getUpcomingMovies: async () => {
    if (!TMDB_API_KEY) return []
    try {
      const url = `${TMDB_BASE}/movie/upcoming?api_key=${TMDB_API_KEY}&page=1`
      const res = await fetchWithRetry(url)
      const data = await res.json()
      return data.results || []
    } catch (err) {
      console.error('[TMDB] getUpcomingMovies error:', err.message)
      return []
    }
  },

  getIndianMovies: async () => {
    if (!TMDB_API_KEY) return []
    try {
      const url = `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&sort_by=popularity.desc&page=1`
      const res = await fetchWithRetry(url)
      const data = await res.json()
      return data.results?.slice(0, 10) || []
    } catch (err) {
      console.error('[TMDB] getIndianMovies error:', err.message)
      return []
    }
  },

  getMovieDetails: async (tmdbId) => {
    if (!TMDB_API_KEY) return {}
    try {
      const url = `${TMDB_BASE}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits`
      const res = await fetchWithRetry(url)
      const data = await res.json()
      return data
    } catch (err) {
      console.error('[TMDB] getMovieDetails error:', err.message)
      return {}
    }
  },

  getTrendingMovies: async () => {
    if (!TMDB_API_KEY) {
      console.warn('[TMDB] No API key - returning empty')
      return []
    }
    
    try {
      const url = `${TMDB_BASE}/trending/movie/day?api_key=${TMDB_API_KEY}`
      console.log('[TMDB] URL:', url.replace(TMDB_API_KEY, '***'))
      
      const res = await fetchWithRetry(url)
      const data = await res.json()
      
      console.log('[TMDB] Response status:', res.status)
      console.log('[TMDB] Results count:', data.results?.length || 0)
      
      if (data.errors) {
        console.error('[TMDB] TMDB API errors:', data.errors)
      }
      
      return data.results?.slice(0, 10) || []
    } catch (err) {
      console.error('[TMDB] getTrendingMovies FAILED:', err.message)
      console.error('[TMDB] Full error:', err)
      return []
    }
  },
}