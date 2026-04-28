import { NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { getHomePathForRole, hasRole, ROLES } from '../../utils/roles'

function Navbar() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const isAdmin = hasRole(user?.role, [ROLES.ADMIN])
  const canUseStaffWorkspace = hasRole(user?.role, [ROLES.ADMIN, ROLES.STAFF])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <NavLink className="navbar-brand" to={getHomePathForRole(user?.role)}>
        Partivex
      </NavLink>

      <div className="navbar-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/vehicles">Vehicles</NavLink>
        {canUseStaffWorkspace && <NavLink to="/customers">Customers</NavLink>}
        {canUseStaffWorkspace && <NavLink to="/customers/add">Add Customer</NavLink>}
        {canUseStaffWorkspace && <NavLink to="/customers/reports">Customer Reports</NavLink>}
        {canUseStaffWorkspace && <NavLink to="/inventory">Inventory</NavLink>}
        {canUseStaffWorkspace && <NavLink to="/sales">Sales</NavLink>}
        {canUseStaffWorkspace && <NavLink to="/staff">Staff</NavLink>}
        {canUseStaffWorkspace && <NavLink to="/notifications">Notifications</NavLink>}
        {isAdmin && <NavLink to="/admin">Admin Panel</NavLink>}
        <button className="text-button" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar
