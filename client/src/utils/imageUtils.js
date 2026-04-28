// Safe image utilities for the app

export const getPosterUrl = (movie, size = 'w500') => {
  if (!movie) return getFallbackPoster('Movie')
  
  // TMDB poster
  if (movie.poster) return movie.poster
  if (movie.poster_path) return `https://image.tmdb.org/t/p/${size}${movie.poster_path}`
  
  // Generate a clean fallback
  const seed = movie.title?.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'cinebook'
  return `https://placehold.co/300x450/1a1a2e/6366f1?text=${encodeURIComponent(seed.substring(0, 8))}`
}

export const getBackdropUrl = (movie, size = 'w1280') => {
  if (!movie) return 'https://placehold.co/1280x720/1a1a2e/6366f1?text=No+Backdrop'
  
  if (movie.backdrop) return movie.backdrop
  if (movie.backdrop_path) return `https://image.tmdb.org/t/p/${size}${movie.backdrop_path}`
  
  return getPosterUrl(movie, size)
}

export const getFallbackPoster = (text = 'N/A', width = 300, height = 450) => {
  return `https://placehold.co/${width}x${height}/1a1a2e/6366f1?text=${encodeURIComponent(text)}`
}

export const getFallbackImage = (text = 'Image', width = 200, height = 300) => {
  return `https://placehold.co/${width}x${height}/1a1a2e/6366f1?text=${encodeURIComponent(text)}`
}

export const handleImageError = (e, fallbackText = 'Image') => {
  e.target.src = getFallbackPoster(fallbackText)
  e.target.onerror = null // Prevent infinite loop
}