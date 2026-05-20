import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getApiErrorMessage } from '../../api/axiosInstance'
import PageHeader from '../../components/common/PageHeader'
import CustomerSearchBar from '../../components/customers/CustomerSearchBar'
import StatusMessage from '../../components/ui/StatusMessage'
import { getCustomers, searchCustomers } from '../../services/customerService'
import { buildPanelPath } from '../../utils/panelRoutes'

function CustomerList() {
  const location = useLocation()
  const customersPath = buildPanelPath(location.pathname, '/customers')
  const vehiclesPath = buildPanelPath(location.pathname, '/vehicles')
  const [allCustomers, setAllCustomers] = useState([])
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [status, setStatus] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadCustomers() {
      try {
        setStatus('')
        const data = await getCustomers()
        if (isCurrent) {
          setAllCustomers(data)
          setCustomers(data)
        }
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

  async function handleSearch(term) {
    const normalizedTerm = term.trim()
    setSearchTerm(normalizedTerm)

    if (!normalizedTerm) {
      setStatus('')
      setCustomers(allCustomers)
      return
    }

    try {
      setIsSearching(true)
      setStatus('')
      const results = await searchCustomers(normalizedTerm)
      setCustomers(results)
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Unable to search customers.'))
    } finally {
      setIsSearching(false)
    }
  }

  function handleClear() {
    setSearchTerm('')
    setStatus('')
    setCustomers(allCustomers)
  }

  return (
    <section className="page-stack">
      <div className="surface-panel">
        <div className="section-heading">
          <PageHeader
            title="Customers"
            subtitle="View registered customer accounts and open their vehicle records."
          />
          <div className="topbar-actions">
            <Link className="button button-outline" to={`${customersPath}/reports`}>
              Reports
            </Link>
            <Link className="button" to={`${customersPath}/add`}>
              Add Customer
            </Link>
          </div>
        </div>

        <CustomerSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onSearch={handleSearch}
          onClear={handleClear}
          isSearching={isSearching}
        />

        <div className="toolbar">
          <span className="metric-pill">{customers.length} customers</span>
          {searchTerm ? <span className="metric-pill">Filtered by: {searchTerm}</span> : null}
        </div>

        {isLoading && <StatusMessage message="Loading customers..." />}
        {status && <StatusMessage type="error" message={status} />}

        {!isLoading && !status && customers.length === 0 && (
          <StatusMessage type="empty" message="No customers match this search." />
        )}

        {!isLoading && !status && customers.length > 0 && (
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
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <strong>{customer.fullName || 'Unnamed customer'}</strong>
                    </td>
                    <td>{customer.email}</td>
                    <td>{customer.phoneNumber || <span className="text-muted">Not set</span>}</td>
                    <td>
                      <div className="table-actions">
                        <Link className="button button-outline" to={`${customersPath}/${customer.id}`}>
                          Details
                        </Link>
                        <Link className="button button-outline" to={`${customersPath}/${customer.id}/edit`}>
                          Edit
                        </Link>
                        <Link className="button button-outline" to={`${vehiclesPath}?customerId=${customer.id}`}>
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
