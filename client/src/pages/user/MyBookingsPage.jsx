import { useState, useEffect } from 'react'
import { useUser, SignInButton } from '@clerk/clerk-react'
import { format } from 'date-fns'
import { MapPin, Clock, Film, Ticket, ChevronDown, ChevronUp, XCircle, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import { bookingAPI } from '../../services/api'

const STATUS_CONFIG = {
  confirmed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-900/20 border-green-800', label: 'Confirmed' },
  pending:   { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-800', label: 'Pending' },
  cancelled: { icon: XCircle,    color: 'text-red-400',    bg: 'bg-red-900/20 border-red-800',       label: 'Cancelled' },
  failed:    { icon: XCircle,    color: 'text-red-400',    bg: 'bg-red-900/20 border-red-800',       label: 'Failed' },
}

function BookingCard({ booking, onCancel }) {
  const [expanded, setExpanded] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const { show, seats, totalAmount, status, bookingRef, createdAt } = booking

  const StatusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const StatusIcon = StatusConfig.icon
  const isPast = show?.showTime && new Date(show.showTime) < new Date()

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    setCancelling(true)
    try {
      await bookingAPI.cancel(booking._id)
      toast.success('Booking cancelled and refund initiated')
      onCancel(booking._id)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className={`card overflow-hidden transition-all duration-300 ${status === 'cancelled' ? 'opacity-60' : ''}`}>
      {/* Status bar */}
      <div className={`h-1 ${status === 'confirmed' ? 'bg-green-500' : status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'}`} />

      <div className="p-5">
        <div className="flex gap-4">
          {/* Poster */}
          <img
            src={show?.movie?.poster}
            alt={show?.movie?.title}
            className="w-16 h-22 object-cover rounded-xl flex-shrink-0 shadow-md"
            style={{ height: '88px' }}
            onError={e => e.target.src = `https://picsum.photos/seed/${booking._id}/160/240`}
          />

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-bold text-white text-base leading-tight">{show?.movie?.title}</h3>
              <span className={`flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${StatusConfig.bg} ${StatusConfig.color}`}>
                <StatusIcon size={10} /> {StatusConfig.label}
              </span>
            </div>

            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <Clock size={11} className="text-brand-400" />
                {show?.showTime ? format(new Date(show.showTime), 'EEE, d MMM yyyy • h:mm a') : '—'}
                {isPast && <span className="text-gray-600">(Past)</span>}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={11} className="text-brand-400" />
                {show?.theater?.name}, {show?.theater?.city}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex flex-wrap gap-1.5">
                {seats?.map(s => (
                  <span key={s.seatNumber} className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-700 px-2 py-0.5 rounded font-mono font-semibold">
                    {s.seatNumber}
                  </span>
                ))}
              </div>
              <span className="text-white font-bold text-sm flex-shrink-0">₹{totalAmount?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Expand toggle */}
        <button onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between mt-4 pt-4 border-t border-dark-500 text-xs text-gray-400 hover:text-white transition-colors">
          <span className="font-mono">Ref: {bookingRef || 'CB' + booking._id?.slice(-8).toUpperCase()}</span>
          <span className="flex items-center gap-1">
            {expanded ? 'Less' : 'Details'}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </button>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-dark-600 animate-slide-up space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <p className="text-gray-500 uppercase tracking-wider mb-1">Format</p>
                <p className="text-white font-semibold">{show?.format || '2D'}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase tracking-wider mb-1">Language</p>
                <p className="text-white font-semibold">{show?.language || 'English'}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase tracking-wider mb-1">Booked On</p>
                <p className="text-white font-semibold">{format(new Date(createdAt), 'd MMM yyyy')}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase tracking-wider mb-1">Seats</p>
                <p className="text-white font-semibold">{seats?.length} seat{seats?.length > 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Seat breakdown */}
            <div className="bg-dark-600 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Seat Breakdown</p>
              <div className="space-y-1">
                {seats?.map(s => (
                  <div key={s.seatNumber} className="flex justify-between text-xs">
                    <span className="text-gray-300">{s.seatNumber} <span className="text-gray-500 capitalize">({s.type})</span></span>
                    <span className="text-white">₹{s.price}</span>
                  </div>
                ))}
                <div className="border-t border-dark-500 pt-1 mt-1 flex justify-between text-xs font-bold">
                  <span className="text-gray-300">Total</span>
                  <span className="text-white">₹{totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Cancel button */}
            {status === 'confirmed' && !isPast && (
              <button onClick={handleCancel} disabled={cancelling}
                className="w-full py-2.5 text-sm border border-red-800 text-red-400 hover:bg-red-900/20 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {cancelling ? <><Loader size={14} className="animate-spin" /> Cancelling...</> : <><XCircle size={14} /> Cancel Booking</>}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function MyBookingsPage() {
  const { isSignedIn, isLoaded } = useUser()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!isSignedIn) { setLoading(false); return }
    bookingAPI.getMine()
      .then(r => setBookings(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isSignedIn])

  const handleCancel = (id) => setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b))

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  const upcoming = bookings.filter(b => b.status === 'confirmed' && b.show?.showTime && new Date(b.show.showTime) >= new Date()).length

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-white mb-1">My Bookings</h1>
          {upcoming > 0 && (
            <p className="text-gray-400 text-sm">{upcoming} upcoming show{upcoming > 1 ? 's' : ''} 🎬</p>
          )}
        </div>

        {!isLoaded ? null : !isSignedIn ? (
          <div className="text-center py-20">
            <Ticket size={48} className="text-dark-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Sign in to view bookings</h2>
            <p className="text-gray-400 mb-6">Your booking history will appear here</p>
            <SignInButton mode="modal"><button className="btn-primary px-8">Sign In</button></SignInButton>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex gap-2 mb-6 bg-dark-700 p-1 rounded-xl border border-dark-500 w-fit">
              {[['all', 'All'], ['confirmed', 'Confirmed'], ['cancelled', 'Cancelled']].map(([val, label]) => (
                <button key={val} onClick={() => setFilter(val)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === val ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                  {label}
                  <span className="ml-1.5 text-xs opacity-60">
                    ({val === 'all' ? bookings.length : bookings.filter(b => b.status === val).length})
                  </span>
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="card h-40 skeleton" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <Ticket size={48} className="text-dark-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">No bookings found</h2>
                <p className="text-gray-400 mb-6">Book your first movie experience!</p>
                <a href="/" className="btn-primary px-8 inline-block">Browse Movies</a>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map(booking => (
                  <BookingCard key={booking._id} booking={booking} onCancel={handleCancel} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}
