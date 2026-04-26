import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Attach Clerk token to every request
api.interceptors.request.use(async (config) => {
  console.log('[API Request]', config.method?.toUpperCase(), config.url, '| Full URL:', config.baseURL + config.url)
  console.log('[API Request] ID in URL:', config.url.split('/').pop())
  try {
    if (window.__clerk_client) {
      const token = await window.__clerk_client.session?.getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {}
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// Helper: check if string is a valid MongoDB ObjectId (24 hex chars)
export const isMongoId = (id) => /^[0-9a-fA-F]{24}$/.test(id)

// Helper: check if string is a TMDB-style ID
export const isTMDBId = (id) => id?.startsWith('tmdb-') || !isMongoId(id)

// ── TMDB API ─────────────────────────────────────────────────────────────
export const tmdbAPI = {
  getNowPlaying: () => api.get('/tmdb/now-playing'),
  getTrending: () => api.get('/tmdb/trending'),
  getUpcoming: () => api.get('/tmdb/upcoming'),
  search: (q) => api.get('/tmdb/search', { params: { q } }),
  getIndian: () => api.get('/tmdb/indian'),
  getHomeSections: () => api.get('/tmdb/home-sections'),
  getById: (tmdbId) => api.get(`/tmdb/${tmdbId}`),
  import: (tmdbId) => api.post(`/tmdb/import/${tmdbId}`),
}

// ── Movies ────────────────────────────────────────────────────────────────────
export const movieAPI = {
  getAll: (params) => api.get('/movies', { params }),
  getNowShowing: () => api.get('/movies/now-showing'),
  getById: (id) => api.get(`/movies/${id}`),
  getTrendingTMDB: () => api.get('/tmdb/trending'),
  importFromTMDB: (tmdbId) => api.post(`/tmdb/import/${tmdbId}`),
  create: (data) => api.post('/movies', data),
  update: (id, data) => api.put(`/movies/${id}`, data),
  delete: (id) => api.delete(`/movies/${id}`),
};

// ── Theaters ──────────────────────────────────────────────────────────────────
export const theaterAPI = {
  getAll: (params) => api.get('/theaters', { params }),
  getCities: () => api.get('/theaters/cities'),
  getById: (id) => api.get(`/theaters/${id}`),
  create: (data) => api.post('/theaters', data),
  update: (id, data) => api.put(`/theaters/${id}`, data),
  delete: (id) => api.delete(`/theaters/${id}`),
};

// ── Shows ─────────────────────────────────────────────────────────────────────
export const showAPI = {
  getByMovie: (movieId, params) => {
    console.log('[showAPI] getByMovie called:', { movieId, params })
    return api.get(`/shows/movie/${movieId}`, { params })
  },
  getById: (id) => {
    console.log('[showAPI.getById] Input ID:', id, '| Type:', typeof id, '| Length:', id?.length)
    console.log('[showAPI.getById] URL will be:', `/shows/${id}`)
    return api.get(`/shows/${id}`)
  },
  getAll: () => api.get('/shows'),
  create: (data) => api.post('/shows', data),
  update: (id, data) => api.put(`/shows/${id}`, data),
  lockSeats: (showId, seatNumbers) => api.post(`/shows/${showId}/lock-seats`, { seatNumbers }),
  releaseSeats: (showId, seatNumbers) => api.post(`/shows/${showId}/release-seats`, { seatNumbers }),
};

// ── Payment ──────────────────────────────────────────────────────────────────
export const paymentAPI = {
  getKey: () => api.get('/payment/key'),
  createOrder: (data) => api.post('/payment/create-order', data),
  verifyPayment: (data) => api.post('/payment/verify', data),
};

// ── Bookings ──────────────────────────────────────────────────────────────────
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  confirm: (data) => api.post('/bookings/confirm', data),
  getMine: () => api.get('/bookings/my'),
  getAll: (params) => api.get('/bookings/all', { params }),
  getAnalytics: () => api.get('/bookings/analytics'),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
};

export default api;