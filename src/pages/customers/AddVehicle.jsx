import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import VehicleForm from '../../components/customers/VehicleForm'
import { addCustomerVehicle } from '../../api/customerApi'
import { getRequestErrorMessage } from '../../api/axiosClient'

function AddVehicle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleAddVehicle(vehicleData) {
    try {
      setIsSubmitting(true)
      setError('')

      await addCustomerVehicle(id, vehicleData)
      navigate(`/admin/customers/${id}`)
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, 'Unable to add vehicle.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="card">
      <div className="page-header with-actions">
        <div>
          <h2>Add Vehicle</h2>
          <p>Register a vehicle for the selected customer.</p>
        </div>

        <Link className="button button-secondary" to={`/admin/customers/${id}`}>
          Back to Customer
        </Link>
      </div>

      <VehicleForm
        onSubmit={handleAddVehicle}
        submitLabel="Add Vehicle"
        isSubmitting={isSubmitting}
        serverError={error}
      />
    </section>
  )
}

export default AddVehicle
