import express from 'express';
import { getTheaters, getCities, getTheaterById, createTheater, updateTheater, deleteTheater } from '../controllers/theaterController.js';

const router = express.Router();

router.get('/', getTheaters);
router.get('/cities', getCities);
router.get('/:id', getTheaterById);
router.post('/', createTheater);
router.put('/:id', updateTheater);
router.delete('/:id', deleteTheater);

export default router;