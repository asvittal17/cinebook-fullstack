import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import { Modal, FormField, AdminTable, PageHeader } from '../../components/admin/AdminUI'
import { showAPI, movieAPI, theaterAPI } from '../../services/api'

const FORMATS = ['2D', '3D', 'IMAX', 'Dolby']
const LANGUAGES = ['Hindi', 'English', 'Tamil', 'Telugu', 'Malayalam', 'Kannada']

const EMPTY_FORM = { movie: '', theater: '', showTime: '', date: '', screen: 1, format: '2D', language: 'Hindi', standardPrice: 180, premiumPrice: 280, reclinerPrice: 450 }

export default function AdminShows() {
  const [shows, setShows] = useState([])
  const [movies, setMovies] = useState([])
  const [theaters, setTheaters] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [showsRes, moviesRes, theatersRes] = await Promise.all([
        showAPI.getAll(), movieAPI.getAll(), theaterAPI.getAll()
      ])
      setShows(showsRes.data)
      setMovies(moviesRes.data)
      setTheaters(theatersRes.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDateTimeChange = (showTime) => {
    const date = showTime ? showTime.split('T')[0] : ''
    setForm(f => ({ ...f, showTime, date }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.movie || !form.theater || !form.showTime) return toast.error('Fill in required fields')
    setSaving(true)
    try {
      const payload = {
        ...form,
        screen: Number(form.screen),
        standardPrice: Number(form.standardPrice),
        premiumPrice: Number(form.premiumPrice),
        reclinerPrice: Number(form.reclinerPrice),
        showTime: new Date(form.showTime).toISOString(),
      }
      await showAPI.create(payload)
      toast.success('Show created with 120 seats!')
      setModalOpen(false)
      load()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const columns = [
    {
      key: 'movie', label: 'Movie',
      render: row => (
        <div className="flex items-center gap-2">
          <img src={row.movie?.poster} alt={row.movie?.title}
            className="w-8 h-10 object-cover rounded-md flex-shrink-0"
            onError={e => e.target.src = 'https://picsum.photos/seed/m/80/100'} />
          <p className="font-medium text-white text-sm">{row.movie?.title || '—'}</p>
        </div>
      )
    },
    {
      key: 'theater', label: 'Theater',
      render: row => (
        <div>
          <p className="text-gray-300 text-sm">{row.theater?.name}</p>
          <p className="text-xs text-gray-500">{row.theater?.city}</p>
        </div>
      )
    },
    {
      key: 'showTime', label: 'Date & Time',
      render: row => (
        <div>
          <p className="text-gray-300 text-sm">{row.showTime ? format(new Date(row.showTime), 'd MMM yyyy') : '—'}</p>
          <p className="text-xs text-gray-400">{row.showTime ? format(new Date(row.showTime), 'h:mm a') : ''}</p>
        </div>
      )
    },
    {
      key: 'format', label: 'Format',
      render: row => <span className="text-xs bg-dark-500 text-gray-300 px-2.5 py-1 rounded-full">{row.format} • {row.language}</span>
    },
    {
      key: 'seats', label: 'Availability',
      render: row => {
        const available = (row.seats || []).filter(s => s.status === 'available').length
        const total = (row.seats || []).length
        const pct = total ? (available / total) * 100 : 0
        return (
          <div className="w-24">
            <p className={`text-xs font-semibold mb-1 ${pct > 30 ? 'text-green-400' : pct > 10 ? 'text-yellow-400' : 'text-red-400'}`}>
              {available}/{total}
            </p>
            <div className="h-1.5 bg-dark-500 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${pct > 30 ? 'bg-green-500' : pct > 10 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      }
    },
    {
      key: 'actions', label: 'Actions',
      render: row => (
        <button onClick={async () => {
          if (!confirm('Delete this show?')) return
          try { await showAPI.update(row._id, { isActive: false }); toast.success('Show removed'); load() }
          catch (e) { toast.error(e.message) }
        }} className="p-2 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-red-400 transition-colors">
          <Trash2 size={14} />
        </button>
      )
    },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Shows"
        subtitle="Manage show timings and seat availability"
        action={
          <button onClick={() => { setForm(EMPTY_FORM); setModalOpen(true) }}
            className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
            <Plus size={16} /> Add Show
          </button>
        }
      />

      <AdminTable columns={columns} data={shows} loading={loading} emptyMessage="No shows scheduled yet." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule New Show" size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <FormField label="Movie" required>
                <select value={form.movie} onChange={e => setForm(f => ({ ...f, movie: e.target.value }))} className="input-field">
                  <option value="">Select a movie...</option>
                  {movies.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
                </select>
              </FormField>
            </div>
            <div className="sm:col-span-2">
              <FormField label="Theater" required>
                <select value={form.theater} onChange={e => setForm(f => ({ ...f, theater: e.target.value }))} className="input-field">
                  <option value="">Select a theater...</option>
                  {theaters.map(t => <option key={t._id} value={t._id}>{t.name}, {t.city}</option>)}
                </select>
              </FormField>
            </div>
            <FormField label="Show Date & Time" required>
              <input type="datetime-local" value={form.showTime}
                onChange={e => handleDateTimeChange(e.target.value)} className="input-field" />
            </FormField>
            <FormField label="Screen Number">
              <input type="number" value={form.screen} onChange={e => setForm(f => ({ ...f, screen: e.target.value }))} min="1" className="input-field" />
            </FormField>
            <FormField label="Format">
              <select value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))} className="input-field">
                {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </FormField>
            <FormField label="Language">
              <select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} className="input-field">
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </FormField>

            {/* Pricing */}
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-gray-300 mb-3">💺 Seat Pricing (₹)</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['Standard (Rows A–C)', 'standardPrice', 'text-emerald-400'],
                  ['Premium (Rows D–G)', 'premiumPrice', 'text-blue-400'],
                  ['Recliner (Rows H–J)', 'reclinerPrice', 'text-purple-400'],
                ].map(([label, key, color]) => (
                  <div key={key}>
                    <p className={`text-xs mb-1.5 font-semibold ${color}`}>{label}</p>
                    <input type="number" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      min="1" className="input-field" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-dark-600 rounded-xl p-3 text-xs text-gray-400">
            ℹ️ 120 seats will be auto-generated (A–J rows × 12 columns) with the pricing above.
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</> : 'Create Show'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
