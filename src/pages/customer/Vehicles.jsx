import { useState, useEffect, useCallback } from 'react'
import { getMyVehicles, addVehicle, updateVehicle } from '../../api/vehicleApi'
import { getRequestErrorMessage, apiBaseUrl } from '../../api/axiosClient'
import VehicleForm from '../../components/VehicleForm'
import StatusMessage from '../../components/ui/StatusMessage'
import { customerPortalImages } from '../../utils/customerPortalImages'

const emptyForm = { name: '', number: '' }

function Vehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [values, setValues] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [existingImageUrl, setExistingImageUrl] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [formStatus, setFormStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchVehicles = useCallback(async () => {
    try {
      const response = await getMyVehicles()
      setVehicles(response.data)
    } catch (err) {
      setError(getRequestErrorMessage(err, 'Failed to load vehicles.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isCurrent = true

    async function loadVehicles() {
      try {
        const response = await getMyVehicles()
        if (isCurrent) setVehicles(response.data)
      } catch (err) {
        if (isCurrent) setError(getRequestErrorMessage(err, 'Failed to load vehicles.'))
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadVehicles()

    return () => {
      isCurrent = false
    }
  }, [])

  function resolveImageUrl(url) {
    if (!url) return null
    if (url.startsWith('http')) return url
    const base = apiBaseUrl.replace('/api', '')
    return `${base}${url}`
  }

  function resetForm() {
    setShowForm(false)
    setEditingId(null)
    setValues(emptyForm)
    setImageFile(null)
    setPreviewUrl('')
    setExistingImageUrl('')
    setFormErrors({})
    setFormStatus('')
  }

  function handleAdd() {
    resetForm()
    setShowForm(true)
  }

  function handleEdit(vehicle) {
    setEditingId(vehicle.id)
    setValues({ name: vehicle.name, number: vehicle.number })
    setExistingImageUrl(resolveImageUrl(vehicle.imageUrl) || '')
    setPreviewUrl('')
    setImageFile(null)
    setFormErrors({})
    setFormStatus('')
    setShowForm(true)
  }

  function handleChange(event) {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function handleImageChange(file) {
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function validate() {
    const next = {}
    if (!values.name.trim()) next.name = 'Vehicle name is required.'
    if (!values.number.trim()) next.number = 'Vehicle number is required.'
    setFormErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormStatus('')
    if (!validate()) return

    const formData = new FormData()
    formData.append('name', values.name.trim())
    formData.append('number', values.number.trim())
    if (imageFile) {
      formData.append('image', imageFile)
    }

    try {
      setIsSubmitting(true)
      if (editingId) {
        await updateVehicle(editingId, formData)
      } else {
        await addVehicle(formData)
      }
      resetForm()
      setLoading(true)
      await fetchVehicles()
    } catch (err) {
      setFormStatus(getRequestErrorMessage(err, 'Failed to save vehicle.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="customer-container portal-container">
        <StatusMessage type="loading" message="Loading your registered vehicles..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="customer-card">
        <StatusMessage type="error" message={error} />
      </div>
    )
  }

  return (
    <div className="customer-page portal-container">
      <section className="portal-page-hero">
        <div>
          <span className="customer-eyebrow">Garage profile</span>
          <h1>Vehicles</h1>
          <p>Keep each vehicle profile ready so service bookings and part requests start with accurate details.</p>
        </div>
        <img src={customerPortalImages.vehicle} alt="Detailed view of a customer vehicle" />
      </section>

      <div className="customer-workflow-grid vehicles-workflow-grid">
        <section className="customer-card">
        <div className="section-header">
          <div className="section-header-text">
            <span className="customer-eyebrow">Saved records</span>
            <h2>My vehicles</h2>
            <p>Use the registered vehicle list when booking visits or requesting matching parts.</p>
          </div>
          {!showForm && (
            <button className="btn-primary" onClick={handleAdd}>
              Add vehicle
            </button>
          )}
        </div>

        {showForm && (
          <div className="form-divider">
            <div className="guided-form-heading">
              <span>{editingId ? 'Update details' : 'Step 1 of 1'}</span>
              <h3>{editingId ? 'Edit vehicle' : 'Add a vehicle'}</h3>
              <p>Use the model name and plate number customers or technicians will recognize.</p>
            </div>
            <VehicleForm
              values={values}
              errors={formErrors}
              status={formStatus}
              isSubmitting={isSubmitting}
              existingImageUrl={existingImageUrl}
              previewUrl={previewUrl}
              onChange={handleChange}
              onImageChange={handleImageChange}
              onSubmit={handleSubmit}
              onCancel={resetForm}
              submitLabel={editingId ? 'Update Vehicle' : 'Add Vehicle'}
            />
          </div>
        )}

        {vehicles.length === 0 && !showForm ? (
          <div className="customer-empty-panel">
            <img src={customerPortalImages.garage} alt="Vehicle service bay ready for a customer vehicle" />
            <div>
              <h3>No vehicles registered yet</h3>
              <p>Add your first vehicle to make appointment booking and part requests faster.</p>
              <button className="btn-primary" type="button" onClick={handleAdd}>Add vehicle</button>
            </div>
          </div>
        ) : (
          <div className="vehicle-list">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="vehicle-item">
                <div className="vehicle-image-wrap">
                  {vehicle.imageUrl ? (
                    <img
                      src={resolveImageUrl(vehicle.imageUrl)}
                      alt={vehicle.name}
                    />
                  ) : (
                    <span className="vehicle-image-placeholder">No image</span>
                  )}
                </div>
                <div className="vehicle-info">
                  <h3>{vehicle.name}</h3>
                  <p>{vehicle.number}</p>
                </div>
                <div className="vehicle-actions">
                  <button
                    className="btn-outline"
                    onClick={() => handleEdit(vehicle)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </section>

        <aside className="customer-side-panel">
          <img src={customerPortalImages.garage} alt="Mechanic working inside a garage service bay" />
          <div>
            <span className="customer-eyebrow">Why it matters</span>
            <h2>Better vehicle records reduce service back-and-forth.</h2>
            <p>When your model and plate are already saved, the service team can connect appointments, part requests, and reviews to the correct vehicle.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Vehicles
