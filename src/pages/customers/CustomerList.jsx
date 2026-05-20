import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getApiErrorMessage } from '../../api/axiosInstance'
import PageHeader from '../../components/common/PageHeader'
import CustomerSearchBar from '../../components/customers/CustomerSearchBar'
import StatusMessage from '../../components/ui/StatusMessage'
import { getCustomers } from '../../services/customerService'
import { buildPanelPath } from '../../utils/panelRoutes'

function normalizeSearchValue(value) {
  return String(value ?? '').trim().toLowerCase()
}

function getVehicleSearchText(vehicle) {
  return [
    vehicle?.name,
    vehicle?.model,
    vehicle?.number,
    vehicle?.vehicleNumber,
    vehicle?.id,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function customerMatchesSearch(customer, term) {
  const normalizedTerm = normalizeSearchValue(term)

  if (!normalizedTerm) return true

  const searchableText = [
    customer?.id,
    customer?.customerId,
    customer?.fullName,
    customer?.name,
    customer?.email,
    customer?.phoneNumber,
    customer?.phone,
    customer?.address,
    Array.isArray(customer?.vehicles) ? customer.vehicles.map(getVehicleSearchText).join(' ') : '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return searchableText.includes(normalizedTerm)
}

function CustomerList() {
  const location = useLocation()
  const customersPath = buildPanelPath(location.pathname, '/customers')
  const vehiclesPath = buildPanelPath(location.pathname, '/vehicles')
  const [allCustomers, setAllCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const customers = useMemo(
    () => allCustomers.filter((customer) => customerMatchesSearch(customer, searchTerm)),
    [allCustomers, searchTerm],
  )

  useEffect(() => {
    let isCurrent = true

    async function loadCustomers() {
      try {
        setStatus('')
        const data = await getCustomers()
        if (isCurrent) {
          setAllCustomers(data)
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
    setSearchTerm(term)
    setStatus('')
  }

  function handleClear() {
    setSearchTerm('')
    setStatus('')
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
