import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { getMyStaffFeatureAccess } from '../api/staffFeatureAccessApi'
import AdminLayout from '../components/layout/AdminLayout'
import CustomerLayout from '../components/layout/CustomerLayout'
import StatusMessage from '../components/ui/StatusMessage'
import { getFirstEnabledStaffFeature } from '../constants/staffFeatures'
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
import AddCustomerHistory from '../pages/customers/AddCustomerHistory'
import CustomerReports from '../pages/customers/CustomerReports'
import InventoryPage from '../pages/inventory/InventoryPage'
import PurchasesPage from '../pages/purchases/PurchasesPage'
import AdminDashboard from '../pages/admin/Dashboard'
import StaffManagement from '../pages/admin/StaffManagement'
import CustomerManagement from '../pages/admin/CustomerManagement'
import VendorManagement from '../pages/admin/VendorManagement'
import PartManagement from '../pages/admin/PartManagement'
import FinancialReports from '../pages/admin/FinancialReports'
import CustomerDashboard from '../pages/customer/Dashboard'
import Profile from '../pages/customer/Profile'
import CustomerVehicles from '../pages/customer/Vehicles'
import Appointments from '../pages/customer/Appointments'
import PartRequests from '../pages/customer/PartRequests'
import Reviews from '../pages/customer/Reviews'
import CustomerPartInvoicesPage from '../pages/customer-parts/CustomerPartInvoicesPage'
import AppointmentInvoicesPage from '../pages/appointments/AppointmentInvoicesPage'
import PartRequestApprovals from '../pages/staff/PartRequestApprovals'
import SalesPage from '../pages/sales/SalesPage'
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

function AccessDenied() {
  return (
    <section className="surface-panel">
      <StatusMessage
        type="error"
        message="Access denied. Ask an admin to enable a staff feature for your account."
      />
    </section>
  )
}

function useMyStaffFeatures() {
  const [features, setFeatures] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadFeatures() {
      try {
        const response = await getMyStaffFeatureAccess()
        if (isCurrent) setFeatures(response.data.features)
      } catch {
        if (isCurrent) setStatus('Unable to load staff feature access.')
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadFeatures()

    return () => {
      isCurrent = false
    }
  }, [])

  return { features, isLoading, status }
}

function StaffHomeRedirect() {
  const { features, isLoading, status } = useMyStaffFeatures()

  if (isLoading) return <StatusMessage message="Loading staff features..." />
  if (status) return <AccessDenied />

  const firstFeature = getFirstEnabledStaffFeature(features)

  return firstFeature ? <Navigate to={firstFeature.path.replace('/staff/', '')} replace /> : <AccessDenied />
}

function RequireStaffFeature({ featureKey, children }) {
  const { features, isLoading, status } = useMyStaffFeatures()

  if (isLoading) return <StatusMessage message="Checking staff access..." />
  if (status) return <AccessDenied />

  const hasFeature = features.some((feature) => feature.featureKey === featureKey && feature.isEnabled)

  if (hasFeature) {
    return children
  }

  const firstFeature = getFirstEnabledStaffFeature(features)

  return firstFeature ? <Navigate to={firstFeature.path} replace /> : <AccessDenied />
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
        <Route path="/customers/:id/add-history" element={<AddCustomerHistory />} />
        <Route path="/customers/:id/add-vehicle" element={<AddVehicle />} />
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
        <Route path="customers/:id/add-history" element={<AddCustomerHistory />} />
        <Route path="customers/:id/add-vehicle" element={<AddVehicle />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="vendors" element={<VendorManagement />} />
        <Route path="parts" element={<PartManagement />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="financial-reports" element={<FinancialReports />} />
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
        <Route index element={<StaffHomeRedirect />} />
        <Route
          path="customers"
          element={
            <RequireStaffFeature featureKey="CustomerManagement">
              <CustomerManagement />
            </RequireStaffFeature>
          }
        />
        <Route
          path="customers/add"
          element={
            <RequireStaffFeature featureKey="CustomerManagement">
              <AddCustomer />
            </RequireStaffFeature>
          }
        />
        <Route
          path="customers/reports"
          element={
            <RequireStaffFeature featureKey="CustomerReports">
              <CustomerReports />
            </RequireStaffFeature>
          }
        />
        <Route
          path="customers/:id"
          element={
            <RequireStaffFeature featureKey="CustomerManagement">
              <CustomerDetails />
            </RequireStaffFeature>
          }
        />
        <Route
          path="customers/:id/edit"
          element={
            <RequireStaffFeature featureKey="CustomerManagement">
              <EditCustomer />
            </RequireStaffFeature>
          }
        />
        <Route
          path="customers/:id/add-history"
          element={
            <RequireStaffFeature featureKey="CustomerManagement">
              <AddCustomerHistory />
            </RequireStaffFeature>
          }
        />
        <Route
          path="customers/:id/add-vehicle"
          element={
            <RequireStaffFeature featureKey="CustomerManagement">
              <AddVehicle />
            </RequireStaffFeature>
          }
        />
        <Route
          path="vehicles"
          element={
            <RequireStaffFeature featureKey="Vehicles">
              <VehiclesPage />
            </RequireStaffFeature>
          }
        />
        <Route
          path="sales"
          element={
            <RequireStaffFeature featureKey="Sales">
              <SalesPage />
            </RequireStaffFeature>
          }
        />
        <Route
          path="part-requests"
          element={
            <RequireStaffFeature featureKey="PartRequestApprovals">
              <PartRequestApprovals />
            </RequireStaffFeature>
          }
        />
        <Route
          path="customer-part-invoices"
          element={
            <RequireStaffFeature featureKey="CustomerPartInvoices">
              <CustomerPartInvoicesPage />
            </RequireStaffFeature>
          }
        />
        <Route
          path="appointment-invoices"
          element={
            <RequireStaffFeature featureKey="AppointmentInvoices">
              <AppointmentInvoicesPage />
            </RequireStaffFeature>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
