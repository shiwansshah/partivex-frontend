import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

function AdminLayout() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">Partivex</div>
        <nav className="admin-nav">
          <NavLink to="/admin" end>
            Dashboard
          </NavLink>
          <NavLink to="/admin/activity-logs">Activity Logs</NavLink>
          <NavLink to="/admin/permissions">Permissions</NavLink>
          <NavLink to="/admin/staff">Staff Management</NavLink>
          <NavLink to="/admin/customers">Customer Management</NavLink>
          <NavLink to="/admin/inventory">Inventory Monitoring</NavLink>
          <NavLink to="/admin/purchases">Purchase Invoices</NavLink>
          <NavLink to="/vehicles">Vehicles</NavLink>
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="eyebrow">Admin Panel</span>
            <h1>Administration</h1>
          </div>
          <div className="topbar-actions">
            <span className="metric-pill">{user?.email || user?.role || 'Admin'}</span>
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
