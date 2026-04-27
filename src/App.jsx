import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/admin/Dashboard'
import StaffManagement from './pages/admin/StaffManagement'
import CustomerManagement from './pages/admin/CustomerManagement'
import AddCustomer from './pages/customers/AddCustomer'
import CustomerDetails from './pages/customers/CustomerDetails'
import AddVehicle from './pages/customers/AddVehicle'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="customers" element={<CustomerManagement />} />
        <Route path="customers/add" element={<AddCustomer />} />
        <Route path="customers/:id" element={<CustomerDetails />} />
        <Route path="customers/:id/add-vehicle" element={<AddVehicle />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
