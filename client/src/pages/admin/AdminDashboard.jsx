import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts'
import { TrendingUp, Users, Ticket, DollarSign, Film, Building2, ArrowUpRight, Star } from 'lucide-react'
import { bookingAPI, movieAPI } from '../../services/api'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-700 border border-dark-500 rounded-xl p-3 shadow-xl">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-white text-sm font-bold">₹{Number(p.value).toLocaleString('en-IN')}</p>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([bookingAPI.getAnalytics(), movieAPI.getAll()])
      .then(([analyticsRes, moviesRes]) => {
        setAnalytics(analyticsRes.data)
        setMovies(moviesRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const chartData = analytics?.revenueByMonth?.map(item => ({
    name: MONTH_NAMES[item._id.month - 1],
    revenue: item.revenue,
    bookings: item.count,
  })) || []

  const stats = [
    { label: 'Total Revenue', value: `₹${(analytics?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-900/20 border-green-800', change: '+12.5%' },
    { label: 'Total Bookings', value: (analytics?.totalBookings || 0).toLocaleString(), icon: Ticket, color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-800', change: '+8.2%' },
    { label: 'Active Movies', value: movies.filter(m => m.isActive).length.toString(), icon: Film, color: 'text-purple-400', bg: 'bg-purple-900/20 border-purple-800', change: '+3' },
    { label: 'Avg. Ticket Value', value: analytics?.totalBookings ? `₹${Math.round(analytics.totalRevenue / analytics.totalBookings)}` : '₹0', icon: TrendingUp, color: 'text-brand-400', bg: 'bg-brand-900/20 border-brand-800', change: '+5.1%' },
  ]

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 skeleton rounded-2xl" />)}
      </div>
      <div className="h-72 skeleton rounded-2xl" />
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <Link to="/admin/movies" className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
          <Film size={15} /> Add Movie
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, change }) => (
          <div key={label} className={`card p-5 border ${bg}`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center border ${bg.includes('border') ? '' : 'border-transparent'}`}>
                <Icon size={20} className={color} />
              </div>
              <div className="flex items-center gap-1 text-xs text-green-400 font-semibold">
                <ArrowUpRight size={12} /> {change}
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Revenue Overview</h3>
            <span className="text-xs text-gray-400 bg-dark-600 px-3 py-1 rounded-full">Last 12 months</span>
          </div>
          {chartData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-gray-500 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e50914" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e50914" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="name" stroke="#555" fontSize={11} tickLine={false} />
                <YAxis stroke="#555" fontSize={11} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#e50914" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Movies */}
        <div className="card p-6">
          <h3 className="font-semibold text-white mb-6 flex items-center gap-2"><Star size={16} className="text-yellow-400" /> Top Movies</h3>
          {analytics?.topMovies?.length === 0 || !analytics?.topMovies ? (
            <div className="text-gray-500 text-sm text-center py-10">No bookings yet</div>
          ) : (
            <div className="space-y-4">
              {analytics.topMovies.map((item, i) => (
                <div key={item._id} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-dark-200 w-5 flex-shrink-0">{i + 1}</span>
                  <img src={item.movie?.poster} alt={item.movie?.title}
                    className="w-9 h-12 object-cover rounded-lg flex-shrink-0"
                    onError={e => e.target.src = `https://picsum.photos/seed/${item._id}/90/120`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.movie?.title}</p>
                    <p className="text-xs text-gray-400">{item.count} bookings</p>
                  </div>
                  <p className="text-sm font-bold text-green-400 flex-shrink-0">₹{(item.revenue / 1000).toFixed(1)}k</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { to: '/admin/movies', icon: Film, label: 'Manage Movies', color: 'from-purple-900/50 to-purple-800/20 border-purple-800' },
          { to: '/admin/theaters', icon: Building2, label: 'Manage Theaters', color: 'from-blue-900/50 to-blue-800/20 border-blue-800' },
          { to: '/admin/shows', icon: Ticket, label: 'Manage Shows', color: 'from-green-900/50 to-green-800/20 border-green-800' },
          { to: '/admin/bookings', icon: TrendingUp, label: 'View Bookings', color: 'from-brand-900/50 to-brand-800/20 border-brand-800' },
        ].map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to}
            className={`group card p-5 bg-gradient-to-br ${color} hover:scale-[1.02] transition-all`}>
            <Icon size={24} className="mb-3 text-white/70 group-hover:text-white transition-colors" />
            <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
