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

function Vehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
    <div className="customer-page">
      <PortalHero
        eyebrow="Garage inventory"
        title="Manage the vehicles attached to your account"
        description="Accurate vehicle records make bookings faster, service history clearer, and part inquiries easier to match."
        imageSrc={customerPortalImages.vehicle}
        imageAlt="Customer vehicle prepared for service"
        actions={!showForm && <button className="btn-primary" type="button" onClick={handleAdd}>Add vehicle</button>}
      />

      <div className="customer-workflow-grid vehicles-workflow-grid">
        <section className="customer-card portal-list-card">
          <div className="section-header">
            <div className="section-header-text">
              <span className="customer-eyebrow">Registered fleet</span>
              <h2>{vehicles.length === 1 ? '1 vehicle on file' : `${vehicles.length} vehicles on file`}</h2>
              <p>These vehicles are available when you book service or submit a part inquiry.</p>
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
              message="Add your first vehicle so appointments and part requests can carry the right context."
              action={<button className="btn-primary" type="button" onClick={handleAdd}>Register first vehicle</button>}
            />
          ) : (
            <div className="vehicle-list">
              {vehicles.map((vehicle) => {
                const imageUrl = resolveImageUrl(vehicle.imageUrl)

                return (
                  <article key={vehicle.id} className="vehicle-item">
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
                      <button className="btn-outline" type="button" onClick={() => handleEdit(vehicle)}>
                        Edit details
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {showForm ? (
          <section className="customer-card portal-form-card">
            <div className="section-header">
              <div className="section-header-text">
                <span className="customer-eyebrow">{editingId ? 'Update record' : 'Guided setup'}</span>
                <h2>{editingId ? 'Edit vehicle' : 'Register vehicle'}</h2>
                <p>Use the name and plate number exactly as you want them to appear in service workflows.</p>
              </div>
            </div>

            <PortalWorkflowSteps
              ariaLabel="Vehicle registration steps"
              steps={[
                { label: 'Model', completed: Boolean(values.name), current: !values.name },
                { label: 'Plate', completed: Boolean(values.number), current: Boolean(values.name) && !values.number },
                { label: 'Image', completed: Boolean(imageFile || existingImageUrl), current: Boolean(values.name && values.number) },
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
          </section>
        ) : (
          <aside className="customer-side-panel">
            <img src={customerPortalImages.garage} alt="Vehicle service bay with technicians" />
            <div>
              <span className="customer-eyebrow">Why it matters</span>
              <h2>Vehicle context reduces ambiguity before a booking reaches the service team.</h2>
              <p>Plate numbers and vehicle names help appointments and part inquiries reach the service team with the right details.</p>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

export default Vehicles
