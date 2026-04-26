import { Link } from 'react-router-dom'
import { Film, Github, Twitter, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-dark-600 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Film size={18} className="text-white" />
              </div>
              <span className="font-display text-xl font-bold">Cine<span className="text-brand-500">Book</span></span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Your ultimate destination for booking movie tickets. Browse latest releases, select your seats, and enjoy the show!
            </p>
            <div className="flex gap-3 mt-5">
              {[Github, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-dark-600 hover:bg-brand-600 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[['Movies', '/'], ['My Bookings', '/my-bookings'], ['Sign In', '/sign-in']].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-gray-400 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Cities</h4>
            <ul className="space-y-2.5">
              {['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'].map(city => (
                <li key={city}>
                  <span className="text-sm text-gray-400">{city}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-600 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} CineBook. All rights reserved.</p>
          <div className="flex gap-5 text-xs text-gray-500">
            {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map(item => (
              <a key={item} href="#" className="hover:text-white transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
