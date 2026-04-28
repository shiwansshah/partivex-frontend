import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

function AdminLayout() {
  const navigate = useNavigate()
  const { logout } = useAuth()

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
          <NavLink to="/admin/staff">Staff Management</NavLink>
          <NavLink to="/admin/customers">Customer Management</NavLink>
          <NavLink to="/vehicles">Vehicles</NavLink>
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="eyebrow">Admin Panel</span>
            <h1>Administration</h1>
          </div>
          <button className="text-button" type="button" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
