import { useRef } from 'react'

function VehicleForm({
  values,
  errors,
  status,
  isSubmitting,
  existingImageUrl,
  previewUrl,
  onChange,
  onImageChange,
  onSubmit,
  onCancel,
  submitLabel,
}) {
  const fileInputRef = useRef(null)

  const hasImage = previewUrl || existingImageUrl
  const uploadLabel = hasImage ? 'Re-upload Image' : 'Upload Image'

  function handleFileClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (file) {
      onImageChange(file)
    }
  }

  const displayedPreview = previewUrl || existingImageUrl || null

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
          <button
            type="button"
            className="image-upload-btn"
            onClick={handleFileClick}
          >
            📷 {uploadLabel}
          </button>
        </div>
      </div>

      {status && <div className="customer-form-alert">{status}</div>}

      <div className="form-actions">
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            className="btn-outline"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default VehicleForm
