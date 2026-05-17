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

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">Partivex</div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="eyebrow">{panelLabel}</span>
            <h1>Operations</h1>
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
