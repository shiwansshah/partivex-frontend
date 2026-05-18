import { useCallback, useEffect, useState } from 'react'
import {
  cancelPartRequest,
  createPartRequest,
  getPartRequest,
  getPartRequests,
} from '../../api/customerPortalApi'
import { getMyVehicles } from '../../api/vehicleApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import PortalEmptyState from '../../components/customer/PortalEmptyState'
import PortalHero from '../../components/customer/PortalHero'
import PortalModal from '../../components/customer/PortalModal'
import PortalWorkflowSteps from '../../components/customer/PortalWorkflowSteps'
import StatusBadge from '../../components/customer/StatusBadge'
import StatusMessage from '../../components/ui/StatusMessage'
import { formatDateTime } from '../../utils/customerPortalFormatters'
import { customerPortalImages } from '../../utils/customerPortalImages'

const emptyForm = {
  partName: '',
  vehicleId: '',
  brandModelSpecification: '',
  quantity: '1',
  reason: '',
}

function PartRequests() {
  const [vehicles, setVehicles] = useState([])
  const [requests, setRequests] = useState([])
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
    const [vehicleResponse, requestResponse] = await Promise.all([
      getMyVehicles(),
      getPartRequests(),
    ])

    setVehicles(vehicleResponse.data)
    setRequests(requestResponse.data)
  }, [])

  useEffect(() => {
    let isCurrent = true

    async function fetchData() {
      try {
        const [vehicleResponse, requestResponse] = await Promise.all([
          getMyVehicles(),
          getPartRequests(),
        ])

        if (!isCurrent) return

        setVehicles(vehicleResponse.data)
        setRequests(requestResponse.data)
      } catch (err) {
        if (isCurrent) {
          setError(getRequestErrorMessage(err, 'Failed to load part requests.'))
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
    const quantity = Number(values.quantity)

    if (!values.partName.trim()) {
      nextErrors.partName = 'Part name is required.'
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      nextErrors.quantity = 'Quantity must be greater than zero.'
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
      await createPartRequest({
        partName: values.partName.trim(),
        vehicleId: values.vehicleId || null,
        brandModelSpecification: values.brandModelSpecification.trim() || null,
        quantity: Number(values.quantity),
        reason: values.reason.trim() || null,
      })
      setValues(emptyForm)
      setFormErrors({})
      setFormStatus({ type: 'success', message: 'Part request submitted successfully.' })
      await loadData()
    } catch (err) {
      setFormStatus({
        type: 'error',
        message: getRequestErrorMessage(err, 'Failed to submit part request.'),
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
      const response = await getPartRequest(id)
      setDetail(response.data)
    } catch (err) {
      setDetailError(getRequestErrorMessage(err, 'Failed to load request details.'))
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleConfirmCancel() {
    if (!cancelTarget) return

    try {
      setIsCancelling(true)
      await cancelPartRequest(cancelTarget.id)
      setCancelTarget(null)
      setFormStatus({ type: 'success', message: 'Part request cancelled successfully.' })
      await loadData()
      if (detail?.id === cancelTarget.id) {
        const response = await getPartRequest(cancelTarget.id)
        setDetail(response.data)
      }
    } catch (err) {
      setFormStatus({
        type: 'error',
        message: getRequestErrorMessage(err, 'Failed to cancel part request.'),
      })
    } finally {
      setIsCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="customer-container portal-container">
        <StatusMessage type="loading" message="Loading your part requests..." />
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

  return (
    <div className="customer-page">
      <PortalHero
        eyebrow="Spare parts"
        title="Request vehicle parts with the right fitment context"
        description="Submit part names, quantities, specifications, and optional vehicle details so the service team can review your inquiry with less guesswork."
        imageSrc={customerPortalImages.parts}
        imageAlt="Vehicle parts organized for workshop service"
      />

      <div className="customer-workflow-grid">
        <section className="customer-card portal-form-card">
          <div className="section-header">
            <div className="section-header-text">
              <span className="customer-eyebrow">Guided inquiry</span>
              <h2>New part request</h2>
              <p>Keep the request specific. Vehicle and fitment notes are optional, but they improve review quality.</p>
            </div>
          </div>

          <PortalWorkflowSteps
            ariaLabel="Part request steps"
            steps={[
              { label: 'Part', completed: Boolean(values.partName), current: !values.partName },
              { label: 'Quantity', completed: Number(values.quantity) > 0, current: Boolean(values.partName) },
              { label: 'Vehicle', completed: Boolean(values.vehicleId), current: false },
              { label: 'Fitment', completed: Boolean(values.brandModelSpecification || values.reason), current: false },
            ]}
          />

          {formStatus && (
            <div className={`customer-form-alert ${formStatus.type === 'success' ? 'is-success' : ''}`} role={formStatus.type === 'error' ? 'alert' : 'status'}>
              {formStatus.message}
            </div>
          )}

          <form className="customer-form" onSubmit={handleSubmit} noValidate>
            <div className="customer-form-group">
              <label htmlFor="partName">Part name or category</label>
              <input
                id="partName"
                name="partName"
                className={`customer-input ${formErrors.partName ? 'is-invalid' : ''}`}
                value={values.partName}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Brake pads, headlamp assembly, air filter"
                aria-invalid={Boolean(formErrors.partName)}
              />
              {formErrors.partName && <span className="customer-field-error">{formErrors.partName}</span>}
            </div>

            <div className="customer-form-group">
              <label htmlFor="vehicleId">Target vehicle</label>
              <select
                id="vehicleId"
                name="vehicleId"
                className="customer-input"
                value={values.vehicleId}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">General inquiry, not vehicle specific</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} - {vehicle.number}
                  </option>
                ))}
              </select>
              <span className="customer-field-help">Linking a vehicle helps with compatibility checks when the part is model specific.</span>
            </div>

            <div className="portal-form-row">
              <div className="customer-form-group">
                <label htmlFor="brandModelSpecification">Brand or specification</label>
                <input
                  id="brandModelSpecification"
                  name="brandModelSpecification"
                  className="customer-input"
                  value={values.brandModelSpecification}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="OEM, Bosch, performance grade"
                />
              </div>

              <div className="customer-form-group">
                <label htmlFor="quantity">Quantity required</label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  className={`customer-input ${formErrors.quantity ? 'is-invalid' : ''}`}
                  value={values.quantity}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(formErrors.quantity)}
                />
                {formErrors.quantity && <span className="customer-field-error">{formErrors.quantity}</span>}
              </div>
            </div>

            <div className="customer-form-group">
              <label htmlFor="reason">Fitment notes and purpose</label>
              <textarea
                id="reason"
                name="reason"
                className="customer-input portal-textarea"
                value={values.reason}
                onChange={handleChange}
                placeholder="Explain the issue, side of the vehicle, engine variant, or fitment requirement."
                disabled={isSubmitting}
              />
            </div>

            <button className="btn-primary btn-block" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting inquiry...' : 'Submit part inquiry'}
            </button>
          </form>
        </section>

        <section className="customer-card portal-list-card">
          <div className="section-header">
            <div className="section-header-text">
              <span className="customer-eyebrow">Request history</span>
              <h2>Part inquiries</h2>
              <p>Track quantity, vehicle context, and the latest status for every inquiry.</p>
            </div>
          </div>

          {requests.length === 0 ? (
            <PortalEmptyState
              imageSrc={customerPortalImages.partsDetail}
              imageAlt="Vehicle parts ready for inspection"
              title="No part inquiries yet"
              message="Submit your first part request and the status trail will appear here."
            />
          ) : (
            <div className="portal-item-list">
              {requests.map((request) => (
                <article key={request.id} className="portal-list-item stacked">
                  <div className="portal-list-main">
                    <div className="portal-list-title-row">
                      <h3>{request.partName}</h3>
                      <StatusBadge status={request.status} />
                    </div>
                    <p>{request.vehicleName ? `${request.vehicleName} - ${request.vehicleNumber}` : 'General inquiry'}</p>
                    <div className="portal-meta-grid">
                      <span>Qty {request.quantity}</span>
                      <span>{formatDateTime(request.createdAt)}</span>
                    </div>
                  </div>
                  <div className="portal-actions">
                    <button className="btn-outline" type="button" onClick={() => handleViewDetails(request.id)}>
                      View record
                    </button>
                    {request.status === 'Pending' && (
                      <button className="btn-outline text-danger" type="button" onClick={() => setCancelTarget(request)}>
                        Withdraw
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="customer-trust-strip">
        <div>
          <strong>Optional vehicle link</strong>
          <span>Submit general or vehicle-specific part inquiries.</span>
        </div>
        <div>
          <strong>Quantity validation</strong>
          <span>Requests must include a positive whole-number quantity.</span>
        </div>
        <div>
          <strong>Pending withdrawals</strong>
          <span>Only pending part inquiries can be withdrawn.</span>
        </div>
      </section>

      {(detailLoading || detail || detailError) && (
        <PortalModal title="Part inquiry record" onClose={() => {
          setDetail(null)
          setDetailError('')
          setDetailLoading(false)
        }}>
          {detailLoading && <StatusMessage type="loading" message="Retrieving part inquiry record..." />}
          {detailError && <StatusMessage type="error" message={detailError} />}
          {detail && (
            <div className="portal-detail-list">
              <div><span>Requested part</span><strong>{detail.partName}</strong></div>
              <div><span>Inquiry status</span><StatusBadge status={detail.status} /></div>
              <div><span>Target vehicle</span><strong>{detail.vehicleName ? `${detail.vehicleName} - ${detail.vehicleNumber}` : 'General inquiry'}</strong></div>
              <div><span>Specification</span><strong>{detail.brandModelSpecification || 'Standard grade'}</strong></div>
              <div><span>Quantity</span><strong>{detail.quantity}</strong></div>
              <div><span>Inquiry notes</span><strong>{detail.reason || 'No notes provided'}</strong></div>
              <div><span>Record created</span><strong>{formatDateTime(detail.createdAt)}</strong></div>
              <div><span>Last updated</span><strong>{formatDateTime(detail.updatedAt)}</strong></div>
            </div>
          )}
        </PortalModal>
      )}

      {cancelTarget && (
        <PortalModal
          title="Withdraw part inquiry"
          onClose={() => setCancelTarget(null)}
          footer={(
            <>
              <button className="btn-outline" type="button" onClick={() => setCancelTarget(null)} disabled={isCancelling}>
                Keep inquiry
              </button>
              <button className="btn-primary" type="button" onClick={handleConfirmCancel} disabled={isCancelling}>
                {isCancelling ? 'Withdrawing...' : 'Confirm withdrawal'}
              </button>
            </>
          )}
        >
          <p className="portal-confirm-text">
            Are you sure you want to withdraw your inquiry for <strong>{cancelTarget.partName}</strong>? This removes it from the active review queue.
          </p>
        </PortalModal>
      )}
    </div>
  )
}

export default PartRequests
