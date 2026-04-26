import Razorpay from 'razorpay';

const razorpay = process.env.RAZORPAY_KEY_ID ? new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
}) : null;

export const createRazorpayOrder = async ({ amount, showId, userId, seatNumbers }) => {
  if (!razorpay) throw new Error('Razorpay not configured');
  
  const order = await razorpay.orders.create({
    amount: amount * 100, // in paise
    currency: 'INR',
    receipt: `show_${showId}_${Date.now()}`,
    notes: {
      showId: showId.toString(),
      userId: userId.toString(),
      seats: seatNumbers.join(','),
    },
  });
  
  return order;
};

export const verifyRazorpayPayment = async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  if (!razorpay) throw new Error('Razorpay not configured');
  
  const crypto = await import('crypto');
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  
  if (generatedSignature !== razorpaySignature) {
    throw new Error('Invalid payment signature');
  }
  
  return true;
};

export default razorpay;