import { useCallback, useEffect, useState } from 'react'
import {
  cancelAppointment,
  createAppointment,
  getAppointment,
  getAppointments,
  getAppointmentServiceOptions,
} from '../../api/customerPortalApi'
import { getMyVehicles } from '../../api/vehicleApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import PortalModal from '../../components/customer/PortalModal'
import StatusBadge from '../../components/customer/StatusBadge'
import StatusMessage from '../../components/ui/StatusMessage'
import { formatDate, formatDateTime, formatTime } from '../../utils/customerPortalFormatters'

const emptyForm = {
  vehicleId: '',
  serviceType: '',
  preferredDate: '',
  preferredTime: '',
  notes: '',
}

const cancellableStatuses = new Set(['Pending', 'Confirmed'])

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

  const loadData = useCallback(async () => {
    const [vehicleResponse, serviceResponse, appointmentResponse] = await Promise.all([
      getMyVehicles(),
      getAppointmentServiceOptions(),
      getAppointments(),
    ])

    setVehicles(vehicleResponse.data)
    setServiceOptions(serviceResponse.data)
    setAppointments(appointmentResponse.data)
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
    return <StatusMessage type="loading" message="Loading appointments..." />
  }

  if (error) {
    return (
      <div className="customer-container">
        <StatusMessage type="error" message={error} />
      </div>
    )
  }

  return (
    <div className="customer-container portal-container">
      <div className="customer-header">
        <h2>Appointments</h2>
        <p>Book service visits and track your appointment status.</p>
      </div>

      <div className="portal-grid">
        <section className="customer-card portal-form-card">
          <div className="section-header">
            <div className="section-header-text">
              <h2>Book an appointment</h2>
              <p>Select a registered vehicle and preferred service time.</p>
            </div>
          </div>

          {formStatus && (
            <div className={`customer-form-alert ${formStatus.type === 'success' ? 'is-success' : ''}`}>
              {formStatus.message}
            </div>
          )}

          <form className="customer-form" onSubmit={handleSubmit} noValidate>
            <div className="customer-form-group">
              <label htmlFor="vehicleId">Vehicle</label>
              <select
                id="vehicleId"
                name="vehicleId"
                className={`customer-input ${formErrors.vehicleId ? 'is-invalid' : ''}`}
                value={values.vehicleId}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">Select vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} - {vehicle.number}
                  </option>
                ))}
              </select>
              {formErrors.vehicleId && <span className="customer-field-error">{formErrors.vehicleId}</span>}
            </div>

            <div className="customer-form-group">
              <label htmlFor="serviceType">Service type</label>
              <select
                id="serviceType"
                name="serviceType"
                className={`customer-input ${formErrors.serviceType ? 'is-invalid' : ''}`}
                value={values.serviceType}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">Select service</option>
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
                  className={`customer-input ${formErrors.preferredDate ? 'is-invalid' : ''}`}
                  value={values.preferredDate}
                  onChange={handleChange}
                  disabled={isSubmitting}
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
                />
                {formErrors.preferredTime && <span className="customer-field-error">{formErrors.preferredTime}</span>}
              </div>
            </div>

            <div className="customer-form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                className="customer-input portal-textarea"
                value={values.notes}
                onChange={handleChange}
                placeholder="Describe the problem or anything the service team should know."
                disabled={isSubmitting}
              />
            </div>

            <button className="btn-primary" type="submit" disabled={isSubmitting || vehicles.length === 0}>
              {isSubmitting ? 'Booking...' : 'Book appointment'}
            </button>
          </form>
        </section>

        <section className="customer-card portal-list-card">
          <div className="section-header">
            <div className="section-header-text">
              <h2>My appointments</h2>
              <p>Review upcoming and past service bookings.</p>
            </div>
          </div>

          {appointments.length === 0 ? (
            <StatusMessage type="empty" message="No appointments booked yet." />
          ) : (
            <div className="portal-item-list">
              {appointments.map((appointment) => (
                <article key={appointment.id} className="portal-list-item">
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
                      Details
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
          )}
        </section>
      </div>

      {(detailLoading || detail || detailError) && (
        <PortalModal title="Appointment details" onClose={() => {
          setDetail(null)
          setDetailError('')
          setDetailLoading(false)
        }}>
          {detailLoading && <StatusMessage type="loading" message="Loading details..." />}
          {detailError && <StatusMessage type="error" message={detailError} />}
          {detail && (
            <div className="portal-detail-list">
              <div><span>Service</span><strong>{detail.serviceType}</strong></div>
              <div><span>Status</span><StatusBadge status={detail.status} /></div>
              <div><span>Vehicle</span><strong>{detail.vehicleName} - {detail.vehicleNumber}</strong></div>
              <div><span>Date</span><strong>{formatDate(detail.preferredDate)}</strong></div>
              <div><span>Time</span><strong>{formatTime(detail.preferredTime)}</strong></div>
              <div><span>Notes</span><strong>{detail.notes || 'No notes provided'}</strong></div>
              <div><span>Created</span><strong>{formatDateTime(detail.createdAt)}</strong></div>
              <div><span>Updated</span><strong>{formatDateTime(detail.updatedAt)}</strong></div>
            </div>
          )}
        </PortalModal>
      )}

      {cancelTarget && (
        <PortalModal
          title="Cancel appointment"
          onClose={() => setCancelTarget(null)}
          footer={(
            <>
              <button className="btn-outline" type="button" onClick={() => setCancelTarget(null)} disabled={isCancelling}>
                Keep appointment
              </button>
              <button className="btn-primary" type="button" onClick={handleConfirmCancel} disabled={isCancelling}>
                {isCancelling ? 'Cancelling...' : 'Cancel appointment'}
              </button>
            </>
          )}
        >
          <p className="portal-confirm-text">
            This will cancel your {cancelTarget.serviceType} appointment for {formatDate(cancelTarget.preferredDate)} at {formatTime(cancelTarget.preferredTime)}.
          </p>
        </PortalModal>
      )}
    </div>
  )
}

export default Appointments
