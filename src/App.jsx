import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/admin/Dashboard'
import StaffManagement from './pages/admin/StaffManagement'
import CustomerManagement from './pages/admin/CustomerManagement'
import VendorManagement from './pages/admin/VendorManagement'

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
        <Route path="vendors" element={<VendorManagement />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
