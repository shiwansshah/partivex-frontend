import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from '../components/layout/AdminLayout'
import CustomerLayout from '../components/layout/CustomerLayout'
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
import PurchasesPage from '../pages/purchases/PurchasesPage'
import SalesPage from '../pages/sales/SalesPage'
import NotificationsPage from '../pages/notifications/NotificationsPage'
import AdminDashboard from '../pages/admin/Dashboard'
import StaffManagement from '../pages/admin/StaffManagement'
import CustomerManagement from '../pages/admin/CustomerManagement'
import VendorManagement from '../pages/admin/VendorManagement'
import PartManagement from '../pages/admin/PartManagement'
import CustomerDashboard from '../pages/customer/Dashboard'
import Profile from '../pages/customer/Profile'
import CustomerVehicles from '../pages/customer/Vehicles'
import Appointments from '../pages/customer/Appointments'
import PartRequests from '../pages/customer/PartRequests'
import Reviews from '../pages/customer/Reviews'
import CustomerPartInvoicesPage from '../pages/customer-parts/CustomerPartInvoicesPage'
import AppointmentInvoicesPage from '../pages/appointments/AppointmentInvoicesPage'
import PartRequestApprovals from '../pages/staff/PartRequestApprovals'
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
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      <Route
        path="/customer"
        element={
          <RequireRole allowedRoles={[ROLES.CUSTOMER]}>
            <CustomerLayout />
          </RequireRole>
        }
      >
        <Route index element={<CustomerDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="vehicles" element={<CustomerVehicles />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="part-requests" element={<PartRequests />} />
        <Route path="reviews" element={<Reviews />} />
      </Route>
      <Route
        element={
          <RequireRole allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}>
            <MainLayout />
          </RequireRole>
        }
      >
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/add" element={<AddCustomer />} />
        <Route path="/customers/reports" element={<CustomerReports />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />
        <Route path="/customers/:id/edit" element={<EditCustomer />} />
        <Route path="/customers/:id/add-vehicle" element={<AddVehicle />} />
        <Route path="/sales" element={<SalesPage />} />
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
        <Route path="customers/add" element={<AddCustomer />} />
        <Route path="customers/reports" element={<CustomerReports />} />
        <Route path="customers/:id" element={<CustomerDetails />} />
        <Route path="customers/:id/edit" element={<EditCustomer />} />
        <Route path="customers/:id/add-vehicle" element={<AddVehicle />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="vendors" element={<VendorManagement />} />
        <Route path="parts" element={<PartManagement />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="customer-part-invoices" element={<CustomerPartInvoicesPage />} />
        <Route path="appointment-invoices" element={<AppointmentInvoicesPage />} />
      </Route>
      <Route
        path="/staff"
        element={
          <RequireRole allowedRoles={[ROLES.STAFF]}>
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="customers" replace />} />
        <Route path="customers" element={<CustomerManagement />} />
        <Route path="customers/add" element={<AddCustomer />} />
        <Route path="customers/reports" element={<CustomerReports />} />
        <Route path="customers/:id" element={<CustomerDetails />} />
        <Route path="customers/:id/edit" element={<EditCustomer />} />
        <Route path="customers/:id/add-vehicle" element={<AddVehicle />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="part-requests" element={<PartRequestApprovals />} />
        <Route path="customer-part-invoices" element={<CustomerPartInvoicesPage />} />
        <Route path="appointment-invoices" element={<AppointmentInvoicesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
