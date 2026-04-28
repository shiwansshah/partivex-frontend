import { useCallback, useEffect, useMemo, useState } from 'react'
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
  const role = user?.role || 'Customer'
  const isStaff = role === 'Staff'
  const isAdmin = role === 'Admin'
  const canSelectCustomer = isAdmin || isStaff

  const [customers, setCustomers] = useState([])
  const [selectedCustomerId, setSelectedCustomerId] = useState(user?.customerId || '')
  const [vehicles, setVehicles] = useState([])
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [formVersion, setFormVersion] = useState(0)
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const canManageVehicles = useMemo(() => role === 'Admin' || role === 'Customer', [role])

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
    <section className="vehicles-layout">
      <div className="page-title">
        <div>
          <span className="eyebrow">Vehicles</span>
          <h1>Customer Vehicles</h1>
          <p>
            {isStaff
              ? 'Staff can inspect vehicle records without changing them.'
              : 'Create, update, and remove vehicle records for the selected customer.'}
          </p>
        </div>
      </div>

      {status && <div className="form-alert">{status}</div>}

      <div className="vehicles-grid">
        <aside className="panel">
          <div className="section-heading">
            <h2>{editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}</h2>
          </div>

          {canSelectCustomer && (
            <div className="form-group customer-selector">
              <label htmlFor="customerId">Customer</label>
              <select
                id="customerId"
                className="form-control"
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
          <div className="section-heading">
            <div>
              <h2>Vehicle List</h2>
              <p>{isLoading ? 'Loading vehicles...' : `${vehicles.length} vehicle records`}</p>
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
