import { useRef, useState } from 'react'
import Button from './ui/Button'
import Input from './ui/Input'

const initialValues = {
  name: '',
  number: '',
}

function VehicleForm({
  values,
  errors,
  status,
  isSubmitting,
  existingImageUrl,
  previewUrl,
  initialVehicle,
  isReadOnly,
  onChange,
  onImageChange,
  onSubmit,
  onCancel,
  submitLabel,
}) {
  const fileInputRef = useRef(null)
  const [localValues, setLocalValues] = useState(() => ({
    name: initialVehicle?.name || initialVehicle?.model || initialValues.name,
    number: initialVehicle?.number || initialVehicle?.vehicleNumber || initialValues.number,
  }))
  const [localErrors, setLocalErrors] = useState({})
  const isControlledVehicleForm = Boolean(values && onChange)

  function handleFileClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (file) {
      onImageChange(file)
    }
  }

  function handleLocalChange(event) {
    const { name, value } = event.target
    setLocalValues((current) => ({ ...current, [name]: value }))
  }

  function validateLocal() {
    const nextErrors = {}

    if (!localValues.name.trim()) nextErrors.name = 'Vehicle name is required.'
    if (!localValues.number.trim()) nextErrors.number = 'Vehicle number is required.'

    setLocalErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleLocalSubmit(event) {
    event.preventDefault()
    if (!validateLocal()) return
    onSubmit(localValues)
  }

  if (!isControlledVehicleForm) {
    return (
      <form className="vehicle-form" onSubmit={handleLocalSubmit} noValidate>
        <Input
          id="vehicleName"
          label="Vehicle Name / Model"
          name="name"
          value={localValues.name}
          onChange={handleLocalChange}
          error={localErrors.name}
          disabled={isReadOnly || isSubmitting}
        />
        <Input
          id="vehicleNumber"
          label="Vehicle Number"
          name="number"
          value={localValues.number}
          onChange={handleLocalChange}
          error={localErrors.number}
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

  const displayedPreview = previewUrl || existingImageUrl || null
  const uploadLabel = displayedPreview ? 'Re-upload Image' : 'Upload Image'

  return (
    <form className="customer-form" onSubmit={onSubmit} noValidate>
      <div className="customer-form-group">
        <label htmlFor="vehicleName">Vehicle Name / Model</label>
        <input
          id="vehicleName"
          className={`customer-input ${errors.name ? 'is-invalid' : ''}`}
          name="name"
          value={values.name}
          onChange={onChange}
          placeholder="e.g. Honda City"
        />
        {errors.name && <span className="customer-field-error">{errors.name}</span>}
      </div>

      <div className="customer-form-group">
        <label htmlFor="vehicleNumber">Vehicle Number</label>
        <input
          id="vehicleNumber"
          className={`customer-input ${errors.number ? 'is-invalid' : ''}`}
          name="number"
          value={values.number}
          onChange={onChange}
          placeholder="e.g. BA 1 PA 2025"
        />
        {errors.number && <span className="customer-field-error">{errors.number}</span>}
      </div>

      <div className="customer-form-group">
        <label>Image (optional)</label>
        <div className="image-upload-area">
          {displayedPreview && (
            <div className="image-preview">
              <img src={displayedPreview} alt="Vehicle preview" />
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            hidden
          />
          <button type="button" className="image-upload-btn" onClick={handleFileClick}>
            {uploadLabel}
          </button>
        </div>
      </div>

      {status && <div className="customer-form-alert">{status}</div>}

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn-outline" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default VehicleForm
