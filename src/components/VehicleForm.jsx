import { useState } from 'react'
import Button from './ui/Button'
import Input from './ui/Input'

const initialValues = {
  vehicleNumber: '',
  model: '',
}

function VehicleForm({ initialVehicle, isSubmitting, isReadOnly, onCancel, onSubmit }) {
  const [values, setValues] = useState(() => ({
    vehicleNumber: initialVehicle?.vehicleNumber || initialValues.vehicleNumber,
    model: initialVehicle?.model || initialValues.model,
  }))
  const [errors, setErrors] = useState({})

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function validate() {
    const nextErrors = {}

    if (!values.vehicleNumber.trim()) nextErrors.vehicleNumber = 'Vehicle number is required.'
    if (!values.model.trim()) nextErrors.model = 'Model is required.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    onSubmit(values)
  }

  return (
    <form className="vehicle-form" onSubmit={handleSubmit} noValidate>
      <Input
        id="vehicleNumber"
        label="Vehicle Number"
        name="vehicleNumber"
        value={values.vehicleNumber}
        onChange={handleChange}
        error={errors.vehicleNumber}
        disabled={isReadOnly || isSubmitting}
      />
      <Input
        id="model"
        label="Model"
        name="model"
        value={values.model}
        onChange={handleChange}
        error={errors.model}
        disabled={isReadOnly || isSubmitting}
      />
      <div className="form-actions">
        <Button type="submit" disabled={isReadOnly || isSubmitting}>
          {isSubmitting ? 'Saving...' : initialVehicle ? 'Update Vehicle' : 'Add Vehicle'}
        </Button>
        {initialVehicle && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

export default VehicleForm
