import { useState, useEffect } from 'react'
import { getMyVehicles, addVehicle, updateVehicle } from '../../api/vehicleApi'
import { getRequestErrorMessage, apiBaseUrl } from '../../api/axiosClient'
import VehicleForm from '../../components/VehicleForm'
import StatusMessage from '../../components/ui/StatusMessage'

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

  async function fetchVehicles() {
    try {
      const response = await getMyVehicles()
      setVehicles(response.data)
    } catch (err) {
      setError(getRequestErrorMessage(err, 'Failed to load vehicles.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false

    getMyVehicles()
      .then((response) => {
        if (!ignore) setVehicles(response.data)
      })
      .catch((err) => {
        if (!ignore) setError(getRequestErrorMessage(err, 'Failed to load vehicles.'))
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
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
    return <StatusMessage type="loading" message="Loading vehicles..." />
  }

  if (error) {
    return (
      <div className="customer-card">
        <StatusMessage type="error" message={error} />
      </div>
    )
  }

  return (
    <div className="customer-stack">
      <div className="customer-card">
        <div className="section-header">
          <div className="section-header-text">
            <h2>My Vehicles</h2>
            <p>Manage your registered vehicles.</p>
          </div>
          {!showForm && (
            <button className="btn-primary" onClick={handleAdd}>
              + Add Vehicle
            </button>
          )}
        </div>

        {showForm && (
          <div className="form-divider">
            <h3>{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
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
          <StatusMessage type="empty" message='No vehicles registered yet. Click "Add Vehicle" to get started.' />
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
      </div>
    </div>
  )
}

export default Vehicles
