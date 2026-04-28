import { Navigate, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import AdminLayout from '../components/layout/AdminLayout'
import useAuth from '../hooks/useAuth'
import MainLayout from '../layouts/MainLayout'
import Dashboard from '../pages/Dashboard'
import Login from '../pages/Login'
import Register from '../pages/Register'
import VehiclesPage from '../pages/VehiclesPage'
import CustomerList from '../pages/customers/CustomerList'
import AddCustomer from '../pages/customers/AddCustomer'
import CustomerDetails from '../pages/customers/CustomerDetails'
import EditCustomer from '../pages/customers/EditCustomer'
import AddVehicle from '../pages/customers/AddVehicle'
import CustomerReports from '../pages/customers/CustomerReports'
import InventoryPage from '../pages/inventory/InventoryPage'
import SalesPage from '../pages/sales/SalesPage'
import StaffPage from '../pages/staff/StaffPage'
import NotificationsPage from '../pages/notifications/NotificationsPage'
import AdminDashboard from '../pages/admin/Dashboard'
import StaffManagement from '../pages/admin/StaffManagement'
import CustomerManagement from '../pages/admin/CustomerManagement'
import { getHomePathForRole, hasRole, ROLES } from '../utils/roles'

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function RequireRole({ allowedRoles, children }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return hasRole(user?.role, allowedRoles) ? (
    children
  ) : (
    <Navigate to={getHomePathForRole(user?.role)} replace />
  )
}

function PublicOnly({ children }) {
  const { isAuthenticated, user } = useAuth()
  return isAuthenticated ? <Navigate to={getHomePathForRole(user?.role)} replace /> : children
}

function RoleHomeRedirect() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={getHomePathForRole(user?.role)} replace />
}

function PortalLayout() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const isAdmin = hasRole(user?.role, [ROLES.ADMIN])
  const canUseStaffWorkspace = hasRole(user?.role, [ROLES.ADMIN, ROLES.STAFF])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <span className="brand-mark">P</span>
          <span>Partivex</span>
        </div>
        <nav className="side-nav">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/vehicles">Vehicles</NavLink>
          {canUseStaffWorkspace && <NavLink to="/customers">Customers</NavLink>}
          {isAdmin && <NavLink to="/admin">Admin</NavLink>}
        </nav>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <div>
            <span className="eyebrow">{user?.role || 'Customer'}</span>
            <h2>Parts & Vehicles</h2>
          </div>
          <button className="text-button" type="button" onClick={handleLogout}>
            Logout
          </button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RoleHomeRedirect />} />
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <Register />
          </PublicOnly>
        }
      />
      <Route
        element={
          <RequireAuth>
            <PortalLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
      </Route>
      <Route
        element={
          <RequireRole allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}>
            <MainLayout />
          </RequireRole>
        }
      >
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/add" element={<AddCustomer />} />
        <Route path="/customers/reports" element={<CustomerReports />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />
        <Route path="/customers/:id/edit" element={<EditCustomer />} />
        <Route path="/customers/:id/add-vehicle" element={<AddVehicle />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>
      <Route
        path="/admin"
        element={
          <RequireRole allowedRoles={[ROLES.ADMIN]}>
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="customers" element={<CustomerManagement />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
