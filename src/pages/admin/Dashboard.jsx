import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiErrorMessage } from '../../api/axiosInstance'
import PageHeader from '../../components/common/PageHeader'
import StatusMessage from '../../components/ui/StatusMessage'
import { getCustomerById, getCustomers } from '../../services/customerService'
import { getStaff } from '../../services/staffService'

const initialStats = {
  staff: 0,
  customers: 0,
  vehicles: 0,
}

function Dashboard() {
  const [stats, setStats] = useState(initialStats)
  const [recentCustomers, setRecentCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadDashboard() {
      try {
        const [customers, staff] = await Promise.all([getCustomers(), getStaff()])
        const customerDetails = await Promise.all(
          customers.slice(0, 20).map((customer) => getCustomerById(customer.id)),
        )
        const vehicleCount = customerDetails.reduce(
          (total, customer) => total + customer.vehicles.length,
          0,
        )

        if (isCurrent) {
          setStats({
            staff: staff.length,
            customers: customers.length,
            vehicles: vehicleCount,
          })
          setRecentCustomers(customers.slice(0, 5))
        }
      } catch (error) {
        if (isCurrent) setStatus(getApiErrorMessage(error, 'Unable to load dashboard.'))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadDashboard()

    return () => {
      isCurrent = false
    }
  }, [])

  return (
    <section className="page-stack">
      <div className="surface-panel">
        <PageHeader
          title="Dashboard"
          subtitle="Live operational snapshot from the customer and staff modules."
        />

        {isLoading && <StatusMessage message="Loading dashboard..." />}
        {status && <StatusMessage type="error" message={status} />}

        {!isLoading && !status && (
          <div className="stats-grid">
            <Link className="stat-card stat-link" to="/admin/staff">
              <span>Staff</span>
              <strong>{stats.staff}</strong>
            </Link>
            <Link className="stat-card stat-link" to="/admin/customers">
              <span>Customers</span>
              <strong>{stats.customers}</strong>
            </Link>
            <Link className="stat-card stat-link" to="/admin/vehicles">
              <span>Vehicles</span>
              <strong>{stats.vehicles}</strong>
            </Link>
          </div>
        )}
      </div>

      {!isLoading && !status && (
        <div className="surface-panel">
          <div className="section-heading">
            <PageHeader title="Recent Customers" subtitle="Newest visible customer records." />
            <Link className="button button-outline" to="/admin/customers">
              View All
            </Link>
          </div>

          {recentCustomers.length === 0 ? (
            <StatusMessage type="empty" message="No customers found." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.fullName || 'Unnamed customer'}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phoneNumber || <span className="text-muted">Not set</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default Dashboard
