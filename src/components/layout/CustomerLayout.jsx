import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { removeToken } from '../../utils/tokenStorage'
import '../../styles/customer.css'

const portalLinks = [
  { to: '/customer/profile', label: 'Profile' },
  { to: '/customer/vehicles', label: 'Vehicles' },
  { to: '/customer/appointments', label: 'Appointments' },
  { to: '/customer/part-requests', label: 'Part requests' },
  { to: '/customer/reviews', label: 'Reviews' },
]

function CustomerLayout() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
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

  function handleNavClick() {
    setMenuOpen(false)
    setDropdownOpen(false)
  }

  return (
    <>
      <nav className="customer-navbar">
        <NavLink to="/customer" className="customer-navbar-brand">
          Parti<span>vex</span>
        </NavLink>

        <button
          className="hamburger-btn"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        <div className={`customer-nav-links ${menuOpen ? 'is-open' : ''}`} aria-label="Customer navigation">
          {portalLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className="customer-nav-link" onClick={handleNavClick}>
              {link.label}
            </NavLink>
          ))}
        </div>

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
              {portalLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="dropdown-item"
                  onClick={handleNavClick}
                >
                  {link.label}
                </NavLink>
              ))}
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
