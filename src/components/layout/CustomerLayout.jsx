import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { removeToken } from '../../utils/tokenStorage'
import '../../styles/customer.css'

function CustomerLayout() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    removeToken()
    navigate('/login')
  }

  return (
    <>
      <nav className="customer-navbar">
        <NavLink to="/customer" className="customer-navbar-brand">
          Parti<span>vex</span>
        </NavLink>

        <div className="customer-nav-right" ref={dropdownRef}>
          <button 
            className="profile-avatar-btn" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="Profile menu"
          >
            <div className="avatar-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </button>

          {dropdownOpen && (
            <div className="profile-dropdown">
              <NavLink
                to="/customer/profile"
                className="dropdown-item"
                onClick={() => setDropdownOpen(false)}
              >
                Profile
              </NavLink>
              <NavLink
                to="/customer/vehicles"
                className="dropdown-item"
                onClick={() => setDropdownOpen(false)}
              >
                Vehicles
              </NavLink>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="customer-content">
        <Outlet />
      </main>
    </>
  )
}

export default CustomerLayout
