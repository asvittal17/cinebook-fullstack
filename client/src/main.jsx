import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const isValidClerkKey = PUBLISHABLE_KEY && PUBLISHABLE_KEY.startsWith('pk_test_') && PUBLISHABLE_KEY.length > 20

const AppWrapper = () => (
  <BrowserRouter>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        style: { background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: '12px' },
        success: { iconTheme: { primary: '#e50914', secondary: '#fff' } },
      }}
    />
  </BrowserRouter>
)

const root = ReactDOM.createRoot(document.getElementById('root'))

if (isValidClerkKey) {
  root.render(
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignInUrl="/" afterSignUpUrl="/">
      <AppWrapper />
    </ClerkProvider>
  )
} else {
  console.warn('Missing or invalid Clerk Publishable Key — auth features disabled')
  root.render(<AppWrapper />)
}
