import { X } from 'lucide-react'

export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${widths[size]} bg-dark-700 border border-dark-500 rounded-2xl shadow-2xl overflow-hidden animate-slide-up`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600">
          <h2 className="font-display font-bold text-white text-lg">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  )
}

export function FormField({ label, error, children, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}{required && <span className="text-brand-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

export function AdminTable({ columns, data, loading, emptyMessage = 'No data found' }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-600 bg-dark-600/50">
              {columns.map(col => (
                <th key={col.key} className={`px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider ${col.className || ''}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-600">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map(col => (
                    <td key={col.key} className="px-5 py-4">
                      <div className="h-4 skeleton rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-16 text-center text-gray-500 text-sm">{emptyMessage}</td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={row._id || i} className="hover:bg-dark-600/30 transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className={`px-5 py-4 text-sm ${col.className || ''}`}>
                      {col.render ? col.render(row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
