import { Routes, Route, Navigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { CityProvider } from './context/CityContext'

// User pages
import HomePage from './pages/user/HomePage'
import MovieDetailPage from './pages/user/MovieDetailPage'
import ShowsPage from './pages/user/ShowsPage'
import SeatSelectionPage from './pages/user/SeatSelectionPage'
import CheckoutPage from './pages/user/CheckoutPage'
import BookingSuccessPage from './pages/user/BookingSuccessPage'
import MyBookingsPage from './pages/user/MyBookingsPage'
import AuthPage from './pages/user/AuthPage'

// Admin pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMovies from './pages/admin/AdminMovies'
import AdminTheaters from './pages/admin/AdminTheaters'
import AdminShows from './pages/admin/AdminShows'
import AdminBookings from './pages/admin/AdminBookings'

const AdminGuard = ({ children }) => {
  const { user, isLoaded } = useUser()
  if (!isLoaded) return null
  // Check admin role from public metadata
  if (!user || user.publicMetadata?.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  return children
}

export default function App() {
  return (
    <CityProvider>
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route path="/movie/:id/shows" element={<ShowsPage />} />
        <Route path="/show/:id/seats" element={<SeatSelectionPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/booking-success" element={<BookingSuccessPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/sign-in" element={<AuthPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route index element={<AdminDashboard />} />
          <Route path="movies" element={<AdminMovies />} />
          <Route path="theaters" element={<AdminTheaters />} />
          <Route path="shows" element={<AdminShows />} />
          <Route path="bookings" element={<AdminBookings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CityProvider>
  )
}
