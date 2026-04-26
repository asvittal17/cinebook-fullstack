import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useUser, useClerk, SignInButton } from '@clerk/clerk-react'
import { MapPin, ChevronDown, Search, Ticket, Menu, X, Film, LogOut, User, LayoutDashboard } from 'lucide-react'
import { useCity } from '../../context/CityContext'

export default function Navbar() {
  const { user, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const { selectedCity, changeCity, cities } = useCity()
  const navigate = useNavigate()
  const location = useLocation()

  const [cityOpen, setCityOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)

  const cityRef = useRef(null)
  const userRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) setCityOpen(false)
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const isAdmin = user?.publicMetadata?.role === 'admin'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-dark-800/95 backdrop-blur-xl shadow-2xl shadow-black/50 border-b border-dark-600' : 'bg-gradient-to-b from-black/80 to-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center group-hover:bg-brand-500 transition-colors">
              <Film size={18} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white">
              Cine<span className="text-brand-500">Book</span>
            </span>
          </Link>

          {/* Center — City Picker + Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {/* City Selector */}
            <div className="relative" ref={cityRef}>
              <button
                onClick={() => setCityOpen(!cityOpen)}
                className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-dark-600"
              >
                <MapPin size={14} className="text-brand-500" />
                <span>{selectedCity || 'Select City'}</span>
                <ChevronDown size={14} className={`transition-transform ${cityOpen ? 'rotate-180' : ''}`} />
              </button>

              {cityOpen && (
                <div className="absolute top-full mt-2 left-0 w-52 bg-dark-700 border border-dark-500 rounded-xl shadow-2xl overflow-hidden animate-slide-up z-50">
                  <div className="p-2">
                    <p className="text-xs text-dark-100 px-2 py-1 font-semibold uppercase tracking-wider">Select City</p>
                    {cities.length === 0 ? (
                      ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'].map(city => (
                        <button key={city} onClick={() => { changeCity(city); setCityOpen(false) }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${selectedCity === city ? 'bg-brand-600 text-white' : 'text-gray-300 hover:bg-dark-600 hover:text-white'}`}>
                          {city}
                        </button>
                      ))
                    ) : cities.map(city => (
                      <button key={city} onClick={() => { changeCity(city); setCityOpen(false) }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${selectedCity === city ? 'bg-brand-600 text-white' : 'text-gray-300 hover:bg-dark-600 hover:text-white'}`}>
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link to="/" className={`text-sm font-medium transition-colors hover:text-white ${location.pathname === '/' ? 'text-white' : 'text-gray-400'}`}>
              Movies
            </Link>

            {isSignedIn && (
              <Link to="/my-bookings" className={`text-sm font-medium transition-colors hover:text-white ${location.pathname === '/my-bookings' ? 'text-white' : 'text-gray-400'}`}>
                My Bookings
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search movies..."
                    className="bg-dark-600 border border-dark-400 text-white text-sm rounded-lg px-3 py-1.5 w-48 focus:outline-none focus:border-brand-600 transition-all"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-white">
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-white transition-colors">
                  <Search size={18} />
                </button>
              )}
            </div>

            {/* User Menu */}
            {isSignedIn ? (
              <div className="relative" ref={userRef}>
                <button onClick={() => setUserOpen(!userOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-dark-600 transition-colors">
                  <img src={user.imageUrl} alt={user.firstName} className="w-8 h-8 rounded-full object-cover border-2 border-brand-600" />
                  <ChevronDown size={14} className={`text-gray-400 transition-transform hidden sm:block ${userOpen ? 'rotate-180' : ''}`} />
                </button>

                {userOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-dark-700 border border-dark-500 rounded-xl shadow-2xl overflow-hidden animate-slide-up z-50">
                    <div className="p-3 border-b border-dark-500">
                      <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                      <p className="text-xs text-dark-100 truncate">{user.primaryEmailAddress?.emailAddress}</p>
                    </div>
                    <div className="p-2">
                      <Link to="/my-bookings" onClick={() => setUserOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-dark-600 rounded-lg transition-colors">
                        <Ticket size={15} /> My Bookings
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setUserOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-brand-400 hover:text-brand-300 hover:bg-dark-600 rounded-lg transition-colors">
                          <LayoutDashboard size={15} /> Admin Panel
                        </Link>
                      )}
                      <button onClick={() => signOut()}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-dark-600 rounded-lg transition-colors mt-1">
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="btn-primary py-2 px-4 text-sm">Sign In</button>
              </SignInButton>
            )}

            {/* Mobile menu toggle */}
            <button className="md:hidden p-2 rounded-lg hover:bg-dark-600 text-gray-400" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-dark-600 py-4 animate-slide-up">
            <div className="flex flex-col gap-2">
              <Link to="/" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-dark-600 rounded-lg">Movies</Link>
              {isSignedIn && <Link to="/my-bookings" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-dark-600 rounded-lg">My Bookings</Link>}
              {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm text-brand-400 hover:bg-dark-600 rounded-lg">Admin Panel</Link>}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
