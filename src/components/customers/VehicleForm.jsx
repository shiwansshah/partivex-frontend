import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { required } from '../../utils/validator'

const emptyVehicle = {
  vehicleNumber: '',
  brand: '',
  model: '',
  year: '',
  vehicleType: '',
  notes: '',
}

function VehicleForm({
  initialValues = emptyVehicle,
  onSubmit,
  submitLabel = 'Save Vehicle',
  isSubmitting = false,
  serverError = '',
}) {
  const [formData, setFormData] = useState({ ...emptyVehicle, ...initialValues })
  const [errors, setErrors] = useState({})

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  function validateForm() {
    const nextErrors = {}

    if (!required(formData.vehicleNumber)) {
      nextErrors.vehicleNumber = 'Vehicle number is required.'
    }

    if (formData.year && Number.isNaN(Number(formData.year))) {
      nextErrors.year = 'Year must be a number.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    onSubmit({
      vehicleNumber: formData.vehicleNumber.trim(),
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      year: formData.year ? Number(formData.year) : null,
      vehicleType: formData.vehicleType.trim(),
      notes: formData.notes.trim(),
    })
  }

  return (
    <form className="form-card customer-form" onSubmit={handleSubmit}>
      {serverError && <div className="form-alert">{serverError}</div>}

      <div className="customer-form-note">
        <span>Vehicle Details</span>
        <p>Vehicle number is required. Other details help staff identify the vehicle faster.</p>
      </div>

      <Input
        id="vehicleNumber"
        name="vehicleNumber"
        label="Vehicle Number"
        value={formData.vehicleNumber}
        onChange={handleChange}
        error={errors.vehicleNumber}
      />

      <div className="form-grid">
        <Input
          id="brand"
          name="brand"
          label="Brand"
          value={formData.brand}
          onChange={handleChange}
        />

        <Input
          id="model"
          name="model"
          label="Model"
          value={formData.model}
          onChange={handleChange}
        />
      </div>

      <div className="form-grid">
        <Input
          id="year"
          name="year"
          label="Year"
          value={formData.year}
          onChange={handleChange}
          error={errors.year}
        />

        <Input
          id="vehicleType"
          name="vehicleType"
          label="Vehicle Type"
          value={formData.vehicleType}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          className="form-control"
          rows="4"
          value={formData.notes}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <Button type="submit" className="customer-submit-button" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default VehicleForm
