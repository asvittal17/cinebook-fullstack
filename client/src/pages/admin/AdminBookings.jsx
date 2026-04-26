import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Search, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react'
import { AdminTable, PageHeader } from '../../components/admin/AdminUI'
import { bookingAPI } from '../../services/api'

const STATUS_CONFIG = {
  confirmed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-900/20 border-green-800' },
  pending:   { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-800' },
  cancelled: { icon: XCircle,    color: 'text-red-400',    bg: 'bg-red-900/20 border-red-800' },
  failed:    { icon: XCircle,    color: 'text-red-400',    bg: 'bg-red-900/20 border-red-800' },
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const load = async () => {
    setLoading(true)
    try {
      const res = await bookingAPI.getAll({ status: statusFilter || undefined, page, limit: 20 })
      setBookings(res.data)
      setTotal(res.total)
      setTotalPages(res.pages)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { setPage(1) }, [statusFilter])
  useEffect(load, [statusFilter, page])

  const filtered = search
    ? bookings.filter(b =>
        b.bookingRef?.toLowerCase().includes(search.toLowerCase()) ||
        b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.user?.email?.toLowerCase().includes(search.toLowerCase())
      )
    : bookings

  const columns = [
    {
      key: 'bookingRef', label: 'Booking Ref',
      render: row => <span className="font-mono text-sm font-bold text-white">{row.bookingRef || 'CB' + row._id?.slice(-8).toUpperCase()}</span>
    },
    {
      key: 'user', label: 'Customer',
      render: row => (
        <div>
          <p className="text-sm font-medium text-white">{row.user?.name || 'Unknown'}</p>
          <p className="text-xs text-gray-500">{row.user?.email}</p>
        </div>
      )
    },
    {
      key: 'show', label: 'Movie & Show',
      render: row => (
        <div>
          <p className="text-sm text-white">{row.show?.movie?.title || '—'}</p>
          <p className="text-xs text-gray-500">
            {row.show?.showTime ? format(new Date(row.show.showTime), 'd MMM yyyy, h:mm a') : '—'}
            {row.show?.theater?.city ? ` • ${row.show.theater.city}` : ''}
          </p>
        </div>
      )
    },
    {
      key: 'seats', label: 'Seats',
      render: row => (
        <div className="flex flex-wrap gap-1">
          {(row.seats || []).map(s => (
            <span key={s.seatNumber} className="text-xs font-mono bg-dark-500 text-gray-300 px-1.5 py-0.5 rounded">{s.seatNumber}</span>
          ))}
        </div>
      )
    },
    {
      key: 'totalAmount', label: 'Amount',
      render: row => <span className="font-bold text-green-400">₹{row.totalAmount?.toLocaleString('en-IN') || 0}</span>
    },
    {
      key: 'status', label: 'Status',
      render: row => {
        const cfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.pending
        const Icon = cfg.icon
        return (
          <span className={`flex items-center gap-1.5 w-fit text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
            <Icon size={11} /> {row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
          </span>
        )
      }
    },
    {
      key: 'createdAt', label: 'Booked At',
      render: row => <span className="text-xs text-gray-500">{row.createdAt ? format(new Date(row.createdAt), 'd MMM, h:mm a') : '—'}</span>
    },
  ]

  const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + (b.totalAmount || 0), 0)

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Bookings"
        subtitle={`${total} total bookings`}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: total, color: 'text-white' },
          { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: 'text-green-400' },
          { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: 'text-yellow-400' },
          { label: 'Revenue (page)', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'text-brand-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, ref..."
            className="input-field pl-9 text-sm"
          />
        </div>

        {/* Status filter */}
        <div className="flex bg-dark-700 rounded-xl p-1 border border-dark-500">
          {[['', 'All'], ['confirmed', 'Confirmed'], ['pending', 'Pending'], ['cancelled', 'Cancelled']].map(([val, label]) => (
            <button key={val} onClick={() => setStatusFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === val ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <AdminTable columns={columns} data={filtered} loading={loading} emptyMessage="No bookings found." />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-dark-600 text-gray-300 disabled:opacity-40 hover:bg-dark-500 text-sm transition-colors">
            ← Prev
          </button>
          <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-dark-600 text-gray-300 disabled:opacity-40 hover:bg-dark-500 text-sm transition-colors">
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
