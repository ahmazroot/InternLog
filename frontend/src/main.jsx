import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
const root = createRoot(document.getElementById('root'))

if (!googleClientId || googleClientId === 'YOUR_GOOGLE_CLIENT_ID') {
  root.render(
    <StrictMode>
      <div style={{
        fontFamily: 'system-ui, sans-serif',
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
        textAlign: 'center',
      }}>
        <div>
          <h1>Google OAuth client ID missing</h1>
          <p>
            Tambahkan <code>VITE_GOOGLE_CLIENT_ID</code> ke <code>.env.local</code>{' '}
            dan restart dev server.
          </p>
        </div>
      </div>
    </StrictMode>,
  )
} else {
  root.render(
    <StrictMode>
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    </StrictMode>,
  )
}
