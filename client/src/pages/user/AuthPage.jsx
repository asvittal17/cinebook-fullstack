import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignIn, useUser } from '@clerk/clerk-react'
import { Film } from 'lucide-react'

export default function AuthPage() {
  const { isSignedIn } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (isSignedIn) navigate('/', { replace: true })
  }, [isSignedIn])

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(229,9,20,0.08)_0%,transparent_70%)]" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <Film size={22} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-white">Cine<span className="text-brand-500">Book</span></span>
          </div>
          <p className="text-gray-400 text-sm">Sign in to book tickets and manage your bookings</p>
        </div>

        <SignIn
          appearance={{
            variables: { colorPrimary: '#e50914', colorBackground: '#111111', colorText: '#ffffff', colorInputBackground: '#1a1a1a', colorInputText: '#ffffff', borderRadius: '12px' },
            elements: {
              formButtonPrimary: 'bg-brand-600 hover:bg-brand-700',
              card: 'bg-dark-700 border border-dark-500 shadow-2xl',
              headerTitle: 'text-white font-display',
              socialButtonsBlockButton: 'bg-dark-600 border border-dark-400 text-white hover:bg-dark-500',
            }
          }}
          redirectUrl="/"
        />
      </div>
    </div>
  )
}
