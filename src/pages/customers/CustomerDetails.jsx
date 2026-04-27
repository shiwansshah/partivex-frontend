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
      <section className="card">
        <p className="muted-text">Loading customer details...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="card">
        <div className="form-alert">{error}</div>
        <Link className="button button-secondary page-link" to="/admin/customers">
          Back to Customers
        </Link>
      </section>
    )
  }

  return (
    <div className="stack">
      <section className="card">
        <div className="page-header with-actions">
          <div>
            <h2>Customer Details</h2>
            <p>Customer profile and registered vehicles.</p>
          </div>

          <Link className="button button-secondary" to="/admin/customers">
            Back to Customers
          </Link>
        </div>

        <div className="details-grid">
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

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Vehicles</h2>
            <p>Vehicles registered for this customer.</p>
          </div>

          <Link className="button" to={`/admin/customers/${id}/add-vehicle`}>
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
