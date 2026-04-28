import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Table from '../../components/common/Table'
import { getCustomerById, getCustomerVehicles } from '../../api/customerApi'
import { getRequestErrorMessage } from '../../api/axiosClient'

function normalizeList(data) {
  if (Array.isArray(data)) {
    return data
  }

  return data?.items || data?.data || data?.vehicles || []
}

function CustomerDetails() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCustomerDetails() {
      try {
        setIsLoading(true)
        setError('')

        const [customerResponse, vehiclesResponse] = await Promise.all([
          getCustomerById(id),
          getCustomerVehicles(id),
        ])

        setCustomer(customerResponse.data)
        setVehicles(normalizeList(vehiclesResponse.data))
      } catch (requestError) {
        setError(getRequestErrorMessage(requestError, 'Unable to load customer details.'))
      } finally {
        setIsLoading(false)
      }
    }

    loadCustomerDetails()
  }, [id])

  const vehicleRows = vehicles.map((vehicle) => ({
    id: vehicle.id,
    vehicleNumber: vehicle.vehicleNumber || '-',
    brand: vehicle.brand || '-',
    model: vehicle.model || '-',
    year: vehicle.year || '-',
    vehicleType: vehicle.vehicleType || '-',
    notes: vehicle.notes || '-',
  }))

  const vehicleColumns = [
    { key: 'vehicleNumber', label: 'Vehicle Number' },
    { key: 'brand', label: 'Brand' },
    { key: 'model', label: 'Model' },
    { key: 'year', label: 'Year' },
    { key: 'vehicleType', label: 'Type' },
    { key: 'notes', label: 'Notes' },
  ]

  if (isLoading) {
    return (
      <section className="card customer-card customer-workspace">
        <p className="muted-text">Loading customer details...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="card customer-card customer-workspace">
        <div className="form-alert">{error}</div>
        <Link className="button button-secondary page-link" to="/admin/customers">
          Back to Customers
        </Link>
      </section>
    )
  }

  return (
    <div className="stack customer-workspace">
      <section className="card customer-card customer-profile-card">
        <div className="page-header with-actions customer-form-header">
          <div>
            <span className="customer-kicker">Profile</span>
            <h2>Customer Details</h2>
            <p>Customer profile and registered vehicles.</p>
          </div>

          <Link className="button button-secondary" to="/admin/customers">
            Back to Customers
          </Link>
        </div>

        <div className="customer-profile-summary">
          <div className="customer-avatar" aria-hidden="true">
            {(customer?.fullName || 'C').charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="customer-kicker">Selected Customer</span>
            <h3>{customer?.fullName || 'Customer'}</h3>
            <p>{customer?.phone || 'No phone number'}</p>
          </div>
        </div>

        <div className="details-grid customer-details-grid">
          <div>
            <span>Full Name</span>
            <strong>{customer?.fullName || '-'}</strong>
          </div>
          <div>
            <span>Phone</span>
            <strong>{customer?.phone || '-'}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{customer?.email || '-'}</strong>
          </div>
          <div>
            <span>Address</span>
            <strong>{customer?.address || '-'}</strong>
          </div>
        </div>
      </section>

      <section className="card customer-card">
        <div className="section-heading customer-section-heading">
          <div>
            <span className="customer-kicker">Garage</span>
            <h2>Vehicles</h2>
            <p>Vehicles registered for this customer.</p>
          </div>

          <Link className="button customer-primary-action" to={`/admin/customers/${id}/add-vehicle`}>
            Add Vehicle
          </Link>
        </div>

        {vehicles.length === 0 ? (
          <p className="muted-text">No vehicles have been registered yet.</p>
        ) : (
          <Table columns={vehicleColumns} rows={vehicleRows} />
        )}
      </section>
    </div>
  )
}

export default CustomerDetails
