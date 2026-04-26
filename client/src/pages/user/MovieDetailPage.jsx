import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Star, Clock, Calendar, Globe, Film, ChevronRight, Play, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import { movieAPI, isMongoId } from '../../services/api'

const RATING_LABEL = { U: 'Universal', UA: 'U/A', A: 'Adults Only', S: 'Restricted' }

export default function MovieDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [realMovieId, setRealMovieId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    
    const loadMovie = async () => {
      setLoading(true)
      setError(null)
      setMovie(null)
      setRealMovieId(null)
      
      try {
        if (isMongoId(id)) {
          if (cancelled) return
          const r = await movieAPI.getById(id)
          if (cancelled) return
          setMovie(r.data)
          setRealMovieId(id)
        } else {
          const tmdbId = id.replace('tmdb-', '')
          try {
            if (cancelled) return
            const importResult = await movieAPI.importFromTMDB(tmdbId)
            if (cancelled) return
            setMovie(importResult.data)
            setRealMovieId(importResult.data._id)
            navigate(`/movie/${importResult.data._id}`, { replace: true })
          } catch (importErr) {
            if (cancelled) return
            try {
              const fallback = await movieAPI.getById(id)
              if (cancelled) return
              setMovie(fallback.data)
              setRealMovieId(id)
            } catch {
              if (!cancelled) setError('Movie not found')
            }
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    
    loadMovie()
    return () => { cancelled = true }
  }, [id])

  if (loading || importing) return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  if (error || !movie) return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center">
      <AlertCircle size={48} className="text-red-500 mb-4" />
      <p className="text-white mb-4">Movie not found</p>
      <Link to="/" className="btn-primary">Go Home</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <div className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
        <img src={movie.backdrop || movie.poster} alt={movie.title}
          className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/80 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 relative pb-20">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0">
            <div className="w-48 sm:w-56 rounded-2xl overflow-hidden border-2 border-dark-500 shadow-2xl">
              <img src={movie.poster} alt={movie.title} className="w-full h-auto"
                onError={e => { e.target.src = 'https://picsum.photos/seed/movie/300/450' }} />
            </div>
          </div>

          <div className="flex-1 pt-8 md:pt-24">
            <div className="flex flex-wrap gap-2 mb-3">
              {movie.genre?.map(g => (
                <span key={g} className="text-xs font-semibold text-brand-400 bg-brand-900/30 border border-brand-800 px-3 py-1 rounded-full">{g}</span>
              ))}
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">{movie.title}</h1>

            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-300">
              {movie.imdbRating && (
                <div className="flex items-center gap-1.5 bg-yellow-900/30 border border-yellow-800 px-3 py-1.5 rounded-lg">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-yellow-300">{movie.imdbRating}/10</span>
                  <span className="text-yellow-700 text-xs">IMDb</span>
                </div>
              )}
              <div className="flex items-center gap-1.5"><Clock size={14} className="text-gray-500" />{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</div>
              <div className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-500" />{new Date(movie.releaseDate).getFullYear()}</div>
              <div className="flex items-center gap-1.5"><Globe size={14} className="text-gray-500" />{movie.language}</div>
              <span className="bg-yellow-600 text-black text-xs font-bold px-2 py-0.5 rounded">{movie.rating} • {RATING_LABEL[movie.rating]}</span>
            </div>

            <p className="text-gray-300 text-base leading-relaxed mb-8 max-w-2xl">{movie.description}</p>

            {movie.director && (
              <div className="mb-4">
                <span className="text-gray-500 text-sm">Director: </span>
                <span className="text-white text-sm font-medium">{movie.director}</span>
              </div>
            )}

            <div className="flex items-center gap-4 mt-6">
              <Link to={`/movie/${realMovieId}/shows`}
                className="flex items-center gap-2 btn-primary text-base px-8 py-3.5 shadow-lg shadow-brand-900/50">
                🎟️ Book Tickets
                <ChevronRight size={18} />
              </Link>
              {movie.trailerUrl && (
                <a href={movie.trailerUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 btn-secondary px-6 py-3.5">
                  <Play size={16} className="fill-white" /> Trailer
                </a>
              )}
            </div>
          </div>
        </div>

        {movie.cast?.length > 0 && (
          <div className="mt-14">
            <h2 className="font-display text-2xl font-bold text-white mb-6">Cast</h2>
            <div className="flex gap-5 overflow-x-auto no-scrollbar pb-4">
              {movie.cast.map((member, i) => (
                <div key={i} className="flex-shrink-0 text-center w-24">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-dark-600 border-2 border-dark-500 mx-auto mb-2">
                    {member.image
                      ? <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl bg-dark-500">{member.name[0]}</div>
                    }
                  </div>
                  <p className="text-xs font-semibold text-white truncate">{member.name}</p>
                  <p className="text-xs text-gray-500 truncate">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}