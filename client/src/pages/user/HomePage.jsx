import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import HeroSection from '../../components/user/HeroSection'
import MovieCard, { MovieCardSkeleton } from '../../components/user/MovieCard'
import { tmdbAPI } from '../../services/api'
import { RefreshCw } from 'lucide-react'

export default function HomePage() {
  const [searchParams] = useSearchParams()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tab, setTab] = useState('trending')

  const search = searchParams.get('search') || ''

  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      if (tab === 'trending') {
        console.log('[HomePage] Fetching trending...')
        const res = await tmdbAPI.getTrending()
        console.log('[HomePage] Trending response:', JSON.stringify(res).substring(0, 200))
        console.log('[HomePage] Trending data:', res.data)
        console.log('[HomePage] Is array?', Array.isArray(res.data))
        setMovies(Array.isArray(res.data) ? res.data : [])
      } else {
        console.log('[HomePage] Fetching now playing...')
        const res = await tmdbAPI.getNowPlaying()
        console.log('[HomePage] Now playing response:', JSON.stringify(res).substring(0, 200))
        setMovies(Array.isArray(res.data) ? res.data : [])
      }
    } catch (e) {
      console.error('Load error:', e)
      setMovies([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
  }, [tab, search])

  const handleRefresh = () => load(true)

  const isEmpty = !loading && movies.length === 0

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      {!search && <HeroSection movies={movies.slice(0, 5)} />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {search && (
          <div className="mb-8">
            <p className="text-gray-400 text-sm">Showing results for</p>
            <h2 className="text-2xl font-bold text-white mt-1">"{search}"</h2>
          </div>
        )}

        <div className="flex items-center gap-3 mb-8">
          <div className="flex bg-dark-700 rounded-xl p-1 border border-dark-500">
            {[
              ['trending', 'Trending'],
              ['now-showing', 'Now Playing'],
            ].map(([val, label]) => (
              <button key={val} onClick={() => setTab(val)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === val ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={handleRefresh} disabled={refreshing}
            className="p-2 rounded-lg bg-dark-700 border border-dark-500 text-gray-400 hover:text-white transition-colors">
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <span className="px-2 py-0.5 bg-red-600/20 text-red-400 rounded text-xs">TMDB API</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)
            : isEmpty
              ? (
                <div className="col-span-full text-center py-20">
                  <p className="text-6xl mb-4">🎬</p>
                  <p className="text-xl font-semibold text-white mb-2">No movies found</p>
                  <p className="text-gray-400 text-sm">Configure TMDB API key to fetch movies</p>
                </div>
              )
              : movies.map(movie => (
                <MovieCard 
                  key={movie.tmdbId || movie.id} 
                  movie={{
                    _id: `tmdb-${movie.tmdbId || movie.id}`,
                    title: movie.title,
                    poster: movie.poster,
                    backdrop: movie.backdrop,
                    description: movie.overview,
                    genre: movie.genres || ['Action'],
                    tmdbId: movie.tmdbId || movie.id,
                  }} 
                />
              ))
          }
        </div>
      </main>

      <Footer />
    </div>
  )
}