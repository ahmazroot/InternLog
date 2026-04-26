import { useState, useEffect } from 'react'
import { LoginButton } from './components/LoginButton'
import { authService } from './services/authService'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check login status on mount
  useEffect(() => {
    const loggedIn = authService.isLoggedIn()
    if (loggedIn) {
      setIsLoggedIn(true)
      setUser(authService.getUser())
    }
    setLoading(false)
  }, [])

  const handleLoginSuccess = (response) => {
    setIsLoggedIn(true)
    setUser(response.user)
    setError(null)
  }

  const handleLoginError = (error) => {
    setError(error.message || 'Login failed')
  }

  const handleLogout = () => {
    authService.logout()
    setIsLoggedIn(false)
    setUser(null)
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>InternLog - Google OAuth Demo</h1>
      </header>

      <main className="app-main">
        {error && <div className="error-message">{error}</div>}

        {!isLoggedIn ? (
          <div className="login-section">
            <h2>Welcome</h2>
            <p>Click the button below to login with your Google account</p>
            <LoginButton
              onLoginSuccess={handleLoginSuccess}
              onLoginError={handleLoginError}
            />
          </div>
        ) : (
          <div className="logged-in-section">
            <h2>Login Successful!</h2>
            <div className="user-info">
              <p>
                <strong>Name:</strong> {user?.name || 'N/A'}
              </p>
              <p>
                <strong>Email:</strong> {user?.email || 'N/A'}
              </p>
              {user?.profile_picture && (
                <img
                  src={user.profile_picture}
                  alt="Profile"
                  className="profile-picture"
                />
              )}
            </div>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
