import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiErrorMessage } from '../../api/axiosInstance'
import PageHeader from '../../components/common/PageHeader'
import StatusMessage from '../../components/ui/StatusMessage'
import { getCustomers } from '../../services/customerService'

function CustomerList() {
  const [customers, setCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadCustomers() {
      try {
        setStatus('')
        const data = await getCustomers()
        if (isCurrent) setCustomers(data)
      } catch (error) {
        if (isCurrent) setStatus(getApiErrorMessage(error, 'Unable to load customers.'))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadCustomers()

    return () => {
      isCurrent = false
    }
  }, [])

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return customers

    return customers.filter((customer) =>
      [customer.fullName, customer.email, customer.phoneNumber]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    )
  }, [customers, searchTerm])

  return (
    <section className="page-stack">
      <div className="surface-panel">
        <div className="section-heading">
          <PageHeader
            title="Customers"
            subtitle="View registered customer accounts and open their vehicle records."
          />
          <Link className="button" to="/customers/add">
            Add Customer
          </Link>
        </div>

        <div className="toolbar">
          <input
            className="form-control search-input"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, email, or phone"
            type="search"
          />
          <span className="metric-pill">{filteredCustomers.length} customers</span>
        </div>

        {isLoading && <StatusMessage message="Loading customers..." />}
        {status && <StatusMessage type="error" message={status} />}

        {!isLoading && !status && filteredCustomers.length === 0 && (
          <StatusMessage type="empty" message="No customers match this search." />
        )}

        {!isLoading && !status && filteredCustomers.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <strong>{customer.fullName || 'Unnamed customer'}</strong>
                    </td>
                    <td>{customer.email}</td>
                    <td>{customer.phoneNumber || <span className="text-muted">Not set</span>}</td>
                    <td>
                      <div className="table-actions">
                        <Link className="button button-outline" to={`/customers/${customer.id}`}>
                          Details
                        </Link>
                        <Link className="button button-outline" to="/vehicles">
                          Vehicles
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default CustomerList
