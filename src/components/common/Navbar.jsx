import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { getHomePathForRole, hasRole, ROLES } from '../../utils/roles'

function Navbar() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const isAdmin = hasRole(user?.role, [ROLES.ADMIN])
  const canUseStaffWorkspace = hasRole(user?.role, [ROLES.ADMIN, ROLES.STAFF])
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleNavClick() {
    setMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <NavLink className="navbar-brand" to={getHomePathForRole(user?.role)}>
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

      <div className={`navbar-links ${menuOpen ? 'is-open' : ''}`}>
        <NavLink to="/vehicles" onClick={handleNavClick}>Vehicles</NavLink>
        {canUseStaffWorkspace && <NavLink to="/customers" onClick={handleNavClick}>Customers</NavLink>}
        {canUseStaffWorkspace && <NavLink to="/customers/reports" onClick={handleNavClick}>Customer Reports</NavLink>}
        <NavLink to={getHomePathForRole(user?.role)} onClick={handleNavClick}>
          {isAdmin ? 'Admin Panel' : 'Staff Panel'}
        </NavLink>
        <span className="metric-pill">{user?.role || 'User'}</span>
        <button className="text-button" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar
