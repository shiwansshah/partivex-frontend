import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  cancelAppointment,
  createAppointment,
  getAppointment,
  getAppointments,
  getAppointmentServiceOptions,
} from '../../api/customerPortalApi'
import { getMyVehicles } from '../../api/vehicleApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import PortalEmptyState from '../../components/customer/PortalEmptyState'
import PortalHero from '../../components/customer/PortalHero'
import PortalModal from '../../components/customer/PortalModal'
import PortalWorkflowSteps from '../../components/customer/PortalWorkflowSteps'
import StatusBadge from '../../components/customer/StatusBadge'
import StatusMessage from '../../components/ui/StatusMessage'
import { formatDate, formatDateTime, formatTime } from '../../utils/customerPortalFormatters'
import { customerPortalImages } from '../../utils/customerPortalImages'

const emptyForm = {
  vehicleId: '',
  serviceType: '',
  preferredDate: '',
  preferredTime: '',
  notes: '',
}

const cancellableStatuses = new Set(['Pending', 'Confirmed'])
const appointmentsPerPage = 2

function Appointments() {
  const [vehicles, setVehicles] = useState([])
  const [serviceOptions, setServiceOptions] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [values, setValues] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [formStatus, setFormStatus] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [cancelTarget, setCancelTarget] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [appointmentPage, setAppointmentPage] = useState(1)

  const loadData = useCallback(async () => {
    const [vehicleResponse, serviceResponse, appointmentResponse] = await Promise.all([
      getMyVehicles(),
      getAppointmentServiceOptions(),
      getAppointments(),
    ])

    setVehicles(vehicleResponse.data)
    setServiceOptions(serviceResponse.data)
    setAppointments(appointmentResponse.data)
    setAppointmentPage(1)
  }, [])

  useEffect(() => {
    let isCurrent = true

    async function fetchData() {
      try {
        const [vehicleResponse, serviceResponse, appointmentResponse] = await Promise.all([
          getMyVehicles(),
          getAppointmentServiceOptions(),
          getAppointments(),
        ])

        if (!isCurrent) return

        setVehicles(vehicleResponse.data)
        setServiceOptions(serviceResponse.data)
        setAppointments(appointmentResponse.data)
        setAppointmentPage(1)
      } catch (err) {
        if (isCurrent) {
          setError(getRequestErrorMessage(err, 'Failed to load appointment data.'))
        }
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    fetchData()

    return () => {
      isCurrent = false
    }
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function validate() {
    const nextErrors = {}

    if (!values.vehicleId) {
      nextErrors.vehicleId = 'Vehicle is required.'
    }

    if (!values.serviceType) {
      nextErrors.serviceType = 'Service type is required.'
    }

    if (!values.preferredDate) {
      nextErrors.preferredDate = 'Preferred date is required.'
    }

    if (!values.preferredTime) {
      nextErrors.preferredTime = 'Preferred time is required.'
    }

    if (values.preferredDate && values.preferredTime) {
      const selectedDateTime = new Date(`${values.preferredDate}T${values.preferredTime}`)
      if (selectedDateTime <= new Date()) {
        nextErrors.preferredDate = 'Choose a future date and time.'
      }
    }

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormStatus(null)

    if (!validate()) return

    try {
      setIsSubmitting(true)
      await createAppointment({
        vehicleId: values.vehicleId,
        serviceType: values.serviceType,
        preferredDate: values.preferredDate,
        preferredTime: values.preferredTime,
        notes: values.notes.trim() || null,
      })
      setValues(emptyForm)
      setFormErrors({})
      setFormStatus({ type: 'success', message: 'Appointment booked successfully.' })
      await loadData()
    } catch (err) {
      setFormStatus({
        type: 'error',
        message: getRequestErrorMessage(err, 'Failed to book appointment.'),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleViewDetails(id) {
    setDetail(null)
    setDetailError('')
    setDetailLoading(true)

    try {
      const response = await getAppointment(id)
      setDetail(response.data)
    } catch (err) {
      setDetailError(getRequestErrorMessage(err, 'Failed to load appointment details.'))
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleConfirmCancel() {
    if (!cancelTarget) return

    try {
      setIsCancelling(true)
      await cancelAppointment(cancelTarget.id)
      setCancelTarget(null)
      setFormStatus({ type: 'success', message: 'Appointment cancelled successfully.' })
      await loadData()
      if (detail?.id === cancelTarget.id) {
        const response = await getAppointment(cancelTarget.id)
        setDetail(response.data)
      }
    } catch (err) {
      setFormStatus({
        type: 'error',
        message: getRequestErrorMessage(err, 'Failed to cancel appointment.'),
      })
    } finally {
      setIsCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="customer-container portal-container">
        <StatusMessage type="loading" message="Checking vehicles, services, and appointments..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="customer-container">
        <StatusMessage type="error" message={error} />
      </div>
    )
  }

  const today = new Date().toISOString().slice(0, 10)
  const totalAppointmentPages = Math.max(1, Math.ceil(appointments.length / appointmentsPerPage))
  const currentAppointmentPage = Math.min(appointmentPage, totalAppointmentPages)
  const pagedAppointments = appointments.slice(
    (currentAppointmentPage - 1) * appointmentsPerPage,
    currentAppointmentPage * appointmentsPerPage,
  )

  return (
    <div className="customer-page">
      <PortalHero
        eyebrow="Service desk"
        title="Service appointments"
        description="Book visits and follow their status."
        imageSrc={customerPortalImages.appointment}
        imageAlt="Mechanic inspecting a vehicle in a service bay"
        actions={vehicles.length === 0 && <Link className="btn-outline btn-outline-on-dark" to="/customer/vehicles">Register a vehicle first</Link>}
      />

      <div className="customer-workflow-grid appointments-workflow-grid">
        <section className="customer-card portal-form-card">
          <div className="section-header">
            <div className="section-header-text">
              <span className="customer-eyebrow">Guided booking</span>
              <h2>Request a service visit</h2>
            </div>
          </div>

          <PortalWorkflowSteps
            ariaLabel="Appointment booking steps"
            steps={[
              { label: 'Vehicle', completed: Boolean(values.vehicleId), current: !values.vehicleId },
              { label: 'Service', completed: Boolean(values.serviceType), current: Boolean(values.vehicleId) && !values.serviceType },
              { label: 'Schedule', completed: Boolean(values.preferredDate && values.preferredTime), current: Boolean(values.vehicleId && values.serviceType) && !(values.preferredDate && values.preferredTime) },
              { label: 'Notes', completed: Boolean(values.notes.trim()), current: Boolean(values.vehicleId && values.serviceType && values.preferredDate && values.preferredTime) && !values.notes.trim() },
            ]}
          />

          {formStatus && (
            <div className={`customer-form-alert ${formStatus.type === 'success' ? 'is-success' : ''}`} role={formStatus.type === 'error' ? 'alert' : 'status'}>
              {formStatus.message}
            </div>
          )}

          <form className="customer-form" onSubmit={handleSubmit} noValidate>
            <div className="customer-form-group">
              <label htmlFor="vehicleId">Target vehicle</label>
              <select
                id="vehicleId"
                name="vehicleId"
                className={`customer-input ${formErrors.vehicleId ? 'is-invalid' : ''}`}
                value={values.vehicleId}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(formErrors.vehicleId)}
              >
                <option value="">Select a registered vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} - {vehicle.number}
                  </option>
                ))}
              </select>
              {formErrors.vehicleId && <span className="customer-field-error">{formErrors.vehicleId}</span>}
              {vehicles.length === 0 && (
                <span className="customer-field-help">
                  Register a vehicle first to enable service booking.
                </span>
              )}
            </div>

            <div className="customer-form-group">
              <label htmlFor="serviceType">Required service</label>
              <select
                id="serviceType"
                name="serviceType"
                className={`customer-input ${formErrors.serviceType ? 'is-invalid' : ''}`}
                value={values.serviceType}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(formErrors.serviceType)}
              >
                <option value="">Choose service type</option>
                {serviceOptions.map((option) => (
                  <option key={option.name} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </select>
              {formErrors.serviceType && <span className="customer-field-error">{formErrors.serviceType}</span>}
            </div>

            <div className="portal-form-row">
              <div className="customer-form-group">
                <label htmlFor="preferredDate">Preferred date</label>
                <input
                  id="preferredDate"
                  name="preferredDate"
                  type="date"
                  min={today}
                  className={`customer-input ${formErrors.preferredDate ? 'is-invalid' : ''}`}
                  value={values.preferredDate}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(formErrors.preferredDate)}
                />
                {formErrors.preferredDate && <span className="customer-field-error">{formErrors.preferredDate}</span>}
              </div>

              <div className="customer-form-group">
                <label htmlFor="preferredTime">Preferred time</label>
                <input
                  id="preferredTime"
                  name="preferredTime"
                  type="time"
                  className={`customer-input ${formErrors.preferredTime ? 'is-invalid' : ''}`}
                  value={values.preferredTime}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(formErrors.preferredTime)}
                />
                {formErrors.preferredTime && <span className="customer-field-error">{formErrors.preferredTime}</span>}
              </div>
            </div>

            <div className="customer-form-group">
              <label htmlFor="notes">Service notes and symptoms</label>
              <textarea
                id="notes"
                name="notes"
                className="customer-input portal-textarea"
                value={values.notes}
                onChange={handleChange}
                placeholder="Describe any sounds, warning lights, symptoms, or service preferences."
                disabled={isSubmitting}
              />
            </div>

            <button className="btn-primary btn-block" type="submit" disabled={isSubmitting || vehicles.length === 0}>
              {isSubmitting ? 'Submitting request...' : 'Confirm appointment request'}
            </button>
          </form>
        </section>

        <section className="customer-card portal-list-card appointments-list-card">
          <div className="section-header">
            <div className="section-header-text">
              <span className="customer-eyebrow">Service timeline</span>
              <h2>Your appointments</h2>
              <p>{appointments.length} upcoming and past service visits.</p>
            </div>
          </div>

          {appointments.length === 0 ? (
            <PortalEmptyState
              imageSrc={customerPortalImages.serviceHistory}
              imageAlt="Technician reviewing a service checklist"
              title="No appointment history"
              message="Book a service visit to see it here."
            />
          ) : (
            <div className="appointments-list-shell">
              <div className="portal-item-list timeline-list">
                {pagedAppointments.map((appointment) => (
                  <article key={appointment.id} className="portal-list-item stacked">
                    <div className="portal-list-main">
                      <div className="portal-list-title-row">
                        <h3>{appointment.serviceType}</h3>
                        <StatusBadge status={appointment.status} />
                      </div>
                      <p>{appointment.vehicleName} - {appointment.vehicleNumber}</p>
                      <div className="portal-meta-grid">
                        <span>{formatDate(appointment.preferredDate)}</span>
                        <span>{formatTime(appointment.preferredTime)}</span>
                      </div>
                    </div>
                    <div className="portal-actions">
                      <button className="btn-outline" type="button" onClick={() => handleViewDetails(appointment.id)}>
                        View details
                      </button>
                      {cancellableStatuses.has(appointment.status) && (
                        <button className="btn-outline text-danger" type="button" onClick={() => setCancelTarget(appointment)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              {totalAppointmentPages > 1 && (
                <div className="customer-pagination appointments-pagination" aria-label="Appointment pages">
                  <button
                    className="customer-page-button"
                    type="button"
                    onClick={() => setAppointmentPage((page) => Math.max(1, page - 1))}
                    disabled={currentAppointmentPage === 1}
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentAppointmentPage} of {totalAppointmentPages}
                  </span>
                  <button
                    className="customer-page-button"
                    type="button"
                    onClick={() => setAppointmentPage((page) => Math.min(totalAppointmentPages, page + 1))}
                    disabled={currentAppointmentPage === totalAppointmentPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {(detailLoading || detail || detailError) && (
        <PortalModal title="Appointment details" onClose={() => {
          setDetail(null)
          setDetailError('')
          setDetailLoading(false)
        }}>
          {detailLoading && <StatusMessage type="loading" message="Retrieving appointment record..." />}
          {detailError && <StatusMessage type="error" message={detailError} />}
          {detail && (
            <div className="portal-detail-list">
              <div><span>Service type</span><strong>{detail.serviceType}</strong></div>
              <div><span>Current status</span><StatusBadge status={detail.status} /></div>
              <div><span>Vehicle</span><strong>{detail.vehicleName} - {detail.vehicleNumber}</strong></div>
              <div><span>Scheduled date</span><strong>{formatDate(detail.preferredDate)}</strong></div>
              <div><span>Scheduled time</span><strong>{formatTime(detail.preferredTime)}</strong></div>
              <div><span>Technical notes</span><strong>{detail.notes || 'No notes provided'}</strong></div>
              <div><span>Record created</span><strong>{formatDateTime(detail.createdAt)}</strong></div>
              <div><span>Last updated</span><strong>{formatDateTime(detail.updatedAt)}</strong></div>
            </div>
          )}
        </PortalModal>
      )}

      {cancelTarget && (
        <PortalModal
          title="Cancel appointment request"
          onClose={() => setCancelTarget(null)}
          footer={(
            <>
              <button className="btn-outline" type="button" onClick={() => setCancelTarget(null)} disabled={isCancelling}>
                Keep appointment
              </button>
              <button className="btn-primary" type="button" onClick={handleConfirmCancel} disabled={isCancelling}>
                {isCancelling ? 'Cancelling...' : 'Confirm cancellation'}
              </button>
            </>
          )}
        >
          <p className="portal-confirm-text">
            Are you sure you want to cancel your <strong>{cancelTarget.serviceType}</strong> appointment for {formatDate(cancelTarget.preferredDate)}? This action cannot be undone.
          </p>
        </PortalModal>
      )}
    </div>
  )
}

export default Appointments
