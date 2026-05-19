import { useState, useEffect, useCallback } from 'react'
import { getMyVehicles, addVehicle, updateVehicle } from '../../api/vehicleApi'
import { getRequestErrorMessage, apiBaseUrl } from '../../api/axiosClient'
import VehicleForm from '../../components/VehicleForm'
import PortalEmptyState from '../../components/customer/PortalEmptyState'
import PortalHero from '../../components/customer/PortalHero'
import PortalWorkflowSteps from '../../components/customer/PortalWorkflowSteps'
import StatusMessage from '../../components/ui/StatusMessage'
import { customerPortalImages } from '../../utils/customerPortalImages'

const emptyForm = { name: '', number: '' }
const vehiclesPerView = 2

function Vehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeVehicleIndex, setActiveVehicleIndex] = useState(0)

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

  useEffect(() => {
    setActiveVehicleIndex((current) => {
      if (vehicles.length === 0) return 0
      return Math.min(current, Math.max(0, vehicles.length - vehiclesPerView))
    })
  }, [vehicles.length])

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

  const canMoveCarousel = vehicles.length > vehiclesPerView
  const visibleVehicles = vehicles.slice(activeVehicleIndex, activeVehicleIndex + vehiclesPerView)
  const totalVehiclePages = Math.max(1, Math.ceil(vehicles.length / vehiclesPerView))
  const activeVehiclePage = vehicles.length === 0
    ? 0
    : activeVehicleIndex >= vehicles.length - vehiclesPerView
      ? totalVehiclePages
      : Math.floor(activeVehicleIndex / vehiclesPerView) + 1

  return (
    <div className="customer-page">
      <PortalHero
        eyebrow="Garage inventory"
        title="Your vehicles"
        description="Keep vehicle records ready for service and parts."
        imageSrc={customerPortalImages.vehicle}
        imageAlt="Customer vehicle prepared for service"
        actions={!showForm && <button className="btn-primary" type="button" onClick={handleAdd}>Add vehicle</button>}
      />

      <div className="customer-workflow-grid vehicles-workflow-grid">
        <section className="customer-card portal-list-card vehicle-list-card">
          <div className="section-header">
            <div className="section-header-text">
              <span className="customer-eyebrow">Registered fleet</span>
              <h2>{vehicles.length === 1 ? '1 vehicle on file' : `${vehicles.length} vehicles on file`}</h2>
            </div>
            {!showForm && (
              <button className="btn-outline" type="button" onClick={handleAdd}>
                Register another
              </button>
            )}
          </div>

          {vehicles.length === 0 ? (
            <PortalEmptyState
              imageSrc={customerPortalImages.garage}
              imageAlt="Empty service bay ready for a customer vehicle"
              title="No vehicles registered"
              message="Add a vehicle to book service faster."
              action={<button className="btn-primary" type="button" onClick={handleAdd}>Register first vehicle</button>}
            />
          ) : (
            <div className="vehicle-carousel">
              <div className="vehicle-carousel-viewport" aria-live="polite">
                <div className={`vehicle-carousel-track ${visibleVehicles.length === 1 ? 'is-single' : ''}`}>
                  {visibleVehicles.map((vehicle) => {
                    const imageUrl = resolveImageUrl(vehicle.imageUrl)

                    return (
                      <div key={vehicle.id} className="vehicle-carousel-slide">
                        <article className="vehicle-item">
                          <div className="vehicle-image-wrap">
                            {imageUrl ? (
                              <img src={imageUrl} alt={vehicle.name} />
                            ) : (
                              <img src={customerPortalImages.inspection} alt="" />
                            )}
                          </div>
                          <div className="vehicle-info">
                            <span className="customer-eyebrow">Vehicle record</span>
                            <h3>{vehicle.name}</h3>
                            <p>{vehicle.number}</p>
                          </div>
                          <div className="vehicle-actions">
                            <button
                              className="vehicle-edit-button"
                              type="button"
                              onClick={() => handleEdit(vehicle)}
                              aria-label={`Edit ${vehicle.name}`}
                              title="Edit vehicle"
                            >
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.1V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8.6 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.1-.33H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .33-1.1V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15.4 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 .6 1 1.65 1.65 0 0 0 1.1.33H21a2 2 0 1 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15Z" />
                              </svg>
                            </button>
                          </div>
                        </article>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="vehicle-carousel-controls" aria-label="Vehicle carousel controls">
                <button
                  className="vehicle-carousel-button"
                  type="button"
                  onClick={() => setActiveVehicleIndex((index) => Math.max(0, index - vehiclesPerView))}
                  disabled={!canMoveCarousel || activeVehicleIndex === 0}
                  aria-label="Previous vehicle"
                  title="Previous vehicle"
                >
                  <span aria-hidden="true">&lt;</span>
                </button>
                <span>{activeVehiclePage} / {totalVehiclePages}</span>
                <button
                  className="vehicle-carousel-button"
                  type="button"
                  onClick={() => setActiveVehicleIndex((index) => Math.min(Math.max(0, vehicles.length - vehiclesPerView), index + vehiclesPerView))}
                  disabled={!canMoveCarousel || activeVehicleIndex >= vehicles.length - vehiclesPerView}
                  aria-label="Next vehicle"
                  title="Next vehicle"
                >
                  <span aria-hidden="true">&gt;</span>
                </button>
              </div>
            </div>
          )}
        </section>

        <section className={`customer-card vehicle-action-panel ${showForm ? 'is-form' : 'is-cta'}`}>
          {showForm ? (
            <div className="vehicle-form-content">
              <div className="section-header">
                <div className="section-header-text">
                  <span className="customer-eyebrow">{editingId ? 'Update record' : 'Guided setup'}</span>
                  <h2>{editingId ? 'Edit vehicle' : 'Register vehicle'}</h2>
                </div>
              </div>

              <PortalWorkflowSteps
                ariaLabel="Vehicle registration steps"
                steps={[
                  { label: 'Model', completed: Boolean(values.name.trim()), current: !values.name.trim() },
                  { label: 'Plate', completed: Boolean(values.number.trim()), current: Boolean(values.name.trim()) && !values.number.trim() },
                  { label: 'Image', completed: Boolean(imageFile || existingImageUrl), current: Boolean(values.name.trim() && values.number.trim()) && !imageFile && !existingImageUrl },
                ]}
              />

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
                submitLabel={editingId ? 'Update vehicle' : 'Register vehicle'}
              />
            </div>
          ) : (
            <button className="vehicle-register-box" type="button" onClick={handleAdd}>
              <span className="customer-eyebrow">Register vehicle</span>
              <strong>Add a vehicle record</strong>
              <span>Keep service and parts requests tied to the right plate.</span>
            </button>
          )}
        </section>
      </div>
    </div>
  )
}

export default Vehicles
