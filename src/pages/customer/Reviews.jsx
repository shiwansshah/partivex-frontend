import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createReview,
  deleteReview,
  getReview,
  getReviews,
  getAppointments,
  updateReview,
} from '../../api/customerPortalApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import PortalModal from '../../components/customer/PortalModal'
import RatingInput from '../../components/customer/RatingInput'
import StatusBadge from '../../components/customer/StatusBadge'
import StatusMessage from '../../components/ui/StatusMessage'
import { formatDate, formatDateTime } from '../../utils/customerPortalFormatters'

const emptyForm = {
  scope: 'general',
  appointmentId: '',
  rating: 5,
  comment: '',
}

function Reviews() {
  const [reviews, setReviews] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [values, setValues] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [formStatus, setFormStatus] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = useCallback(async () => {
    const [reviewResponse, appointmentResponse] = await Promise.all([
      getReviews(),
      getAppointments(),
    ])

    setReviews(reviewResponse.data)
    setAppointments(appointmentResponse.data)
  }, [])

  useEffect(() => {
    let isCurrent = true

    async function fetchData() {
      try {
        const [reviewResponse, appointmentResponse] = await Promise.all([
          getReviews(),
          getAppointments(),
        ])

        if (!isCurrent) return

        setReviews(reviewResponse.data)
        setAppointments(appointmentResponse.data)
      } catch (err) {
        if (isCurrent) {
          setError(getRequestErrorMessage(err, 'Failed to load reviews.'))
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

  const eligibleAppointments = useMemo(() => {
    const reviewedAppointmentIds = new Set(
      reviews
        .filter((review) => review.appointmentId && review.id !== editingReview?.id)
        .map((review) => review.appointmentId),
    )

    return appointments.filter((appointment) =>
      appointment.status === 'Completed' && !reviewedAppointmentIds.has(appointment.id))
  }, [appointments, editingReview?.id, reviews])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function handleRatingChange(rating) {
    setValues((current) => ({ ...current, rating }))
  }

  function validate() {
    const nextErrors = {}
    const rating = Number(values.rating)

    if (rating < 1 || rating > 5) {
      nextErrors.rating = 'Rating must be between 1 and 5.'
    }

    if (!values.comment.trim()) {
      nextErrors.comment = 'Review comment is required.'
    }

    if (!editingReview && values.scope === 'appointment' && !values.appointmentId) {
      nextErrors.appointmentId = 'Select a completed appointment.'
    }

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function resetForm() {
    setValues(emptyForm)
    setFormErrors({})
    setEditingReview(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormStatus(null)

    if (!validate()) return

    try {
      setIsSubmitting(true)

      if (editingReview) {
        await updateReview(editingReview.id, {
          rating: Number(values.rating),
          comment: values.comment.trim(),
        })
        setFormStatus({ type: 'success', message: 'Review updated successfully.' })
      } else {
        await createReview({
          appointmentId: values.scope === 'appointment' ? values.appointmentId : null,
          rating: Number(values.rating),
          comment: values.comment.trim(),
        })
        setFormStatus({ type: 'success', message: 'Review submitted successfully.' })
      }

      resetForm()
      await loadData()
    } catch (err) {
      setFormStatus({
        type: 'error',
        message: getRequestErrorMessage(err, 'Failed to save review.'),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleEdit(review) {
    setEditingReview(review)
    setValues({
      scope: review.appointmentId ? 'appointment' : 'general',
      appointmentId: review.appointmentId || '',
      rating: review.rating,
      comment: review.comment,
    })
    setFormErrors({})
    setFormStatus(null)
  }

  async function handleViewDetails(id) {
    setDetail(null)
    setDetailError('')
    setDetailLoading(true)

    try {
      const response = await getReview(id)
      setDetail(response.data)
    } catch (err) {
      setDetailError(getRequestErrorMessage(err, 'Failed to load review details.'))
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return

    try {
      setIsDeleting(true)
      await deleteReview(deleteTarget.id)
      setDeleteTarget(null)
      if (editingReview?.id === deleteTarget.id) {
        resetForm()
      }
      setFormStatus({ type: 'success', message: 'Review deleted successfully.' })
      await loadData()
    } catch (err) {
      setFormStatus({
        type: 'error',
        message: getRequestErrorMessage(err, 'Failed to delete review.'),
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return <StatusMessage type="loading" message="Loading reviews..." />
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
        <h2>Reviews</h2>
        <p>Share service feedback and manage your submitted reviews.</p>
      </div>

      <div className="portal-grid">
        <section className="customer-card portal-form-card">
          <div className="section-header">
            <div className="section-header-text">
              <h2>{editingReview ? 'Edit review' : 'Submit feedback'}</h2>
              <p>{editingReview ? 'Update your rating and comment.' : 'Rate your experience with Partivex.'}</p>
            </div>
          </div>

          {formStatus && (
            <div className={`customer-form-alert ${formStatus.type === 'success' ? 'is-success' : ''}`}>
              {formStatus.message}
            </div>
          )}

          <form className="customer-form" onSubmit={handleSubmit} noValidate>
            <div className="customer-form-group">
              <label htmlFor="scope">Review type</label>
              <select
                id="scope"
                name="scope"
                className="customer-input"
                value={values.scope}
                onChange={handleChange}
                disabled={isSubmitting || Boolean(editingReview)}
              >
                <option value="general">General experience</option>
                <option value="appointment">Completed appointment</option>
              </select>
            </div>

            {values.scope === 'appointment' && (
              <div className="customer-form-group">
                <label htmlFor="appointmentId">Appointment</label>
                <select
                  id="appointmentId"
                  name="appointmentId"
                  className={`customer-input ${formErrors.appointmentId ? 'is-invalid' : ''}`}
                  value={values.appointmentId}
                  onChange={handleChange}
                  disabled={isSubmitting || Boolean(editingReview)}
                >
                  <option value="">Select appointment</option>
                  {eligibleAppointments.map((appointment) => (
                    <option key={appointment.id} value={appointment.id}>
                      {appointment.serviceType} - {formatDate(appointment.preferredDate)}
                    </option>
                  ))}
                </select>
                {formErrors.appointmentId && <span className="customer-field-error">{formErrors.appointmentId}</span>}
              </div>
            )}

            <div className="customer-form-group">
              <label>Rating</label>
              <RatingInput value={values.rating} onChange={handleRatingChange} disabled={isSubmitting} />
              {formErrors.rating && <span className="customer-field-error">{formErrors.rating}</span>}
            </div>

            <div className="customer-form-group">
              <label htmlFor="comment">Review comment</label>
              <textarea
                id="comment"
                name="comment"
                className={`customer-input portal-textarea ${formErrors.comment ? 'is-invalid' : ''}`}
                value={values.comment}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {formErrors.comment && <span className="customer-field-error">{formErrors.comment}</span>}
            </div>

            <div className="form-actions">
              <button className="btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingReview ? 'Update review' : 'Submit review'}
              </button>
              {editingReview && (
                <button className="btn-outline" type="button" onClick={resetForm} disabled={isSubmitting}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="customer-card portal-list-card">
          <div className="section-header">
            <div className="section-header-text">
              <h2>My reviews</h2>
              <p>Review history and linked service context.</p>
            </div>
          </div>

          {reviews.length === 0 ? (
            <StatusMessage type="empty" message="No reviews submitted yet." />
          ) : (
            <div className="portal-item-list">
              {reviews.map((review) => (
                <article key={review.id} className="portal-list-item">
                  <div className="portal-list-main">
                    <div className="portal-list-title-row">
                      <h3>{review.serviceType || 'General experience'}</h3>
                      <span className="rating-readout">{review.rating}/5</span>
                    </div>
                    <p>{review.comment}</p>
                    <div className="portal-meta-grid">
                      <span>{review.category}</span>
                      <span>{review.appointmentDate ? formatDate(review.appointmentDate) : formatDateTime(review.createdAt)}</span>
                    </div>
                    {review.appointmentStatus && (
                      <div className="portal-inline-status">
                        <StatusBadge status={review.appointmentStatus} />
                      </div>
                    )}
                  </div>
                  <div className="portal-actions">
                    <button className="btn-outline" type="button" onClick={() => handleViewDetails(review.id)}>
                      Details
                    </button>
                    <button className="btn-outline" type="button" onClick={() => handleEdit(review)}>
                      Edit
                    </button>
                    <button className="btn-outline text-danger" type="button" onClick={() => setDeleteTarget(review)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {(detailLoading || detail || detailError) && (
        <PortalModal title="Review details" onClose={() => {
          setDetail(null)
          setDetailError('')
          setDetailLoading(false)
        }}>
          {detailLoading && <StatusMessage type="loading" message="Loading details..." />}
          {detailError && <StatusMessage type="error" message={detailError} />}
          {detail && (
            <div className="portal-detail-list">
              <div><span>Type</span><strong>{detail.category}</strong></div>
              <div><span>Rating</span><strong>{detail.rating}/5</strong></div>
              <div><span>Linked service</span><strong>{detail.serviceType || 'General experience'}</strong></div>
              <div><span>Appointment date</span><strong>{detail.appointmentDate ? formatDate(detail.appointmentDate) : 'Not linked'}</strong></div>
              <div><span>Appointment status</span>{detail.appointmentStatus ? <StatusBadge status={detail.appointmentStatus} /> : <strong>Not linked</strong>}</div>
              <div><span>Comment</span><strong>{detail.comment}</strong></div>
              <div><span>Created</span><strong>{formatDateTime(detail.createdAt)}</strong></div>
              <div><span>Updated</span><strong>{formatDateTime(detail.updatedAt)}</strong></div>
            </div>
          )}
        </PortalModal>
      )}

      {deleteTarget && (
        <PortalModal
          title="Delete review"
          onClose={() => setDeleteTarget(null)}
          footer={(
            <>
              <button className="btn-outline" type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                Keep review
              </button>
              <button className="btn-primary" type="button" onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete review'}
              </button>
            </>
          )}
        >
          <p className="portal-confirm-text">
            This will delete your review for {deleteTarget.serviceType || 'general experience'}.
          </p>
        </PortalModal>
      )}
    </div>
  )
}

export default Reviews
