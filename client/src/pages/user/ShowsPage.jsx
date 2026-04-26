import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, addDays, isSameDay } from 'date-fns'
import { MapPin, Clock, ChevronRight, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import { movieAPI, showAPI } from '../../services/api'
import { useCity } from '../../context/CityContext'

const isMongoId = (id) => /^[0-9a-fA-F]{24}$/.test(id)

export default function ShowsPage() {
  const { id: movieId } = useParams()
  const navigate = useNavigate()
  const { selectedCity, changeCity, cities } = useCity()
  const [movie, setMovie] = useState(null)
  const [realMovieId, setRealMovieId] = useState(null)
  const [grouped, setGrouped] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [error, setError] = useState(null)
  const [importing, setImporting] = useState(false)
  const [creatingShows, setCreatingShows] = useState(false)
  const [importError, setImportError] = useState(null)

  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i))

  useEffect(() => {
    const loadMovie = async () => {
      try {
        console.log('[ShowsPage] Loading movie, id:', movieId)
        
        if (isMongoId(movieId)) {
          console.log('[ShowsPage] ID is valid MongoDB ObjectId:', movieId)
          const r = await movieAPI.getById(movieId)
          setMovie(r.data)
          setRealMovieId(movieId)
        } else {
          console.log('[ShowsPage] ID is NOT MongoDB, parsing TMDB ID from:', movieId)
          
          const tmdbIdMatch = movieId.match(/^tmdb-(\d+)$/)
          if (!tmdbIdMatch) {
            throw new Error('Invalid movie ID format. Expected /movie/tmdb-{tmdbId} like /movie/tmdb-872585')
          }
          
          const tmdbId = tmdbIdMatch[1]
          console.log('[ShowsPage] Extracted TMDB ID:', tmdbId)
          
          setImporting(true)
          
          try {
            const importResult = await movieAPI.importFromTMDB(tmdbId)
            console.log('[ShowsPage] Import result:', importResult)
            
            if (!importResult.success) {
              throw new Error(importResult.message || 'Failed to import movie')
            }
            
            const newMongoId = importResult.data._id
            console.log('[ShowsPage] Got real MongoDB _id:', newMongoId)
            
            setRealMovieId(newMongoId)
            setMovie(importResult.data)
            setImporting(false)
          } catch (importErr) {
            console.error('[ShowsPage] Import error:', importErr.message)
            setImportError('This movie is currently unavailable. Please go back and try another.')
            setLoading(false)
            return
          }
        }
      } catch (err) {
        console.error('[ShowsPage] Error loading movie:', err.message)
        setError(err.message)
        toast.error('Failed to load movie')
      }
    }
    loadMovie()
  }, [movieId])

  useEffect(() => {
    if (!realMovieId) return

    const loadShows = async () => {
      setLoading(true)
      setCreatingShows(false)
      setError(null)
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd')
        console.log('[ShowsPage] Fetching shows for movie:', realMovieId, 'date:', dateStr, 'city:', selectedCity)
        
        // API returns: { success: true, data: [...] }
        // Axios interceptor extracts res.data, so response = { success: true, data: [...] }
        const response = await showAPI.getByMovie(realMovieId, { date: dateStr, city: selectedCity })
        console.log('[ShowsPage] API response structure:', JSON.stringify(response))
        
        // The response.data is the shows array
        const rawData = response.data
        console.log('[ShowsPage] Raw shows data:', rawData)
        
        if (response.isDemo) {
          setCreatingShows(true)
        }
        
        // Handle both array and object response formats
        let showsArray = []
        if (Array.isArray(rawData)) {
          showsArray = rawData
        } else if (rawData && Array.isArray(rawData.data)) {
          // In case format is { data: { data: [...] } }
          showsArray = rawData.data
        }
        
        console.log('[ShowsPage] Final shows array:', showsArray)
        console.log('[ShowsPage] Array length:', showsArray.length)
        
        setGrouped(showsArray)
      } catch (err) {
        console.error('[ShowsPage] Error loading shows:', err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadShows()
  }, [realMovieId, selectedDate, selectedCity])

  const handleShowSelect = (show) => {
    console.log('=== handleShowSelect ===')
    console.log('Show data:', show)
    console.log('Real show _id:', show._id)
    navigate(`/show/${show._id}/seats`)
  }

  const FORMAT_COLORS = { '2D': 'bg-dark-500 text-gray-300', '3D': 'bg-blue-900/60 text-blue-300', 'IMAX': 'bg-purple-900/60 text-purple-300', 'Dolby': 'bg-orange-900/60 text-orange-300' }

  console.log('[ShowsPage] Render - importing:', importing, 'loading:', loading, 'grouped.length:', grouped.length)
    
  if (importing) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={48} className="text-brand-500 animate-spin mb-4" />
          <p className="text-lg font-semibold text-white mb-2">Loading shows...</p>
          <p className="text-sm text-gray-400">Preparing movie details</p>
        </div>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={48} className="text-brand-500 animate-spin mb-4" />
          {creatingShows && (
            <p className="text-sm text-gray-400">Creating available showtimes...</p>
          )}
        </div>
      </div>
    )
  }
  
  if (importError) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <div className="flex flex-col items-center justify-center gap-4">
          <AlertCircle size={48} className="text-red-500" />
          <p className="text-red-400 text-lg text-center px-4">{importError}</p>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-colors">
            <ArrowLeft size={18} />
            Back to Movies
          </button>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <div className="text-center py-20">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-xl font-semibold text-white mb-2">Error loading shows</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }
  
if (grouped.length === 0) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🎭</p>
          <p className="text-xl font-semibold text-white mb-2">No shows available</p>
          <p className="text-gray-400">Try a different date or city</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      {movie && (
        <div className="pt-16 border-b border-dark-600 bg-dark-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center gap-5">
            <img src={movie.poster} alt={movie.title} className="w-14 h-20 object-cover rounded-xl shadow-lg"
              onError={e => e.target.src = 'https://picsum.photos/seed/movie/300/450'} />
            <div>
              <h1 className="text-2xl font-bold text-white font-display">{movie.title}</h1>
              <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                <span>{movie.language}</span>
                <span>•</span>
                <span>{Math.floor((movie.duration || 120) / 60)}h {(movie.duration || 120) % 60}m</span>
                <span>•</span>
                <span className="text-yellow-400">{movie.rating || 'UA'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <MapPin size={16} className="text-brand-500 flex-shrink-0" />
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {(cities.length ? cities : ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata']).map(city => (
              <button key={city} onClick={() => changeCity(city)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  selectedCity === city ? 'bg-brand-600 border-brand-500 text-white' : 'bg-dark-700 border-dark-500 text-gray-400 hover:text-white hover:border-dark-300'
                }`}>
                {city}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
          {dates.map((date, i) => {
            const isSelected = isSameDay(date, selectedDate)
            return (
              <button key={i} onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border transition-all ${
                  isSelected ? 'bg-brand-600 border-brand-500 text-white' : 'bg-dark-700 border-dark-500 text-gray-400 hover:border-dark-300 hover:text-white'
                }`}>
                <span className="text-xs font-medium">{format(date, 'EEE')}</span>
                <span className="text-lg font-bold">{format(date, 'd')}</span>
                <span className="text-xs">{format(date, 'MMM')}</span>
              </button>
            )
          })}
        </div>

        <div className="space-y-4">
          {grouped.map(({ theater, shows }) => (
            <div key={theater._id} className="card p-6">
              <div className="mb-5">
                <h3 className="font-bold text-white text-lg">{theater.name}</h3>
                <p className="text-sm text-gray-400 mt-0.5">{theater.address}, {theater.city}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {shows.map(show => (
                  <div key={show._id} className="flex items-start gap-2">
                    <button onClick={() => handleShowSelect(show)}
                      className="p-3 bg-dark-600 hover:bg-dark-500 border border-dark-400 hover:border-brand-600 rounded-xl transition-all min-w-[100px]">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock size={12} className="text-gray-400" />
                        <span className="text-sm font-bold text-white">{format(new Date(show.showTime), 'h:mm a')}</span>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${FORMAT_COLORS[show.format] || FORMAT_COLORS['2D']}`}>{show.format}</span>
                      <span className="text-xs text-green-400 mt-1.5 block">{show.availableSeats} seats</span>
                    </button>
                    <button
                      onClick={() => handleShowSelect(show)}
                      className="p-3 bg-brand-600 hover:bg-brand-500 border border-brand-500 rounded-xl transition-all flex items-center gap-1 text-white font-medium text-sm"
                    >
                      Book Now <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}