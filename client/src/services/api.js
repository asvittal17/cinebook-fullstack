import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
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

export const isMongoId = (id) => /^[0-9a-fA-F]{24}$/.test(id)
export const isTMDBId = (id) => id?.startsWith('tmdb-') || !isMongoId(id)

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

export const movieAPI = {
  getAll: (params) => api.get('/movies', { params }),
  getNowShowing: () => api.get('/movies/now-showing'),
  getById: (id) => api.get(`/movies/${id}`),
  getTrendingTMDB: () => api.get('/tmdb/trending'),
  importFromTMDB: (tmdbId) => api.post(`/tmdb/import/${tmdbId}`),
  create: (data) => api.post('/movies', data),
  update: (id, data) => api.put(`/movies/${id}`, data),
  delete: (id) => api.delete(`/movies/${id}`),
}

export const theaterAPI = {
  getAll: (params) => api.get('/theaters', { params }),
  getCities: () => api.get('/theaters/cities'),
  getById: (id) => api.get(`/theaters/${id}`),
  create: (data) => api.post('/theaters', data),
  update: (id, data) => api.put(`/theaters/${id}`, data),
  delete: (id) => api.delete(`/theaters/${id}`),
}

export const showAPI = {
  getByMovie: (movieId, params) => api.get(`/shows/movie/${movieId}`, { params }),
  getById: (id) => api.get(`/shows/${id}`),
  getAll: () => api.get('/shows'),
  create: (data) => api.post('/shows', data),
  update: (id, data) => api.put(`/shows/${id}`, data),
  lockSeats: (showId, seatNumbers) => api.post(`/shows/${showId}/lock-seats`, { seatNumbers }),
  releaseSeats: (showId, seatNumbers) => api.post(`/shows/${showId}/release-seats`, { seatNumbers }),
}

export const paymentAPI = {
  getKey: () => api.get('/payment/key'),
  createOrder: (data) => api.post('/payment/create-order', data),
  verifyPayment: (data) => api.post('/payment/verify', data),
}

export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  confirm: (data) => api.post('/bookings/confirm', data),
  getMine: () => api.get('/bookings/my'),
  getAll: (params) => api.get('/bookings/all', { params }),
  getAnalytics: () => api.get('/bookings/analytics'),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
}

export default api;