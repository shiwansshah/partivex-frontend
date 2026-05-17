import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { removeToken } from '../../utils/tokenStorage'
import '../../styles/customer.css'

const portalLinks = [
  { to: '/customer', label: 'Overview' },
  { to: '/customer/profile', label: 'Profile' },
  { to: '/customer/vehicles', label: 'Vehicles' },
  { to: '/customer/appointments', label: 'Appointments' },
  { to: '/customer/part-requests', label: 'Parts' },
  { to: '/customer/reviews', label: 'Reviews' },
]

function CustomerLayout() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
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

  function closeMenus() {
    setDropdownOpen(false)
    setMobileNavOpen(false)
  }

  return (
    <div className="customer-shell">
      <a className="customer-skip-link" href="#customer-main">Skip to main content</a>

      <aside className={`customer-sidebar ${mobileNavOpen ? 'is-open' : ''}`} aria-label="Customer portal navigation">
        <div className="customer-sidebar-header">
          <NavLink to="/customer" className="customer-navbar-brand" onClick={closeMenus}>
            Parti<span>vex</span>
          </NavLink>
          <p>Vehicle service portal</p>
        </div>

        <nav className="customer-nav-links">
          {portalLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/customer'} className="customer-nav-link" onClick={closeMenus}>
              <span className="customer-nav-dot" aria-hidden="true" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="customer-sidebar-card">
          <strong>Need service help?</strong>
          <span>Book a visit, request parts, or review your service history from one place.</span>
        </div>
      </aside>

      {mobileNavOpen && <button className="customer-nav-backdrop" type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}

      <div className="customer-app">
        <header className="customer-topbar">
          <button
            className="customer-menu-btn"
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileNavOpen}
          >
            <span />
            <span />
            <span />
          </button>

          <div className="customer-topbar-copy">
            <span>Customer portal</span>
            <strong>Manage service, parts, and vehicles</strong>
          </div>

          <div className="customer-nav-right" ref={dropdownRef}>
            <button
              className="profile-avatar-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="Profile menu"
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              type="button"
            >
              <div className="avatar-circle" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </button>

            {dropdownOpen && (
              <div className="profile-dropdown" role="menu">
                <NavLink to="/customer/profile" className="dropdown-item" role="menuitem" onClick={closeMenus}>
                  Profile settings
                </NavLink>
                <NavLink to="/customer/appointments" className="dropdown-item" role="menuitem" onClick={closeMenus}>
                  Appointments
                </NavLink>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item text-danger" role="menuitem" onClick={handleLogout} type="button">
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main id="customer-main" className="customer-content" tabIndex="-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default CustomerLayout
