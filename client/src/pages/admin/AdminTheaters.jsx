import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, MapPin, Building2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Modal, FormField, AdminTable, PageHeader } from '../../components/admin/AdminUI'
import { theaterAPI } from '../../services/api'

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat']
const STATES = { Mumbai: 'Maharashtra', Delhi: 'Delhi', Bangalore: 'Karnataka', Hyderabad: 'Telangana', Chennai: 'Tamil Nadu', Pune: 'Maharashtra', Kolkata: 'West Bengal', Ahmedabad: 'Gujarat', Jaipur: 'Rajasthan', Surat: 'Gujarat' }
const AMENITIES_LIST = ['IMAX', 'Dolby Atmos', '4DX', '3D', 'Recliner', 'Wheelchair Access', 'Food Court', 'Parking', 'Kids Zone']

const EMPTY_FORM = { name: '', city: 'Mumbai', address: '', state: 'Maharashtra', pincode: '', totalSeats: 120, screens: 1, amenities: [] }

export default function AdminTheaters() {
  const [theaters, setTheaters] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTheater, setEditTheater] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [cityFilter, setCityFilter] = useState('')

  const load = () => {
    setLoading(true)
    theaterAPI.getAll(cityFilter ? { city: cityFilter } : {})
      .then(r => setTheaters(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [cityFilter])

  const openAdd = () => { setEditTheater(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit = (t) => { setEditTheater(t); setForm({ ...t, amenities: t.amenities || [] }); setModalOpen(true) }

  const handleCityChange = (city) => setForm(f => ({ ...f, city, state: STATES[city] || '' }))

  const toggleAmenity = (a) => setForm(f => ({
    ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a]
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.city || !form.address) return toast.error('Fill in required fields')
    setSaving(true)
    try {
      const payload = { ...form, totalSeats: Number(form.totalSeats), screens: Number(form.screens) }
      if (editTheater) { await theaterAPI.update(editTheater._id, payload); toast.success('Theater updated!') }
      else { await theaterAPI.create(payload); toast.success('Theater added!') }
      setModalOpen(false); load()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (t) => {
    if (!confirm(`Remove "${t.name}"?`)) return
    try { await theaterAPI.delete(t._id); toast.success('Theater removed'); load() }
    catch (err) { toast.error(err.message) }
  }

  const columns = [
    {
      key: 'name', label: 'Theater',
      render: row => (
        <div>
          <p className="font-semibold text-white">{row.name}</p>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><MapPin size={10} />{row.address}</p>
        </div>
      )
    },
    { key: 'city', label: 'City', render: row => <span className="text-gray-300">{row.city}, {row.state}</span> },
    { key: 'totalSeats', label: 'Seats', render: row => <span className="text-gray-300">{row.totalSeats} seats • {row.screens} screen{row.screens > 1 ? 's' : ''}</span> },
    {
      key: 'amenities', label: 'Amenities',
      render: row => (
        <div className="flex flex-wrap gap-1">
          {(row.amenities || []).slice(0, 2).map(a => (
            <span key={a} className="text-xs bg-yellow-900/20 text-yellow-400 border border-yellow-800 px-2 py-0.5 rounded-full">{a}</span>
          ))}
          {(row.amenities || []).length > 2 && <span className="text-xs text-gray-500">+{row.amenities.length - 2}</span>}
        </div>
      )
    },
    {
      key: 'actions', label: 'Actions',
      render: row => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="p-2 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-blue-400 transition-colors"><Pencil size={14} /></button>
          <button onClick={() => handleDelete(row)} className="p-2 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
        </div>
      )
    },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Theaters"
        subtitle={`${theaters.length} theaters across cities`}
        action={
          <button onClick={openAdd} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
            <Plus size={16} /> Add Theater
          </button>
        }
      />

      {/* City Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        {['', ...CITIES].map(city => (
          <button key={city} onClick={() => setCityFilter(city)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm border transition-all ${cityFilter === city ? 'bg-brand-600 border-brand-500 text-white' : 'bg-dark-700 border-dark-500 text-gray-400 hover:text-white'}`}>
            {city || 'All Cities'}
          </button>
        ))}
      </div>

      <AdminTable columns={columns} data={theaters} loading={loading} emptyMessage="No theaters yet. Add one!" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTheater ? 'Edit Theater' : 'Add Theater'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <FormField label="Theater Name" required>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. PVR Inox Select" className="input-field" />
              </FormField>
            </div>
            <FormField label="City" required>
              <select value={form.city} onChange={e => handleCityChange(e.target.value)} className="input-field">
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="State">
              <input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className="input-field" />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Address" required>
                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Full address" className="input-field" />
              </FormField>
            </div>
            <FormField label="Pincode">
              <input value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} className="input-field" />
            </FormField>
            <FormField label="Total Seats">
              <input type="number" value={form.totalSeats} onChange={e => setForm(f => ({ ...f, totalSeats: e.target.value }))} min="1" className="input-field" />
            </FormField>
            <FormField label="Number of Screens">
              <input type="number" value={form.screens} onChange={e => setForm(f => ({ ...f, screens: e.target.value }))} min="1" className="input-field" />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Amenities">
                <div className="flex flex-wrap gap-2 mt-1">
                  {AMENITIES_LIST.map(a => (
                    <button key={a} type="button" onClick={() => toggleAmenity(a)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.amenities.includes(a) ? 'bg-brand-600 border-brand-500 text-white' : 'bg-dark-600 border-dark-400 text-gray-400 hover:border-dark-200 hover:text-white'}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : editTheater ? 'Update' : 'Add Theater'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
