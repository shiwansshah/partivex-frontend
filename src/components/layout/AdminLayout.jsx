import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { hasRole, ROLES } from '../../utils/roles'

function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const isAdmin = hasRole(user?.role, [ROLES.ADMIN])
  const basePath = location.pathname.startsWith('/staff') ? '/staff' : '/admin'
  const panelLabel = isAdmin ? 'Admin Panel' : 'Staff Panel'
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    ...(isAdmin ? [{ to: basePath, label: 'Dashboard', end: true }] : []),
    ...(isAdmin ? [{ to: `${basePath}/staff`, label: 'Staff Management' }] : []),
    { to: `${basePath}/customers`, label: 'Customer Management' },
    { to: `${basePath}/vehicles`, label: 'Vehicles' },
    ...(isAdmin
      ? [
          { to: `${basePath}/inventory`, label: 'Inventory Monitoring' },
          { to: `${basePath}/purchases`, label: 'Purchase Invoices' },
        ]
      : [
          { to: `${basePath}/customers/reports`, label: 'Customer Reports' },
          { to: `${basePath}/sales`, label: 'Sales' },
          { to: `${basePath}/notifications`, label: 'Notifications' },
        ]),
  ]

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleNavClick() {
    setSidebarOpen(false)
  }

  return (
    <div className="admin-shell">
      <div
        className={`admin-sidebar-overlay ${sidebarOpen ? 'is-visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <button
          className="admin-sidebar-close"
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="admin-brand">Partivex</div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={handleNavClick}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              className="hamburger-btn"
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <span className="eyebrow">{panelLabel}</span>
              <h1>Operations</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <span className="metric-pill">{user?.email || user?.role || panelLabel}</span>
            <button className="text-button" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
