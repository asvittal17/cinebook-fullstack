import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useClerk } from '@clerk/clerk-react'
import { Film, Building2, Calendar, Ticket, LayoutDashboard, Menu, X, LogOut, ChevronRight } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/admin',          icon: LayoutDashboard, label: 'Dashboard',  exact: true },
  { to: '/admin/movies',   icon: Film,            label: 'Movies'              },
  { to: '/admin/theaters', icon: Building2,       label: 'Theaters'            },
  { to: '/admin/shows',    icon: Calendar,        label: 'Shows'               },
  { to: '/admin/bookings', icon: Ticket,          label: 'Bookings'            },
]

export default function AdminLayout() {
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-dark-900">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-dark-800 border-r border-dark-600 z-40 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-dark-600">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center group-hover:bg-brand-500 transition-colors">
                <Film size={16} className="text-white" />
              </div>
              <div>
                <p className="font-display font-bold text-white text-sm">CineBook</p>
                <p className="text-xs text-brand-400 font-semibold">Admin Panel</p>
              </div>
            </button>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs text-dark-100 uppercase tracking-wider px-3 mb-3 font-semibold">Menu</p>
          {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50'
                    : 'text-gray-400 hover:text-white hover:bg-dark-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'} />
                  <span>{label}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-dark-600">
          <button onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-dark-600 transition-all">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile Top Bar */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-4 bg-dark-800 border-b border-dark-600 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
            <Menu size={22} />
          </button>
          <span className="font-display font-bold text-white">Admin Panel</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
