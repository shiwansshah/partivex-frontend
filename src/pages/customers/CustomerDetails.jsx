import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../api/axiosInstance'
import PageHeader from '../../components/common/PageHeader'
import CustomerHistoryTable from '../../components/customers/CustomerHistoryTable'
import StatusMessage from '../../components/ui/StatusMessage'
import { getCustomerById, getCustomerHistory } from '../../services/customerService'
import { buildPanelPath } from '../../utils/panelRoutes'

function CustomerDetails() {
  const location = useLocation()
  const { id } = useParams()
  const customersPath = buildPanelPath(location.pathname, '/customers')
  const vehiclesPath = buildPanelPath(location.pathname, '/vehicles')
  const [customer, setCustomer] = useState(null)
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadCustomer() {
      try {
        const [customerData, historyData] = await Promise.all([
          getCustomerById(id),
          getCustomerHistory(id),
        ])

        if (isCurrent) {
          setCustomer(customerData)
          setHistory(historyData.records)
        }
      } catch (error) {
        if (isCurrent) setStatus(getApiErrorMessage(error, 'Unable to load customer details.'))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadCustomer()

    return () => {
      isCurrent = false
    }
  }, [id])

  if (isLoading) {
    return <StatusMessage message="Loading customer details..." />
  }

  if (status) {
    return <StatusMessage type="error" message={status} />
  }

  if (!customer) {
    return <StatusMessage type="empty" message="Customer was not found." />
  }

  return (
    <section className="page-stack">
      <div className="surface-panel">
        <div className="section-heading">
          <PageHeader title={customer.fullName || 'Customer Details'} subtitle={customer.email} />
          <div className="topbar-actions">
            <Link className="button button-outline" to={`${customersPath}/${id}/edit`}>
              Edit Customer
            </Link>
            <Link className="button button-outline" to={`${customersPath}/${id}/add-history`}>
              Add History
            </Link>
            <Link className="button button-outline" to={customersPath}>
              Back
            </Link>
          </div>
        </div>

        <div className="details-grid">
          <div>
            <span>Customer ID</span>
            <strong className="text-mono">{customer.id}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{customer.email || 'Not set'}</strong>
          </div>
          <div>
            <span>Phone</span>
            <strong>{customer.phoneNumber || 'Not set'}</strong>
          </div>
          <div>
            <span>Address</span>
            <strong>{customer.address || 'Not set'}</strong>
          </div>
        </div>
      </div>

      <div className="surface-panel">
        <div className="section-heading">
          <PageHeader title="Vehicles" subtitle="Vehicles registered under this customer." />
          <Link className="button button-outline" to={`${vehiclesPath}?customerId=${id}`}>
            Manage Vehicles
          </Link>
        </div>

        {customer.vehicles.length === 0 ? (
          <StatusMessage type="empty" message="No vehicles are registered for this customer." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Number</th>
                </tr>
              </thead>
              <tbody>
                {customer.vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.name}</td>
                    <td>{vehicle.number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="surface-panel">
        <PageHeader title="History" subtitle="Service or customer history entries stored by the backend." />
        <CustomerHistoryTable records={history} />
      </div>
    </section>
  )
}

export default CustomerDetails
