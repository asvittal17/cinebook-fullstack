import express from 'express'
import {
  getNowPlaying,
  getTrending,
  getUpcoming,
  searchTMDB,
  getTMDBDetails,
  getIndianMovies,
  importFromTMDB,
  getHomeSections
} from '../controllers/tmdbController.js'

const router = express.Router()

router.get('/now-playing', getNowPlaying)
router.get('/trending', getTrending)
router.get('/upcoming', getUpcoming)
router.get('/search', searchTMDB)
router.get('/indian', getIndianMovies)
router.get('/home-sections', getHomeSections)
router.post('/import/:tmdbId', importFromTMDB)
router.get('/:tmdbId', getTMDBDetails)

export default router