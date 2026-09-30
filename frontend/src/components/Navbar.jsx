import './Navbar.css'

/*
  Navbar — shown at the top when user is logged in.
  Shows the app name, user info, and logout button.
*/
function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <div className="navbar-brand">
          <span className="navbar-logo">🌾</span>
          <span className="navbar-title">KisanSetu</span>
        </div>

        <div className="navbar-user">
          <div className="navbar-avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="navbar-info">
            <span className="navbar-name">{user.username}</span>
            <span className="navbar-role">
              {user.role === 'farmer' ? '🧑‍🌾 Farmer' : '🛒 Customer'}
            </span>
          </div>
          <button className="navbar-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
