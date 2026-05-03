import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

function Dashboard() {
  const { user } = useAuth()

  return (
    <section className="dashboard-grid">
      <div className="panel hero-panel">
        <span className="eyebrow">Partivex Workspace</span>
        <h1>Vehicle service management</h1>
        <p>
          Track customer vehicles, manage updates, and keep service records moving from one focused
          workspace.
        </p>
        <Link className="button" to="/vehicles">
          Vehicles
        </Link>
      </div>

      <div className="panel account-panel">
        <span className="eyebrow">Signed In</span>
        <h2>{user?.fullName || user?.email || 'Partivex user'}</h2>
        <div className="details-grid">
          <div>
            <span>Role</span>
            <strong>{user?.role || 'Customer'}</strong>
          </div>
          <div>
            <span>Customer ID</span>
            <strong>{user?.customerId || 'Not available'}</strong>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Dashboard
