import express from 'express';
import { getMovies, getMovieById, createMovie, updateMovie, deleteMovie, getNowShowing, searchTMDB, importFromTMDB, getTrendingTMDB } from '../controllers/movieController.js';

const router = express.Router();

router.get('/', getMovies);
router.get('/now-showing', getNowShowing);
router.get('/trending', getTrendingTMDB);
router.get('/search-tmdb', searchTMDB);
router.get('/:id', getMovieById);
router.post('/', createMovie);
router.post('/import-tmdb', importFromTMDB);
router.put('/:id', updateMovie);
router.delete('/:id', deleteMovie);

export default router;