import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Star, Clock, Eye, EyeOff, Search, Download, TrendingUp } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Modal, FormField, AdminTable, PageHeader } from '../../components/admin/AdminUI'
import { movieAPI } from '../../services/api'

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Sci-Fi', 'Animation', 'Biography', 'Documentary', 'Mystery', 'Fantasy']
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi']
const RATINGS = ['U', 'UA', 'A', 'S']

const EMPTY_FORM = { title: '', description: '', poster: '', backdrop: '', duration: '', releaseDate: '', genre: [], language: 'Hindi', rating: 'UA', imdbRating: '', director: '', trailerUrl: '', isActive: true }

export default function AdminMovies() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editMovie, setEditMovie] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [tmdbOpen, setTmdbOpen] = useState(false)
  const [tmdbQuery, setTmdbQuery] = useState('')
  const [tmdbResults, setTmdbResults] = useState([])
  const [tmdbLoading, setTmdbLoading] = useState(false)

  const load = () => {
    setLoading(true)
    movieAPI.getAll({ isActive: undefined })
      .then(r => setMovies(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditMovie(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit = (movie) => {
    setEditMovie(movie)
    setForm({
      ...movie,
      releaseDate: movie.releaseDate?.split('T')[0],
      genre: movie.genre || [],
    })
    setModalOpen(true)
  }

  const handleGenreToggle = (g) => {
    setForm(f => ({ ...f, genre: f.genre.includes(g) ? f.genre.filter(x => x !== g) : [...f.genre, g] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.poster || !form.duration || !form.releaseDate) {
      return toast.error('Please fill in all required fields')
    }
    setSaving(true)
    try {
      const payload = { ...form, duration: Number(form.duration), imdbRating: Number(form.imdbRating) || undefined }
      if (editMovie) {
        await movieAPI.update(editMovie._id, payload)
        toast.success('Movie updated!')
      } else {
        await movieAPI.create(payload)
        toast.success('Movie added!')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (movie) => {
    if (!confirm(`Remove "${movie.title}" from active listings?`)) return
    try {
      await movieAPI.delete(movie._id)
      toast.success('Movie removed')
      load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleTMDBSearch = async (e) => {
    e.preventDefault()
    if (!tmdbQuery.trim()) return
    setTmdbLoading(true)
    try {
      const r = await movieAPI.searchTMDB(tmdbQuery)
      setTmdbResults(r.data)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setTmdbLoading(false)
    }
  }

  const handleTMDBImport = async (result) => {
    if (!confirm(`Import "${result.title}" from TMDB?`)) return
    try {
      const r = await movieAPI.importFromTMDB(result.tmdbId)
      toast.success('Movie imported!')
      setTmdbOpen(false)
      load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const loadTrending = async () => {
    setTmdbLoading(true)
    try {
      const r = await movieAPI.getTrendingTMDB()
      setTmdbResults(r.data)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setTmdbLoading(false)
    }
  }

  const columns = [
    {
      key: 'poster', label: 'Movie',
      render: row => (
        <div className="flex items-center gap-3">
          <img src={row.poster} alt={row.title}
            className="w-9 h-12 object-cover rounded-lg flex-shrink-0"
            onError={e => e.target.src = `https://picsum.photos/seed/${row._id}/90/120`} />
          <div>
            <p className="font-semibold text-white text-sm">{row.title}</p>
            <p className="text-xs text-gray-500">{row.language} • {row.rating}</p>
          </div>
        </div>
      )
    },
    {
      key: 'genre', label: 'Genre',
      render: row => (
        <div className="flex flex-wrap gap-1">
          {(row.genre || []).slice(0, 2).map(g => (
            <span key={g} className="text-xs bg-dark-500 text-gray-300 px-2 py-0.5 rounded-full">{g}</span>
          ))}
        </div>
      )
    },
    {
      key: 'duration', label: 'Duration',
      render: row => <span className="text-gray-300 text-sm">{Math.floor(row.duration / 60)}h {row.duration % 60}m</span>
    },
    {
      key: 'imdbRating', label: 'IMDb',
      render: row => row.imdbRating ? (
        <span className="flex items-center gap-1 text-yellow-400 text-sm"><Star size={11} />{row.imdbRating}</span>
      ) : '—'
    },
    {
      key: 'isActive', label: 'Status',
      render: row => (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${row.isActive ? 'bg-green-900/20 text-green-400 border-green-800' : 'bg-dark-500 text-gray-400 border-dark-400'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions', label: 'Actions',
      render: row => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(row)} className="p-2 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-blue-400 transition-colors"><Pencil size={14} /></button>
          <button onClick={() => handleDelete(row)} className="p-2 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
        </div>
      )
    },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Movies"
        subtitle={`${movies.length} movies total`}
        action={
          <div className="flex gap-2">
            <button onClick={() => { setTmdbQuery(''); setTmdbResults([]); setTmdbOpen(true); loadTrending() }} className="btn-secondary py-2 px-4 text-sm flex items-center gap-2">
              <Search size={16} /> Search TMDB
            </button>
            <button onClick={openAdd} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
              <Plus size={16} /> Add Movie
            </button>
          </div>
        }
      />

      <AdminTable columns={columns} data={movies} loading={loading} emptyMessage="No movies yet. Add your first movie!" />

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editMovie ? 'Edit Movie' : 'Add Movie'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <FormField label="Movie Title" required>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Pushpa 2: The Rule" className="input-field" />
              </FormField>
            </div>

            <div className="sm:col-span-2">
              <FormField label="Description" required>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Movie synopsis..." rows={3} className="input-field resize-none" />
              </FormField>
            </div>

            <FormField label="Poster URL" required>
              <input value={form.poster} onChange={e => setForm(f => ({ ...f, poster: e.target.value }))}
                placeholder="https://image.tmdb.org/..." className="input-field" />
            </FormField>

            <FormField label="Backdrop URL">
              <input value={form.backdrop} onChange={e => setForm(f => ({ ...f, backdrop: e.target.value }))}
                placeholder="Wide banner image URL" className="input-field" />
            </FormField>

            <FormField label="Duration (minutes)" required>
              <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                placeholder="150" min="1" className="input-field" />
            </FormField>

            <FormField label="Release Date" required>
              <input type="date" value={form.releaseDate} onChange={e => setForm(f => ({ ...f, releaseDate: e.target.value }))}
                className="input-field" />
            </FormField>

            <FormField label="Language">
              <select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} className="input-field">
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </FormField>

            <FormField label="Censor Rating">
              <select value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} className="input-field">
                {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </FormField>

            <FormField label="IMDb Rating (0–10)">
              <input type="number" value={form.imdbRating} onChange={e => setForm(f => ({ ...f, imdbRating: e.target.value }))}
                placeholder="8.5" min="0" max="10" step="0.1" className="input-field" />
            </FormField>

            <FormField label="Director">
              <input value={form.director} onChange={e => setForm(f => ({ ...f, director: e.target.value }))}
                placeholder="Director name" className="input-field" />
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Trailer URL">
                <input value={form.trailerUrl} onChange={e => setForm(f => ({ ...f, trailerUrl: e.target.value }))}
                  placeholder="YouTube URL" className="input-field" />
              </FormField>
            </div>

            <div className="sm:col-span-2">
              <FormField label="Genres">
                <div className="flex flex-wrap gap-2 mt-1">
                  {GENRES.map(g => (
                    <button key={g} type="button" onClick={() => handleGenreToggle(g)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.genre.includes(g) ? 'bg-brand-600 border-brand-500 text-white' : 'bg-dark-600 border-dark-400 text-gray-400 hover:border-dark-200 hover:text-white'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>
          </div>

          {/* Poster preview */}
          {form.poster && (
            <div className="flex items-center gap-4 p-4 bg-dark-600 rounded-xl">
              <img src={form.poster} alt="preview" className="w-12 h-16 object-cover rounded-lg"
                onError={e => e.target.style.display = 'none'} />
              <p className="text-xs text-gray-400">Poster preview</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : editMovie ? 'Update Movie' : 'Add Movie'}
            </button>
          </div>
        </form>
      </Modal>

      {/* TMDB Search Modal */}
      <Modal open={tmdbOpen} onClose={() => setTmdbOpen(false)} title="Search TMDB for Movies" size="lg">
        <div className="space-y-4">
          <form onSubmit={handleTMDBSearch} className="flex gap-2">
            <input
              value={tmdbQuery}
              onChange={e => setTmdbQuery(e.target.value)}
              placeholder="Search movies (e.g. Pushpa, Dune, Oppenheimer)..."
              className="input-field flex-1"
            />
            <button type="submit" disabled={tmdbLoading} className="btn-primary px-4">
              {tmdbLoading ? '...' : <Search size={16} />}
            </button>
          </form>

          {tmdbLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : tmdbResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {tmdbResults.map(r => (
                <div key={r.tmdbId} className="bg-dark-600 rounded-lg overflow-hidden group">
                  <div className="relative aspect-[2/3]">
                    <img src={r.poster} alt={r.title} className="w-full h-full object-cover"
                      onError={e => e.target.src = 'https://picsum.photos/200/300'} />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => handleTMDBImport(r)} className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1">
                        <Download size={14} /> Import
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-white p-2 truncate">{r.title}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
              <p>Search for movies or import trending ones</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
