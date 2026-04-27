import { Link } from 'react-router-dom'
import { Star, Clock, Play } from 'lucide-react'

const RATING_COLORS = { U: 'bg-green-600', UA: 'bg-yellow-600', A: 'bg-red-600', S: 'bg-purple-600' }

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

const getPosterUrl = (movie) => {
  // Try poster from TMDB first
  if (movie.poster) return movie.poster
  
  // Try tmdb poster path
  if (movie.poster_path) return `https://image.tmdb.org/t/p/w500${movie.poster_path}`
  
  // Generate a deterministic fallback based on title
  const seed = movie.title?.replace(/\s+/g, '').slice(0, 10) || movie._id || 'default'
  return `https://placehold.co/300x450/1a1a2e/6366f1?text=${encodeURIComponent(seed)}`
}

const handleImageError = (e, movie) => {
  const seed = movie.title?.replace(/\s+/g, '').slice(0, 10) || movie._id || 'default'
  e.target.src = `https://placehold.co/300x450/1a1a2e/6366f1?text=${encodeURIComponent(seed)}`
}

export default function MovieCard({ movie }) {
  const { _id, title, poster, duration, genre = [], imdbRating, rating, releaseDate, tmdbId } = movie

  const posterUrl = getPosterUrl(movie)

  return (
    <div className="group relative">
      <Link to={getMovieLink(movie)} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-dark-700 border border-dark-500 hover:border-dark-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-900/30">
          
          <div className="relative aspect-[2/3] overflow-hidden">
            <img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => handleImageError(e, movie)}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-60" />
            <div className="absolute inset-0 bg-brand-900/0 group-hover:bg-brand-900/20 transition-colors duration-300 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300">
                <Play size={22} className="text-white fill-white ml-1" />
              </div>
            </div>

            <div className={`absolute top-3 left-3 ${RATING_COLORS[rating] || 'bg-gray-600'} text-white text-xs font-bold px-2 py-0.5 rounded-md`}>
              {rating}
            </div>

            {imdbRating && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-md">
                <Star size={11} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-semibold text-white">{imdbRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="p-3">
            <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2 mb-2 group-hover:text-brand-400 transition-colors">
              {title}
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-gray-400">
                <Clock size={11} />
                <span className="text-xs">{Math.floor((duration || 120) / 60)}h {(duration || 120) % 60}m</span>
              </div>
              {genre[0] && (
                <span className="text-xs text-dark-100 bg-dark-600 px-2 py-0.5 rounded-full">{genre[0]}</span>
              )}
            </div>
          </div>
        </div>
      </Link>

      <Link
        to={getShowsLink(movie)}
        className="mt-2 w-full text-center bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold py-2 rounded-lg transition-colors block"
      >
        Book Tickets
      </Link>
    </div>
  )
}

export function MovieCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-dark-700 border border-dark-600">
      <div className="aspect-[2/3] skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-3 skeleton rounded w-1/2" />
        <div className="h-8 skeleton rounded-lg mt-3" />
      </div>
    </div>
  )
}