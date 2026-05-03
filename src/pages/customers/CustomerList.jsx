import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Table from '../../components/common/Table'
import { getCustomers } from '../../api/customerApi'
import { getRequestErrorMessage } from '../../api/axiosClient'

function normalizeList(data) {
  if (Array.isArray(data)) {
    return data
  }

  return data?.items || data?.data || data?.customers || []
}

function CustomerList() {
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCustomers() {
      try {
        setIsLoading(true)
        setError('')

        const response = await getCustomers()
        setCustomers(normalizeList(response.data))
      } catch (requestError) {
        setError(getRequestErrorMessage(requestError, 'Unable to load customers.'))
      } finally {
        setIsLoading(false)
      }
    }

    loadCustomers()
  }, [])

  const rows = customers.map((customer) => ({
    id: customer.id,
    fullName: customer.fullName || '-',
    phone: customer.phone || '-',
    email: customer.email || '-',
    address: customer.address || '-',
    actions: (
      <Link className="table-action customer-table-action" to={`/admin/customers/${customer.id}`}>
        View Details
      </Link>
    ),
  }))

  const columns = [
    { key: 'fullName', label: 'Full Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    { key: 'actions', label: 'Actions' },
  ]

  return (
    <div className="stack customer-workspace">
      <section className="customer-hero">
        <div>
          <span className="customer-kicker">Customer & Vehicle Module</span>
          <h2>Customer Management</h2>
          <p>Manage customer records, contact details, and registered vehicles.</p>
        </div>

        <Link className="button customer-primary-action" to="/admin/customers/add">
          Add Customer
        </Link>
      </section>

      <section className="card customer-card">
        <div className="section-heading customer-section-heading">
          <div>
            <span className="customer-kicker">Records</span>
            <h2>Customer List</h2>
            <p>Customers loaded from the backend customer records API.</p>
          </div>

          <div className="customer-count-card">
            <span>Total Customers</span>
            <strong>{customers.length}</strong>
          </div>
        </div>

        {isLoading && <p className="muted-text">Loading customers...</p>}
        {error && <div className="form-alert">{error}</div>}
        {!isLoading && !error && customers.length === 0 && (
          <p className="muted-text">No customers found.</p>
        )}
        {!isLoading && !error && customers.length > 0 && (
          <Table columns={columns} rows={rows} />
        )}
      </section>
    </div>
  )
}

export default CustomerList
