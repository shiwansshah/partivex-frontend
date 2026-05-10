import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import VehicleForm from '../../components/customers/VehicleForm'
import { addCustomerVehicle } from '../../api/customerApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import { saveVehicleImage } from '../../utils/vehicleImageStorage'

function AddVehicle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleAddVehicle(vehicleData) {
    try {
      setIsSubmitting(true)
      setError('')

      const { imageDataUrl, imageName, ...vehiclePayload } = vehicleData
      const response = await addCustomerVehicle(id, vehiclePayload)

      saveVehicleImage({
        vehicleId: response.data?.id,
        customerId: id,
        vehicleNumber: response.data?.vehicleNumber || vehiclePayload.vehicleNumber,
        imageDataUrl,
        imageName,
      })

      navigate(`/admin/customers/${id}`)
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, 'Unable to add vehicle.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="card customer-card customer-workspace">
      <div className="page-header with-actions customer-form-header">
        <div>
          <span className="customer-kicker">Vehicle Record</span>
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
