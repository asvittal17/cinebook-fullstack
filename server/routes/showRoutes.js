import express from 'express';
import { getShowsByMovie, getShowById, createShow, updateShow, lockSeats, releaseSeats, getAllShows, createDemoShows } from '../controllers/showController.js';

const router = express.Router();

router.get('/movie/:movieId', getShowsByMovie);
router.get('/movie', getAllShows);
router.get('/', getAllShows);
router.get('/:id', getShowById);
router.post('/', createShow);
router.put('/:id', updateShow);
router.post('/:showId/lock-seats', lockSeats);
router.post('/:showId/release-seats', releaseSeats);

// Debug endpoint
router.get('/debug/:movieId', async (req, res) => {
  const { movieId } = req.params;
  const { city, date } = req.query;
  const shows = await createDemoShows(movieId, city || 'Mumbai', date);
  res.json({ success: true, count: shows.length, shows });
});

export default router;