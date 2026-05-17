import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/axiosInstance'
import VehicleForm from '../components/VehicleForm'
import VehicleList from '../components/VehicleList'
import useAuth from '../hooks/useAuth'
import { getCustomers } from '../services/customerService'
import {
  createVehicle,
  deleteVehicle,
  getVehiclesByCustomer,
  updateVehicle,
} from '../services/vehicleService'

function VehiclesPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const customerIdFromQuery = searchParams.get('customerId') || ''
  const role = user?.role || 'Customer'
  const isAdmin = role === 'Admin'
  const canSelectCustomer = isAdmin || role === 'Staff'

  const [customers, setCustomers] = useState([])
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerIdFromQuery || user?.customerId || '')
  const [vehicles, setVehicles] = useState([])
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [formVersion, setFormVersion] = useState(0)
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const canManageVehicles = useMemo(
    () => role === 'Admin' || role === 'Staff' || role === 'Customer',
    [role],
  )

  const loadVehicles = useCallback(async (customerId) => {
    if (!customerId) return

    try {
      setIsLoading(true)
      setStatus('')
      const data = await getVehiclesByCustomer(customerId)
      setVehicles(data)
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Unable to load vehicles.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    async function loadCustomers() {
      if (!canSelectCustomer) return

      try {
        const data = await getCustomers()
        setCustomers(data)
        setSelectedCustomerId((current) => current || data[0]?.id || '')
      } catch (error) {
        setStatus(getApiErrorMessage(error, 'Unable to load customers.'))
      }
    }

    loadCustomers()
  }, [canSelectCustomer])

  useEffect(() => {
    let isCurrent = true

    async function fetchVehicles() {
      if (!selectedCustomerId) return

      await Promise.resolve()
      if (!isCurrent) return

      try {
        setIsLoading(true)
        setStatus('')
        const data = await getVehiclesByCustomer(selectedCustomerId)
        if (isCurrent) setVehicles(data)
      } catch (error) {
        if (isCurrent) setStatus(getApiErrorMessage(error, 'Unable to load vehicles.'))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    fetchVehicles()

    return () => {
      isCurrent = false
    }
  }, [selectedCustomerId])

  async function handleSubmit(values) {
    if (!selectedCustomerId) {
      setStatus('Customer is required before saving a vehicle.')
      return
    }

    try {
      setIsSaving(true)
      setStatus('')

      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, values)
      } else {
        await createVehicle({ ...values, customerId: selectedCustomerId })
      }

      setEditingVehicle(null)
      setFormVersion((current) => current + 1)
      await loadVehicles(selectedCustomerId)
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Unable to save vehicle.'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      setStatus('')
      await deleteVehicle(id)
      await loadVehicles(selectedCustomerId)
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Unable to delete vehicle.'))
    }
  }

  return (
    <section className="vehicles-layout" style={{ padding: '0 var(--space-4)' }}>
      {/* Premium Header matching dashboard hero style */}
      <div className="panel" style={{
        marginBottom: 'var(--space-6)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-6)',
        background: 'linear-gradient(135deg, rgba(239, 35, 60, 0.05), transparent)',
      }}>
        <div>
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: 'var(--color-primary-lighter)',
            color: 'var(--color-primary-dark)',
            borderRadius: '999px',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-bold)',
            marginBottom: 'var(--space-2)'
          }}>
            Vehicles
          </span>
          <h1 style={{ fontSize: 'var(--text-5xl)', fontWeight: 'var(--weight-extrabold)', letterSpacing: '-1px', marginBottom: 'var(--space-2)' }}>
            Customer Vehicles
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)', margin: 0 }}>
            Create, update, and remove vehicle records for the selected customer.
          </p>
        </div>

        {canSelectCustomer && (
          <div style={{ minWidth: '280px', background: 'white', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            <label htmlFor="customerId" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
              Active Customer
            </label>
            <select
              id="customerId"
              className="form-control"
              style={{ background: 'var(--color-bg)', border: 'none' }}
              value={selectedCustomerId}
              onChange={(event) => {
                setSelectedCustomerId(event.target.value)
                setEditingVehicle(null)
                setFormVersion((current) => current + 1)
              }}
            >
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.fullName || customer.email}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {status && <div className="form-alert" style={{ marginBottom: 'var(--space-6)' }}>{status}</div>}

      <div className="vehicles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--space-6)' }}>
        <aside className="panel" style={{ alignSelf: 'start', position: 'sticky', top: '100px' }}>
          <div className="section-heading" style={{ marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>{editingVehicle ? 'Update Vehicle' : 'Add New Vehicle'}</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Fill in the details below to save a vehicle record.</p>
          </div>

          <VehicleForm
            key={`${editingVehicle?.id || 'new-vehicle'}-${formVersion}`}
            initialVehicle={editingVehicle}
            isSubmitting={isSaving}
            isReadOnly={!canManageVehicles}
            onCancel={() => {
              setEditingVehicle(null)
              setFormVersion((current) => current + 1)
            }}
            onSubmit={handleSubmit}
          />
        </aside>

        <div className="panel">
          <div className="section-heading" style={{ marginBottom: 'var(--space-6)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>Vehicle List</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                {isLoading ? 'Loading vehicles...' : `${vehicles.length} vehicle records`}
              </p>
            </div>
          </div>

          <VehicleList
            vehicles={vehicles}
            isReadOnly={!canManageVehicles}
            onDelete={handleDelete}
            onEdit={setEditingVehicle}
          />
        </div>
      </div>
    </section>
  )
}

export default VehiclesPage
