import { useState, useMemo } from 'react'
import { Monitor } from 'lucide-react'

const SEAT_COLORS = {
  available: { 
    standard: 'bg-emerald-900/40 border-emerald-600 hover:bg-emerald-600 text-emerald-300', 
    premium: 'bg-blue-900/40 border-blue-600 hover:bg-blue-600 text-blue-300', 
    recliner: 'bg-purple-900/40 border-purple-600 hover:bg-purple-600 text-purple-300' 
  },
  selected: 'bg-yellow-500 border-yellow-400 text-black font-bold scale-105',
  booked: 'bg-dark-600 border-dark-500 text-dark-300 cursor-not-allowed opacity-40',
  locked: 'bg-orange-900/40 border-orange-700 text-orange-500 cursor-not-allowed opacity-60',
}

const generateSeats = (show, existingSeats = []) => {
  const existingMap = new Map(existingSeats.map(s => [s.seatNumber, s]))
  const rows = ['A', 'B', 'C', 'D', 'E', 'F']
  const cols = 12
  const seats = []
  let price = show?.price || 250
  
  rows.forEach(row => {
    for (let col = 1; col <= cols; col++) {
      const seatNumber = `${row}${col}`
      const type = row >= 'D' ? 'premium' : 'standard'
      const seatPrice = show?.format === 'IMAX' ? price + 100 : show?.format === '3D' ? price + 50 : price
      const existing = existingMap.get(seatNumber)
      
      seats.push({
        seatNumber,
        row,
        column: col,
        type,
        price: existing?.price || seatPrice,
        status: existing?.status || (Math.random() < 0.3 ? 'booked' : 'available'),
      })
    }
  })
  
  return seats
}

export default function SeatSelector({ show, onSelectSeats, selectedSeats: externalSelected = [] }) {
  const [internalSelected, setInternalSelected] = useState([])
  
  const selectedSeats = externalSelected.length > 0 ? externalSelected : internalSelected
  
  const seats = useMemo(() => generateSeats(show), [show?._id])
  
  const onSelectionChange = (newSeats) => {
    if (externalSelected.length > 0) {
      onSelectSeats(newSeats)
    } else {
      setInternalSelected(newSeats)
      if (onSelectSeats) onSelectSeats(newSeats)
    }
  }

  const toggleSeat = (seat) => {
    if (seat.status === 'booked' || seat.status === 'locked') return

    const isSelected = selectedSeats.some(s => s.seatNumber === seat.seatNumber)

    if (isSelected) {
      onSelectionChange(selectedSeats.filter(s => s.seatNumber !== seat.seatNumber))
    } else {
      if (selectedSeats.length >= 8) return
      onSelectionChange([...selectedSeats, seat])
    }
  }

  const getSeatClass = (seat) => {
    if (selectedSeats.some(s => s.seatNumber === seat.seatNumber)) return SEAT_COLORS.selected
    if (seat.status === 'booked') return SEAT_COLORS.booked
    if (seat.status === 'locked') return SEAT_COLORS.locked
    return SEAT_COLORS.available[seat.type] || SEAT_COLORS.available.standard
  }

  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = []
    acc[seat.row].push(seat)
    return acc
  }, {})

  const rowKeys = Object.keys(rows).sort()

  const counts = {
    available: seats.filter(s => s.status === 'available').length,
    booked: seats.filter(s => s.status === 'booked').length,
  }

  return (
    <div className="w-full">
      {/* Screen */}
      <div className="mb-10 flex flex-col items-center">
        <div className="relative w-full max-w-lg">
          <div className="h-1.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent rounded-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent h-8 -top-3 rounded-t-[50%]" style={{ filter: 'blur(8px)' }} />
        </div>
        <div className="flex items-center gap-2 mt-3 text-gray-500 text-xs font-medium tracking-widest uppercase">
          <Monitor size={12} />
          <span>All Eyes This Way</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mb-8 text-xs">
        {[
          { label: 'Available', cls: 'bg-emerald-600', count: counts.available },
          { label: 'Selected', cls: 'bg-yellow-500' },
          { label: 'Booked', cls: 'bg-dark-600 opacity-40' },
        ].map(({ label, cls, count }) => (
          <div key={label} className="flex items-center gap-1.5 text-gray-400">
            <div className={`w-4 h-4 rounded-sm border border-white/10 ${cls}`} />
            <span>{label}{count !== undefined ? ` (${count})` : ''}</span>
          </div>
        ))}
      </div>

      {/* Seat Grid */}
      <div className="overflow-x-auto no-scrollbar">
        <div className="min-w-max mx-auto px-4 space-y-1.5">
          {rowKeys.map(row => {
            const rowSeats = rows[row].sort((a, b) => a.column - b.column)
            const midpoint = Math.ceil(rowSeats.length / 2)

            return (
              <div key={row} className="flex items-center gap-2">
                <span className="w-5 text-xs text-gray-500 font-mono font-semibold text-right">{row}</span>
                <div className="flex gap-1">
                  {rowSeats.slice(0, midpoint).map(seat => (
                    <button key={seat.seatNumber} onClick={() => toggleSeat(seat)}
                      disabled={seat.status === 'booked' || seat.status === 'locked'}
                      title={`${seat.seatNumber} — ${seat.type} — ₹${seat.price}`}
                      className={`w-7 h-7 text-[10px] font-mono rounded-sm border transition-all duration-150 focus:outline-none ${getSeatClass(seat)}`}>
                      {seat.column}
                    </button>
                  ))}
                </div>
                <div className="w-6" />
                <div className="flex gap-1">
                  {rowSeats.slice(midpoint).map(seat => (
                    <button key={seat.seatNumber} onClick={() => toggleSeat(seat)}
                      disabled={seat.status === 'booked' || seat.status === 'locked'}
                      title={`${seat.seatNumber} — ${seat.type} — ₹${seat.price}`}
                      className={`w-7 h-7 text-[10px] font-mono rounded-sm border transition-all duration-150 focus:outline-none ${getSeatClass(seat)}`}>
                      {seat.column}
                    </button>
                  ))}
                </div>
                <span className="w-5 text-xs text-gray-500 font-mono font-semibold">{row}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Column numbers */}
      <div className="flex justify-center mt-4 text-xs text-gray-500 font-mono">
        <div className="w-5" />
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6].map(n => <span key={n} className="w-7 text-center">{n}</span>)}
        </div>
        <div className="w-6" />
        <div className="flex gap-1">
          {[7, 8, 9, 10, 11, 12].map(n => <span key={n} className="w-7 text-center">{n}</span>)}
        </div>
        <div className="w-5" />
      </div>

      {/* Selection Summary */}
      {selectedSeats.length > 0 && (
        <div className="mt-8 p-4 bg-dark-600 border border-dark-400 rounded-xl animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white">Selected Seats</h4>
            <span className="text-xs text-gray-500">{selectedSeats.length}/8 max</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedSeats.map(s => (
              <button key={s.seatNumber} onClick={() => toggleSeat(s)}
                className="flex items-center gap-1 bg-yellow-500 text-black text-xs font-bold px-2.5 py-1 rounded-lg hover:bg-yellow-400 transition-colors">
                {s.seatNumber} <span className="opacity-60">×</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Total ({selectedSeats.length} seats)</span>
            <span className="font-bold text-white text-lg">₹{selectedSeats.reduce((s, seat) => s + seat.price, 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}
    </div>
  )
}