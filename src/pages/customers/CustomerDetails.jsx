import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../api/axiosInstance'
import PageHeader from '../../components/common/PageHeader'
import StatusMessage from '../../components/ui/StatusMessage'
import { getCustomerById, getCustomerHistory } from '../../services/customerService'

function CustomerDetails() {
  const { id } = useParams()
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
          <Link className="button button-outline" to="/customers">
            Back
          </Link>
        </div>

        <div className="details-grid">
          <div>
            <span>Customer ID</span>
            <strong className="text-mono">{customer.id}</strong>
          </div>
          <div>
            <span>Phone</span>
            <strong>{customer.phoneNumber || 'Not set'}</strong>
          </div>
        </div>
      </div>

      <div className="surface-panel">
        <div className="section-heading">
          <PageHeader title="Vehicles" subtitle="Vehicles registered under this customer." />
          <Link className="button button-outline" to="/vehicles">
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
        {history.length === 0 ? (
          <StatusMessage type="empty" message="No history records have been added yet." />
        ) : (
          <div className="history-list">
            {history.map((item, index) => (
              <div className="history-item" key={`${item}-${index}`}>
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default CustomerDetails
