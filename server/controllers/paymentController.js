import dotenv from 'dotenv'
dotenv.config()

import Razorpay from 'razorpay'
import crypto from 'crypto'

let razorpay = null

try {
  if (
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET
  ) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    console.log('[Razorpay] Initialized successfully')
  } else {
    console.warn('[Razorpay] Keys not configured - demo mode enabled')
  }
} catch (err) {
  console.error('[Razorpay Init Error]', err)
}

export const createOrder = async (req, res) => {
  try {
    let { amount, currency = 'INR', receipt, notes = {} } = req.body

    // Convert amount safely
    amount = Number(amount)

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount',
      })
    }

    console.log('[Razorpay] Creating order:', {
      amount,
      currency,
    })

    // Demo mode
    if (!razorpay) {
      const fakeOrderId = 'order_demo_' + Date.now()

      console.log('[Razorpay] Demo mode - returning fake order')

      return res.json({
        success: true,
        data: {
          orderId: fakeOrderId,
          amount: Math.round(amount * 100),
          currency,
          receipt: receipt || `receipt_${Date.now()}`,
          demo: true,
        },
      })
    }

    const options = {
      amount: Math.round(amount * 100), // paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        ...notes,
        platform: 'CineBook',
      },
    }

    const order = await razorpay.orders.create(options)

    console.log('[Razorpay] Order created:', order.id)

    return res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
    })
  } catch (err) {
    console.error('[Razorpay] Error creating order:', err)
    console.error(err.stack)

    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to create order',
    })
  }
}

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment details',
      })
    }

    // Demo mode
    if (razorpay_order_id.startsWith('order_demo_')) {
      console.log(
        '[Razorpay] Demo mode - skipping signature verification'
      )

      return res.json({
        success: true,
        message: 'Payment verified (demo)',
      })
    }

    const generatedSignature = crypto
      .createHmac(
        'sha256',
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest('hex')

    if (generatedSignature === razorpay_signature) {
      console.log(
        '[Razorpay] Payment verified successfully'
      )

      return res.json({
        success: true,
        message: 'Payment verified',
      })
    } else {
      console.error('[Razorpay] Signature mismatch')

      return res.status(400).json({
        success: false,
        message: 'Invalid signature',
      })
    }
  } catch (err) {
    console.error('[Razorpay] Verification error:', err)
    console.error(err.stack)

    return res.status(500).json({
      success: false,
      message: 'Verification failed',
    })
  }
}

export const getKey = (req, res) => {
  return res.json({
    success: true,
    data: {
      key: process.env.RAZORPAY_KEY_ID || '',
    },
  })
}