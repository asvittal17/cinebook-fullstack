import express from 'express'
import { createOrder, verifyPayment, getKey } from '../controllers/paymentController.js'

const router = express.Router()

router.post('/create-order', createOrder)
router.post('/verify', verifyPayment)
router.get('/key', getKey)

export default router