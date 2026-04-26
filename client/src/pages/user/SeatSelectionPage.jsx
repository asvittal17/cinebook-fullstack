import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { MapPin, Clock, Film, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Navbar from '../../components/common/Navbar'
import SeatSelector from '../../components/user/SeatSelector'
import { showAPI } from '../../services/api'

export default function SeatSelectionPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [show, setShow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadShow = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log('[SeatSelectionPage] useParams id:', id, '| Type:', typeof id)
        const r = await showAPI.getById(id)
        console.log('[SeatSelectionPage] Response:', r)
        setShow(r.data)
      } catch (err) {
        console.error('[SeatSelectionPage] Error:', err)
        setError(err.message)
        toast.error('Failed to load show details')
      } finally {
        setLoading(false)
      }
    }
    loadShow()
  }, [id])

  const handleSelectSeats = (seats) => {
    setSelectedSeats(seats)
  }

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat')
      return
    }
    const total = selectedSeats.reduce((sum, s) => sum + s.price, 0)
    navigate('/checkout', { state: { show, selectedSeats, totalAmount: total } })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !show) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-40 text-center">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Show Not Found</h2>
          <p className="text-gray-400 mb-4">{error || 'Unable to load show details'}</p>
          <button onClick={() => navigate('/')} className="btn-primary">Go Home</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      
      {/* Show Info Header */}
      <div className="pt-16 bg-dark-800 border-b border-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={show.movie?.poster || 'https://picsum.photos/100/150'} alt={show.movie?.title}
              className="w-12 h-16 object-cover rounded-lg" onError={e => e.target.src = 'https://picsum.photos/seed/movie/100/150'} />
            <div>
              <h1 className="font-bold text-white text-lg">{show.movie?.title || 'Movie'}</h1>
              <div className="flex flex-wrap gap-2 text-xs text-gray-400 mt-1">
                <span className="flex items-center gap-1"><MapPin size={12} /> {show.theater?.name}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {format(new Date(show.showTime), 'EEE, d MMM • h:mm a')}</span>
                <span>•</span>
                <span>{show.format} • {show.language}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Available: {show.availableSeats}</p>
            <p className="text-xs text-gray-400">Total: {show.totalSeats}</p>
          </div>
        </div>
      </div>

      {/* Seat Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <SeatSelector 
          show={show} 
          onSelectSeats={handleSelectSeats}
          selectedSeats={selectedSeats}
        />

        {/* Continue Button */}
        <div className="mt-8 flex items-center justify-between bg-dark-700 rounded-xl p-4">
          <div>
            <p className="text-sm text-gray-400">{selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected</p>
            <p className="text-xl font-bold text-white">₹{selectedSeats.reduce((s, c) => s + c.price, 0).toLocaleString('en-IN')}</p>
          </div>
          <button onClick={handleContinue} disabled={selectedSeats.length === 0}
            className="btn-primary py-3 px-8 text-base font-bold disabled:opacity-50">
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  )
}