import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { MapPin, Clock, Film, ChevronRight, Tag, CreditCard, Wallet, Lock, Shield, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Navbar from '../../components/common/Navbar'
import { bookingAPI, paymentAPI } from '../../services/api'

const COUPONS = { 'FIRST50': 0.5, 'SAVE20': 0.2, 'CINEBOOK10': 0.1 }

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state

  const [bookingId, setBookingId] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  useEffect(() => {
    if (!state?.show) navigate('/', { replace: true })
    
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => setRazorpayLoaded(true)
    document.body.appendChild(script)
    
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  if (!state?.show) return null

  const { show, selectedSeats, totalAmount } = state
  const convenienceFee = Math.round(totalAmount * 0.03)
  const gst = Math.round((totalAmount + convenienceFee) * 0.18)
  const discountAmount = Math.round(totalAmount * discount)
  const grandTotal = totalAmount + convenienceFee + gst - discountAmount

  const applyCoupon = () => {
    const rate = COUPONS[coupon.toUpperCase()]
    if (rate) { setDiscount(rate); toast.success(`Coupon applied! ${rate * 100}% off`) }
    else toast.error('Invalid coupon code')
  }

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast.error('Payment system loading... Please wait')
      return
    }

    setProcessing(true)
    try {
      // 1. Create booking first (pending)
      const booking = await bookingAPI.create({ 
        showId: show._id, 
        seatNumbers: selectedSeats.map(s => s.seatNumber),
        totalAmount: grandTotal,
        paymentMethod: 'razorpay'
      })
      const createdBookingId = booking.data.booking._id
      setBookingId(createdBookingId)

      // 2. Create Razorpay order
      const orderRes = await paymentAPI.createOrder({
        amount: grandTotal,
        receipt: `booking_${createdBookingId}`,
        notes: {
          bookingId: createdBookingId,
          showId: show._id,
          seats: selectedSeats.map(s => s.seatNumber).join(',')
        }
      })

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to create order')
      }

      const { orderId } = orderRes.data

      // 3. Open Razorpay
      const options = {
        key: orderRes.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round(grandTotal * 100),
        currency: 'INR',
        name: 'CineBook',
        description: `Movie: ${show.movie?.title || 'Movie'} | Seats: ${selectedSeats.map(s => s.seatNumber).join(', ')}`,
        image: 'https://via.placeholder.com/150x40?text=CineBook',
        order_id: orderId,
        handler: async (response) => {
          try {
            // 4. Verify payment
            const verifyRes = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })

            if (verifyRes.success) {
              // 5. Confirm booking
              await bookingAPI.confirm({ 
                bookingId: createdBookingId, 
                paymentMethod: 'razorpay',
                paymentId: response.razorpay_payment_id,
                orderId: orderId
              })
              
              toast.success('Booking confirmed!')
              navigate('/booking-success', { 
                state: { 
                  bookingId: createdBookingId, 
                  show, 
                  selectedSeats,
                  paymentId: response.razorpay_payment_id
                }, 
                replace: true 
              })
            } else {
              toast.error('Payment verification failed')
              setProcessing(false)
            }
          } catch (err) {
            toast.error(err.message || 'Payment verification failed')
            setProcessing(false)
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        notes: {
          bookingId: createdBookingId,
          showId: show._id
        },
        theme: {
          color: '#6366f1'
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error.description}`)
        setProcessing(false)
      })
      
      razorpay.open()

    } catch (err) {
      console.error('Payment error:', err)
      toast.error(err.message || 'Payment failed')
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <span>Movies</span><ChevronRight size={12} />
          <span>{show.movie?.title || 'Movie'}</span><ChevronRight size={12} />
          <span className="text-white">Checkout</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <h2 className="section-title">Your Booking</h2>
            <div className="card overflow-hidden">
              <div className="relative h-28 overflow-hidden">
                <img src={show.movie?.poster || 'https://picsum.photos/600/200'} alt={show.movie?.title}
                  className="w-full h-full object-cover object-top"
                  onError={e => e.target.src = 'https://picsum.photos/seed/movie/600/200'} />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-700 to-transparent" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white text-lg">{show.movie?.title || 'Movie'}</h3>
                <div className="space-y-2 mt-3 text-sm text-gray-400">
                  <div className="flex items-center gap-2"><Clock size={13} className="text-brand-500 flex-shrink-0" />{format(new Date(show.showTime), 'EEEE, d MMM yyyy • h:mm a')}</div>
                  <div className="flex items-center gap-2"><MapPin size={13} className="text-brand-500 flex-shrink-0" />{show.theater?.name || 'Theater'}, {show.theater?.city || 'City'}</div>
                  <div className="flex items-center gap-2"><Film size={13} className="text-brand-500 flex-shrink-0" />{show.format || '2D'} • {show.language || 'Hindi'}</div>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Selected Seats</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedSeats.map(s => (
                  <div key={s.seatNumber} className="text-center">
                    <div className="bg-yellow-500 text-black text-xs font-bold w-10 h-10 rounded-lg flex items-center justify-center">{s.seatNumber}</div>
                    <p className="text-xs text-gray-500 mt-0.5">₹{s.price}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-dark-600/50 border border-dark-500 rounded-xl p-4 text-xs text-gray-400 space-y-1.5">
              <p className="font-semibold text-gray-300 mb-2">Cancellation Policy</p>
              <p>• Free cancellation up to 2 hours before show</p>
              <p>• 50% refund up to 30 minutes before show</p>
              <p>• No refund after show starts</p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h2 className="section-title mb-6">Payment</h2>
            
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="card p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Film size={16} className="text-brand-500" /> Order Summary
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>{selectedSeats.length} Ticket{selectedSeats.length > 1 ? 's' : ''}</span>
                    <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Convenience Fee</span>
                    <span>₹{convenienceFee}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>GST (18%)</span>
                    <span>₹{gst}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Coupon ({discount * 100}%)</span>
                      <span>−₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="border-t border-dark-500 pt-2.5 flex justify-between font-bold text-white text-base">
                    <span>Total Payable</span>
                    <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Coupon */}
              <div className="card p-5">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Tag size={16} className="text-brand-500" /> Have a Coupon?
                </h3>
                <div className="flex gap-2">
                  <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())}
                    placeholder="Enter code" className="input-field flex-1 uppercase font-mono text-sm" />
                  <button type="button" onClick={applyCoupon} className="btn-secondary px-4 text-sm">Apply</button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Try: FIRST50, SAVE20, CINEBOOK10</p>
              </div>

              {/* Payment Methods */}
              <div className="card p-4">
                <label className="text-sm font-medium text-gray-300 mb-3 block">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border-2 border-brand-500 bg-brand-500/10">
                    <Wallet size={20} className="text-brand-400 mb-2" />
                    <p className="font-medium text-white text-sm">UPI / Wallets</p>
                    <p className="text-xs text-gray-400">Razorpay</p>
                    <Check size={16} className="text-brand-400 mt-1" />
                  </div>
                  <div className="p-4 rounded-xl border-2 border-dark-500">
                    <CreditCard size={20} className="text-gray-400 mb-2" />
                    <p className="font-medium text-white text-sm">Card</p>
                    <p className="text-xs text-gray-400">Razorpay</p>
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              <button onClick={handlePayment} disabled={processing}
                className="w-full btn-primary py-4 text-base font-bold flex items-center justify-center gap-3 shadow-xl shadow-brand-900/50 disabled:opacity-60">
                {processing ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : (
                  <><Lock size={16} /> Pay ₹{grandTotal.toLocaleString('en-IN')} Securely</>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield size={12} /> Secured by Razorpay
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}