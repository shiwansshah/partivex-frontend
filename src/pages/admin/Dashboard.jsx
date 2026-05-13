import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminDashboardSummary } from '../../api/adminDashboardApi'
import { getApiErrorMessage } from '../../api/axiosInstance'
import PageHeader from '../../components/common/PageHeader'
import StatusMessage from '../../components/ui/StatusMessage'
import { getCustomerById, getCustomers } from '../../services/customerService'
import { getStaff } from '../../services/staffService'

const initialStats = {
  staff: 0,
  customers: 0,
  vehicles: 0,
  totalSales: 0,
  totalInventoryQuantity: 0,
  lowStockPartsCount: 0,
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
        const [customers, staff, dashboardSummaryResponse] = await Promise.all([
          getCustomers(),
          getStaff(),
          getAdminDashboardSummary(),
        ])
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
            totalSales: dashboardSummaryResponse.data.totalSales,
            totalInventoryQuantity: dashboardSummaryResponse.data.totalInventoryQuantity,
            lowStockPartsCount: dashboardSummaryResponse.data.lowStockPartsCount,
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
            <Link className="stat-card stat-link" to="/vehicles">
              <span>Vehicles</span>
              <strong>{stats.vehicles}</strong>
            </Link>
            <div className="stat-card">
              <span>Total Sales</span>
              <strong>{formatCurrency(stats.totalSales)}</strong>
            </div>
            <Link className="stat-card stat-link" to="/admin/inventory">
              <span>Stock Quantity</span>
              <strong>{stats.totalInventoryQuantity}</strong>
            </Link>
            <Link className="stat-card stat-link" to="/admin/inventory">
              <span>Low Stock Parts</span>
              <strong>{stats.lowStockPartsCount}</strong>
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

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value ?? 0)
}

export default Dashboard
