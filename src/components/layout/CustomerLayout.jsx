import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { getProfile } from '../../api/authApi'
import { removeToken } from '../../utils/tokenStorage'
import useAuth from '../../hooks/useAuth'
import '../../styles/customer.css'

const portalLinks = [
  {
    to: '/customer',
    label: 'Overview',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ),
  },
  {
    to: '/customer/vehicles',
    label: 'Vehicles',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
        <circle cx="7" cy="17" r="2"></circle>
        <path d="M9 17h6"></path>
        <circle cx="17" cy="17" r="2"></circle>
      </svg>
    ),
  },
  {
    to: '/customer/appointments',
    label: 'Appointments',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    ),
  },
  {
    to: '/customer/part-requests',
    label: 'Part Requests',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m7.5 4.27 9 5.15"></path>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
        <path d="m3.3 7 8.7 5 8.7-5"></path>
        <path d="M12 22V12"></path>
      </svg>
    ),
  },
  {
    to: '/customer/reviews',
    label: 'Reviews',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
  },
]

const profileMenuItems = [
  {
    to: '/customer/profile',
    label: 'Profile settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
  },
  {
    to: '/customer/appointments',
    label: 'Appointments',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
        <path d="m9 16 2 2 4-5"></path>
      </svg>
    ),
  },
]

const logoutIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
)

function CustomerLayout() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [profileName, setProfileName] = useState('')
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useAuth()

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

  useEffect(() => {
    if (user?.fullName && !user.fullName.includes('@')) {
      return
    }

    let isCurrent = true

    async function loadProfileName() {
      try {
        const response = await getProfile()
        if (isCurrent) setProfileName(response.data?.fullName || '')
      } catch {
        if (isCurrent) setProfileName('')
      }
    }

    loadProfileName()

    return () => {
      isCurrent = false
    }
  }, [user?.fullName])

  function handleLogout() {
    removeToken()
    navigate('/login')
  }

  function closeMenus() {
    setDropdownOpen(false)
    setMobileNavOpen(false)
  }

  const tokenName = user?.fullName && !user.fullName.includes('@') ? user.fullName : ''
  const customerName = profileName || tokenName || user?.email?.split('@')[0] || 'Customer'
  const userInitials = customerName && customerName !== 'Customer'
    ? customerName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'C'

  return (
    <div className="customer-shell">
      <a className="customer-skip-link" href="#customer-main">Skip to main content</a>

      <header className="customer-topbar">
        <div className="customer-topbar-inner">
          <div className="customer-brand-block">
            <NavLink to="/customer" className="customer-navbar-brand" onClick={closeMenus}>
              Parti<span>vex</span>
            </NavLink>
            <span>Vehicle Service Portal</span>
          </div>

          <button
            className="customer-menu-btn"
            type="button"
            onClick={() => setMobileNavOpen((open) => !open)}
            aria-label="Toggle navigation"
            aria-expanded={mobileNavOpen}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`customer-nav-links ${mobileNavOpen ? 'is-open' : ''}`} aria-label="Customer portal navigation">
            {portalLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/customer'}
                className="customer-nav-link"
                onClick={closeMenus}
              >
                <span className="customer-nav-icon" aria-hidden="true">
                  {link.icon}
                </span>
                {link.label}
              </NavLink>
            ))}
          </nav>

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
                {userInitials}
              </div>
            </button>

            {dropdownOpen && (
              <div className="profile-stack-menu" role="menu" aria-label="Customer quick menu">
                {profileMenuItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="profile-stack-item"
                    role="menuitem"
                    aria-label={item.label}
                    title={item.label}
                    onClick={closeMenus}
                  >
                    {item.icon}
                  </NavLink>
                ))}
                <button
                  className="profile-stack-item is-danger"
                  role="menuitem"
                  aria-label="Logout"
                  title="Logout"
                  onClick={handleLogout}
                  type="button"
                >
                  {logoutIcon}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {mobileNavOpen && <button className="customer-nav-backdrop" type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}

      <div className="customer-app">
        <main id="customer-main" className="customer-content" tabIndex="-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default CustomerLayout
