import { useState, useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { LandingPage } from './pages/LandingPage'
import { MagangPage } from './pages/MagangPage'
import { MagangDetailPage } from './pages/MagangDetailPage'
import { WeeklySummaryPage } from './pages/WeeklySummaryPage'
import { FinalReportPage } from './pages/FinalReportPage'
import { authService } from './services/authService'

// ─── Loading screen ────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080c18]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0c326b] to-[#082550] shadow-lg shadow-blue-900/50">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="h-6 w-6">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm font-medium text-slate-400">Memuat InternLog...</span>
        </div>
      </div>
    </div>
  )
}

// ─── Auth guard wrapper ────────────────────────────────────────────────────

function AuthApp() {
  const [user, setUser] = useState(() => authService.getUser())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isAuthenticated = Boolean(user) || authService.isLoggedIn()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      if (!authService.isLoggedIn()) {
        setLoading(false)
        return
      }
      try {
        const profile = await authService.fetchMe()
        setUser(profile)
        setError(null)
      } catch (err) {
        authService.logout()
        setUser(null)
        setError('Sesi login berakhir, silakan login ulang')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleLoginSuccess = async () => {
    try {
      const profile = await authService.fetchMe()
      setUser(profile)
      setError(null)
      navigate('/magang')
    } catch (err) {
      setError(err.message || 'Gagal mengambil data user')
    }
  }

  const handleLoginError = (err) => {
    setError(err.message || 'Login failed')
  }

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    setError(null)
    navigate('/login')
  }

  if (loading) return <LoadingScreen />

  return (
    <Routes>
      {/* ── Public landing page (always accessible) ── */}
      <Route
        path="/"
        element={<LandingPage isAuthenticated={isAuthenticated} />}
      />

      {/* Login */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/magang" replace />
          ) : (
            <div className="flex min-h-screen items-center justify-center bg-white p-4 md:p-8">
              <main className="w-full max-w-[1000px]">
                {error && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-100 px-4 py-3 text-center text-sm text-red-700">
                    {error}
                  </div>
                )}
                <LoginPage
                  onLoginSuccess={handleLoginSuccess}
                  onLoginError={handleLoginError}
                />
              </main>
            </div>
          )
        }
      />

      {/* Protected routes */}
      {isAuthenticated ? (
        <>
          <Route
            path="/magang"
            element={<MagangPage user={user} onLogout={handleLogout} />}
          />
          <Route
            path="/magang/:id"
            element={<MagangDetailPage user={user} onLogout={handleLogout} />}
          />
          <Route
            path="/magang/:id/weekly-summary"
            element={<WeeklySummaryPage user={user} />}
          />
          <Route
            path="/magang/:id/final-report"
            element={<FinalReportPage user={user} />}
          />
          <Route path="*" element={<Navigate to="/magang" replace />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  )
}

// ─── Root App ──────────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <AuthApp />
    </BrowserRouter>
  )
}

export default App

