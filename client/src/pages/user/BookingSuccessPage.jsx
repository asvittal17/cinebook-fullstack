import { useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { CheckCircle, Download, Home, Ticket, MapPin, Clock, Film, Share2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Navbar from '../../components/common/Navbar'

export default function BookingSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const ticketRef = useRef()
  const { bookingId, show, selectedSeats } = location.state || {}

  useEffect(() => {
    if (!bookingId) navigate('/', { replace: true })
    else {
      // Confetti-style celebration
      const timer = setTimeout(() => {}, 100)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!bookingId) return null

  const total = selectedSeats?.reduce((s, seat) => s + seat.price, 0) || 0
  const bookingRef = 'CB' + bookingId?.slice(-8).toUpperCase()

  const handleShare = async () => {
    const text = `🎬 I just booked ${show?.movie?.title} at ${show?.theater?.name}! Ref: ${bookingRef}`
    if (navigator.share) {
      await navigator.share({ title: 'CineBook Ticket', text })
    } else {
      await navigator.clipboard.writeText(text)
      toast.success('Booking details copied!')
    }
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">

        {/* Success Header */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-full bg-green-900/30 border-2 border-green-500 flex items-center justify-center mx-auto">
              <CheckCircle size={48} className="text-green-400" />
            </div>
            <div className="absolute -inset-2 rounded-full border-2 border-green-500/20 animate-ping" />
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-gray-400">Your tickets are confirmed. Check your email for details.</p>
        </div>

        {/* Ticket Card */}
        <div ref={ticketRef} className="relative animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Ticket shape with notches */}
          <div className="bg-dark-700 border border-dark-500 rounded-3xl overflow-hidden">

            {/* Top section — Movie info */}
            <div className="relative bg-gradient-to-br from-dark-600 to-dark-700 p-6">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 via-brand-400 to-brand-600" />
              <div className="flex gap-4">
                <img
                  src={show?.movie?.poster}
                  alt={show?.movie?.title}
                  className="w-20 h-28 object-cover rounded-xl shadow-lg flex-shrink-0"
                  onError={e => e.target.src = `https://picsum.photos/seed/movie/200/300`}
                />
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 bg-green-900/30 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full mb-2 border border-green-800">
                    <CheckCircle size={10} /> CONFIRMED
                  </div>
                  <h2 className="font-bold text-white text-lg leading-tight mb-3">{show?.movie?.title}</h2>
                  <div className="space-y-1.5 text-xs text-gray-400">
                    <div className="flex items-center gap-1.5"><Clock size={11} className="text-brand-400" />
                      {show?.showTime ? format(new Date(show.showTime), 'EEE, d MMM yyyy • h:mm a') : '—'}
                    </div>
                    <div className="flex items-center gap-1.5"><MapPin size={11} className="text-brand-400" />
                      {show?.theater?.name}, {show?.theater?.city}
                    </div>
                    <div className="flex items-center gap-1.5"><Film size={11} className="text-brand-400" />
                      {show?.format} • {show?.language}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Perforated divider */}
            <div className="relative flex items-center px-4">
              <div className="absolute -left-4 w-8 h-8 rounded-full bg-dark-900 border border-dark-600" />
              <div className="flex-1 border-t-2 border-dashed border-dark-500 mx-4" />
              <div className="absolute -right-4 w-8 h-8 rounded-full bg-dark-900 border border-dark-600" />
            </div>

            {/* Bottom section — Seat & Payment details */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Booking Ref</p>
                  <p className="font-mono font-bold text-white text-lg tracking-widest">{bookingRef}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Paid</p>
                  <p className="font-bold text-white text-lg">₹{total.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Screen</p>
                  <p className="text-white font-semibold">Screen {show?.screen || 1}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Seats</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSeats?.map(s => (
                      <span key={s.seatNumber} className="text-xs bg-yellow-500 text-black font-bold px-1.5 py-0.5 rounded">{s.seatNumber}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Barcode visual */}
              <div className="mt-4 bg-white rounded-xl p-4 flex items-center justify-center gap-0.5 h-16">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div key={i} className="bg-black rounded-sm flex-shrink-0"
                    style={{ width: Math.random() > 0.5 ? 2 : 1, height: Math.random() > 0.3 ? '100%' : '60%' }} />
                ))}
              </div>
              <p className="text-xs text-center text-gray-500 mt-2 font-mono">{bookingRef} • CineBook</p>
            </div>
          </div>
        </div>

        {/* Info message */}
        <div className="mt-6 bg-blue-900/20 border border-blue-800 rounded-xl p-4 text-sm text-blue-300 text-center animate-slide-up">
          📧 A confirmation email with your e-ticket has been sent to your registered email address.
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 animate-slide-up">
          <Link to="/my-bookings" className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2">
            <Ticket size={16} /> My Bookings
          </Link>
          <button onClick={handleShare} className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2">
            <Share2 size={16} /> Share
          </button>
          <Link to="/" className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
            <Home size={16} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
