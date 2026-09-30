import { useState } from 'react'
import Login from './components/Login.jsx'
import FarmerDashboard from './components/FarmerDashboard.jsx'
import CustomerShop from './components/CustomerShop.jsx'
import Navbar from './components/Navbar.jsx'
import './App.css'

/*
  App — the root component.
  Keeps track of who's logged in and shows the right page.
*/
function App() {
  // null = nobody logged in yet
  const [user, setUser] = useState(null)

  // Called when user logs in successfully
  const handleLogin = (userData) => {
    setUser(userData)
  }

  // Called when user clicks logout
  const handleLogout = () => {
    setUser(null)
  }

  return (
    <div className="app">
      {user && <Navbar user={user} onLogout={handleLogout} />}

      {!user ? (
        <Login onLogin={handleLogin} />
      ) : user.role === 'farmer' ? (
        <FarmerDashboard user={user} />
      ) : (
        <CustomerShop user={user} />
      )}
    </div>
  )
}

export default App
