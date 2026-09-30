import { useState } from 'react'
import './Login.css'

const API = 'http://127.0.0.1:8000/api'

/*
  Login — handles both login and signup.
  User picks their role (farmer or customer) and enters credentials.
*/
function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('customer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignup) {
        // Sign up first, then log in
        const signupRes = await fetch(`${API}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, role }),
        })
        const signupData = await signupRes.json()
        if (!signupRes.ok) {
          throw new Error(signupData.detail || 'Signup failed')
        }
      }

      // Log in
      const loginRes = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const loginData = await loginRes.json()
      if (!loginRes.ok) {
        throw new Error(loginData.detail || 'Login failed')
      }

      onLogin(loginData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Floating decorative elements */}
      <div className="login-bg-circle circle-1"></div>
      <div className="login-bg-circle circle-2"></div>
      <div className="login-bg-circle circle-3"></div>

      <div className="login-container">
        {/* Left — Hero Section */}
        <div className="login-hero">
          <div className="login-hero-content">
            <span className="login-hero-emoji">🌾</span>
            <h1 className="login-hero-title">KisanSetu</h1>
            <p className="login-hero-subtitle">
              Farm Fresh, Directly to You
            </p>
            <div className="login-hero-features">
              <div className="login-feature">
                <span>🧑‍🌾</span>
                <span>Sell your harvest directly</span>
              </div>
              <div className="login-feature">
                <span>🥕</span>
                <span>Buy fresh from local farms</span>
              </div>
              <div className="login-feature">
                <span>🤝</span>
                <span>No middlemen, fair prices</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Form Section */}
        <div className="login-form-section">
          <div className="login-form-wrapper">
            <h2 className="login-form-title">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="login-form-desc">
              {isSignup
                ? 'Join KisanSetu and start your journey'
                : 'Sign in to continue'}
            </p>

            <form onSubmit={handleSubmit} className="login-form">
              {/* Role Selector — only during signup */}
              {isSignup && (
                <div className="role-selector">
                  <button
                    type="button"
                    className={`role-btn ${role === 'farmer' ? 'active' : ''}`}
                    onClick={() => setRole('farmer')}
                  >
                    <span className="role-icon">🧑‍🌾</span>
                    <span className="role-label">I'm a Farmer</span>
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${role === 'customer' ? 'active' : ''}`}
                    onClick={() => setRole('customer')}
                  >
                    <span className="role-icon">🛒</span>
                    <span className="role-label">I'm a Customer</span>
                  </button>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="form-error">⚠️ {error}</p>}

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading
                  ? '⏳ Please wait...'
                  : isSignup
                  ? '🚀 Create Account'
                  : '🔓 Sign In'}
              </button>
            </form>

            <p className="login-switch">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                className="login-switch-btn"
                onClick={() => {
                  setIsSignup(!isSignup)
                  setError('')
                }}
              >
                {isSignup ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
