import { useCallback, useEffect, useState } from 'react'
import {
  cancelPartRequest,
  createPartRequest,
  getPartRequest,
  getPartRequests,
} from '../../api/customerPortalApi'
import { getMyVehicles } from '../../api/vehicleApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import PortalModal from '../../components/customer/PortalModal'
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
    <div className="customer-page portal-container">
      <section className="portal-page-hero">
        <div>
          <span className="customer-eyebrow">Parts desk</span>
          <h1>Part requests</h1>
          <p>Send part details, fitment notes, and quantities so the team can review availability.</p>
        </div>
        <img src={customerPortalImages.parts} alt="Vehicle spare parts arranged in a workshop" />
      </section>

      <div className="portal-grid">
        <section className="customer-card portal-form-card">
          <div className="section-header">
            <div className="section-header-text">
              <span className="customer-eyebrow">Guided request</span>
              <h2>Request a part</h2>
              <p>Give enough detail to reduce matching errors before review.</p>
            </div>
          </div>

          <div className="workflow-steps" aria-label="Part request steps">
            <span>Part</span>
            <span>Vehicle</span>
            <span>Specs</span>
            <span>Reason</span>
          </div>

          {formStatus && (
            <div className={`customer-form-alert ${formStatus.type === 'success' ? 'is-success' : ''}`}>
              {formStatus.message}
            </div>
          )}

          <form className="customer-form" onSubmit={handleSubmit} noValidate>
            <div className="customer-form-group">
              <label htmlFor="partName">Part name</label>
              <input
                id="partName"
                name="partName"
                className={`customer-input ${formErrors.partName ? 'is-invalid' : ''}`}
                value={values.partName}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {formErrors.partName && <span className="customer-field-error">{formErrors.partName}</span>}
              <span className="customer-field-help">Use the common part name, for example brake pad, headlamp, filter, or belt.</span>
            </div>

            <div className="customer-form-group">
              <label htmlFor="vehicleId">Vehicle</label>
              <select
                id="vehicleId"
                name="vehicleId"
                className="customer-input"
                value={values.vehicleId}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">General or not sure</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} - {vehicle.number}
                  </option>
                ))}
              </select>
            </div>

            <div className="portal-form-row">
              <div className="customer-form-group">
                <label htmlFor="brandModelSpecification">Brand, model, or specification</label>
                <input
                  id="brandModelSpecification"
                  name="brandModelSpecification"
                  className="customer-input"
                  value={values.brandModelSpecification}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>

              <div className="customer-form-group">
                <label htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  className={`customer-input ${formErrors.quantity ? 'is-invalid' : ''}`}
                  value={values.quantity}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {formErrors.quantity && <span className="customer-field-error">{formErrors.quantity}</span>}
              </div>
            </div>

            <div className="customer-form-group">
              <label htmlFor="reason">Reason or notes</label>
              <textarea
                id="reason"
                name="reason"
                className="customer-input portal-textarea"
                value={values.reason}
                onChange={handleChange}
                placeholder="Mention fitment notes, urgency, or symptoms if helpful."
                disabled={isSubmitting}
              />
              <span className="customer-field-help">Fitment details, urgency, symptoms, or preferred brand can help the team review faster.</span>
            </div>

            <button className="btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit request'}
            </button>
          </form>
        </section>

        <section className="customer-card portal-list-card">
          <div className="section-header">
            <div className="section-header-text">
              <span className="customer-eyebrow">Request history</span>
              <h2>My part requests</h2>
              <p>Track requests from review through availability.</p>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="customer-empty-panel compact">
              <img src={customerPortalImages.parts} alt="Organized vehicle parts storage" />
              <div>
                <h3>No part requests submitted yet</h3>
                <p>Requests you submit will appear here with their current review status.</p>
              </div>
            </div>
          ) : (
            <div className="portal-item-list">
              {requests.map((request) => (
                <article key={request.id} className="portal-list-item">
                  <div className="portal-list-main">
                    <div className="portal-list-title-row">
                      <h3>{request.partName}</h3>
                      <StatusBadge status={request.status} />
                    </div>
                    <p>{request.vehicleName ? `${request.vehicleName} - ${request.vehicleNumber}` : 'General request'}</p>
                    <div className="portal-meta-grid">
                      <span>Qty {request.quantity}</span>
                      <span>{formatDateTime(request.createdAt)}</span>
                    </div>
                  </div>
                  <div className="portal-actions">
                    <button className="btn-outline" type="button" onClick={() => handleViewDetails(request.id)}>
                      Details
                    </button>
                    {request.status === 'Pending' && (
                      <button className="btn-outline text-danger" type="button" onClick={() => setCancelTarget(request)}>
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

      <section className="customer-trust-strip">
        <div>
          <strong>Optional vehicle link</strong>
          <span>Attach a vehicle when fitment matters.</span>
        </div>
        <div>
          <strong>Clear quantity</strong>
          <span>Review starts with the amount you need.</span>
        </div>
        <div>
          <strong>Cancelable while pending</strong>
          <span>Pending requests can still be withdrawn.</span>
        </div>
      </section>

      {(detailLoading || detail || detailError) && (
        <PortalModal title="Part request details" onClose={() => {
          setDetail(null)
          setDetailError('')
          setDetailLoading(false)
        }}>
          {detailLoading && <StatusMessage type="loading" message="Loading details..." />}
          {detailError && <StatusMessage type="error" message={detailError} />}
          {detail && (
            <div className="portal-detail-list">
              <div><span>Part</span><strong>{detail.partName}</strong></div>
              <div><span>Status</span><StatusBadge status={detail.status} /></div>
              <div><span>Vehicle</span><strong>{detail.vehicleName ? `${detail.vehicleName} - ${detail.vehicleNumber}` : 'General request'}</strong></div>
              <div><span>Specification</span><strong>{detail.brandModelSpecification || 'Not provided'}</strong></div>
              <div><span>Quantity</span><strong>{detail.quantity}</strong></div>
              <div><span>Reason</span><strong>{detail.reason || 'No notes provided'}</strong></div>
              <div><span>Created</span><strong>{formatDateTime(detail.createdAt)}</strong></div>
              <div><span>Updated</span><strong>{formatDateTime(detail.updatedAt)}</strong></div>
            </div>
          )}
        </PortalModal>
      )}

      {cancelTarget && (
        <PortalModal
          title="Cancel part request"
          onClose={() => setCancelTarget(null)}
          footer={(
            <>
              <button className="btn-outline" type="button" onClick={() => setCancelTarget(null)} disabled={isCancelling}>
                Keep request
              </button>
              <button className="btn-primary" type="button" onClick={handleConfirmCancel} disabled={isCancelling}>
                {isCancelling ? 'Cancelling...' : 'Cancel request'}
              </button>
            </>
          )}
        >
          <p className="portal-confirm-text">
            This will cancel your request for {cancelTarget.partName}. Only pending requests can be cancelled.
          </p>
        </PortalModal>
      )}
    </div>
  )
}

export default PartRequests
