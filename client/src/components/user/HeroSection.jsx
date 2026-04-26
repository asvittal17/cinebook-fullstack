import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Play, Star, Clock, ChevronLeft, ChevronRight, Info } from 'lucide-react'

const getMovieLink = (movie) => {
  if (movie.tmdbId) {
    return `/movie/tmdb-${movie.tmdbId}`
  }
  return `/movie/${movie._id}`
}

const getShowsLink = (movie) => {
  if (movie.tmdbId) {
    return `/movie/tmdb-${movie.tmdbId}/shows`
  }
  return `/movie/${movie._id}/shows`
}

function Ticket({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
      <path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
    </svg>
  )
}

export default function HeroSection({ movies = [] }) {
  const [current, setCurrent] = useState(0)
  const featured = movies.slice(0, 5)

  useEffect(() => {
    if (featured.length <= 1) return
    const timer = setInterval(() => setCurrent(c => (c + 1) % featured.length), 5000)
    return () => clearInterval(timer)
  }, [featured.length])

  if (!featured.length) return <div className="h-[85vh] bg-dark-800 animate-pulse" />

  const movie = featured[current]

  return (
    <div className="relative h-[85vh] min-h-[600px] overflow-hidden">
      {featured.map((m, i) => (
        <div
          key={m._id}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <img
            src={m.backdrop || m.poster}
            alt={m.title}
            className="w-full h-full object-cover object-top"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900/30 via-transparent to-transparent" />

      <div className="relative h-full flex items-end pb-20 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="max-w-2xl animate-fade-in" key={current}>
          <div className="flex flex-wrap gap-2 mb-4">
            {(movie.genre || []).slice(0, 3).map(g => (
              <span key={g} className="text-xs font-semibold text-brand-400 bg-brand-900/30 border border-brand-800 px-3 py-1 rounded-full">
                {g}
              </span>
            ))}
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {movie.title}
          </h1>

          <div className="flex items-center gap-4 mb-4 text-sm text-gray-300">
            {movie.imdbRating && (
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-white">{movie.imdbRating}</span>
                <span>/10</span>
              </div>
            )}
            {movie.duration && (
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
              </div>
            )}
            <span className="bg-yellow-600 text-black text-xs font-bold px-2 py-0.5 rounded">{movie.rating || 'UA'}</span>
            <span>{movie.language || 'English'}</span>
          </div>

          <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8 line-clamp-3">
            {movie.description}
          </p>

          <div className="flex items-center gap-4">
            <Link
              to={getShowsLink(movie)}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-brand-900/50"
            >
              <Ticket size={18} />
              Book Now
            </Link>
            <Link
              to={getMovieLink(movie)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 border border-white/20"
            >
              <Info size={18} />
              More Info
            </Link>
          </div>
        </div>
      </div>

      {featured.length > 1 && (
        <div className="absolute bottom-8 right-8 flex items-center gap-3">
          <button onClick={() => setCurrent(c => (c - 1 + featured.length) % featured.length)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-1.5">
            {featured.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`transition-all duration-300 rounded-full ${i === current ? 'w-6 h-2 bg-brand-500' : 'w-2 h-2 bg-white/30 hover:bg-white/50'}`} />
            ))}
          </div>
          <button onClick={() => setCurrent(c => (c + 1) % featured.length)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}