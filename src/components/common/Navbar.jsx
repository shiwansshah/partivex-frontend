import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">Partivex</div>

      <div className="navbar-links">
        <Link to="/">Dashboard</Link>
        <Link to="/customers">Customers</Link>
        <Link to="/customers/add">Add Customer</Link>
        <Link to="/customers/reports">Customer Reports</Link>
        <Link to="/inventory">Inventory</Link>
        <Link to="/sales">Sales</Link>
        <Link to="/staff">Staff</Link>
        <Link to="/notifications">Notifications</Link>
      </div>
    </nav>
  )
}

export default Navbar
