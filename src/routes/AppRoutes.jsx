import { Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Dashboard from '../pages/Dashboard'
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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/add" element={<AddCustomer />} />
        <Route path="customers/reports" element={<CustomerReports />} />
        <Route path="customers/:id" element={<CustomerDetails />} />
        <Route path="customers/:id/edit" element={<EditCustomer />} />
        <Route path="customers/:id/add-vehicle" element={<AddVehicle />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
