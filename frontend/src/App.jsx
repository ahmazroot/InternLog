import { useState, useEffect } from 'react'
import { LoginPage } from './pages/LoginPage'
import { authService } from './services/authService'

function App() {
  const [user, setUser] = useState(() => authService.getUser())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sessionRestored, setSessionRestored] = useState(false)
  const isAuthenticated = Boolean(user) || authService.isLoggedIn()

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
        setSessionRestored(true)
      } catch (err) {
        authService.logout()
        setUser(null)
        setError('Sesi login berakhir, silakan login ulang')
        setSessionRestored(false)
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
      setSessionRestored(false)
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
    setSessionRestored(false)
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-violet-300 text-slate-800">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-violet-300 px-4 py-5 md:px-6">
      <header className="mx-auto mb-3 w-full max-w-5xl">
        <h1 className="m-0 text-sm font-semibold uppercase tracking-[0.08em] text-violet-50">
          InternLog - Google OAuth Demo
        </h1>
      </header>

      <main className="mx-auto w-full max-w-5xl">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-100 px-4 py-3 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        {!isAuthenticated ? (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onLoginError={handleLoginError}
          />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/10">
            <h2 className="mb-3 text-2xl font-semibold text-slate-800">
              Login Successful!
            </h2>
            {sessionRestored && (
              <p className="mb-4 text-sm font-medium text-emerald-700">
                Session restored
              </p>
            )}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="m-0">
                <strong>Name:</strong> {user?.name || 'N/A'}
              </p>
              <p className="mt-2">
                <strong>Email:</strong> {user?.email || 'N/A'}
              </p>
              {user?.profile_picture && (
                <img
                  src={user.profile_picture}
                  alt="Profile"
                  className="mx-auto mt-4 block h-24 w-24 rounded-full object-cover"
                />
              )}
            </div>
            <button
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-white transition hover:-translate-y-0.5 hover:bg-red-700"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
