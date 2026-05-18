import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createReview,
  deleteReview,
  getCommunityReviews,
  getReview,
  getReviews,
  getAppointments,
  updateReview,
} from '../../api/customerPortalApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import PortalEmptyState from '../../components/customer/PortalEmptyState'
import PortalHero from '../../components/customer/PortalHero'
import PortalModal from '../../components/customer/PortalModal'
import PortalWorkflowSteps from '../../components/customer/PortalWorkflowSteps'
import RatingInput from '../../components/customer/RatingInput'
import StatusBadge from '../../components/customer/StatusBadge'
import StatusMessage from '../../components/ui/StatusMessage'
import { formatDate, formatDateTime } from '../../utils/customerPortalFormatters'
import { customerPortalImages } from '../../utils/customerPortalImages'

const emptyForm = {
  scope: 'general',
  appointmentId: '',
  rating: 5,
  comment: '',
}

function StarRating({ rating, compact = false }) {
  const normalizedRating = Math.max(0, Math.min(5, Number(rating) || 0))

  return (
    <span className={`review-stars ${compact ? 'is-compact' : ''}`} aria-label={`${normalizedRating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} aria-hidden="true" className={star <= normalizedRating ? 'is-filled' : ''}>
          {star <= normalizedRating ? '★' : '☆'}
        </span>
      ))}
    </span>
  )
}

function getCustomerInitials(name) {
  const parts = String(name || 'Partivex customer')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  return (parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.slice(0, 2) || 'PC').toUpperCase()
}

function Reviews() {
  const [reviews, setReviews] = useState([])
  const [communityReviews, setCommunityReviews] = useState([])
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
    const [reviewResponse, communityReviewResponse, appointmentResponse] = await Promise.all([
      getReviews(),
      getCommunityReviews(),
      getAppointments(),
    ])

    setReviews(reviewResponse.data)
    setCommunityReviews(communityReviewResponse.data)
    setAppointments(appointmentResponse.data)
  }, [])

  useEffect(() => {
    let isCurrent = true

    async function fetchData() {
      try {
        const [reviewResponse, communityReviewResponse, appointmentResponse] = await Promise.all([
          getReviews(),
          getCommunityReviews(),
          getAppointments(),
        ])

        if (!isCurrent) return

        setReviews(reviewResponse.data)
        setCommunityReviews(communityReviewResponse.data)
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
    return (
      <div className="customer-container portal-container">
        <StatusMessage type="loading" message="Loading your feedback history..." />
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
        eyebrow="Feedback"
        title="Review services and keep your feedback history visible"
        description="Rate completed appointments or share general service feedback. Existing review APIs remain the source of truth."
        imageSrc={customerPortalImages.review}
        imageAlt="Customer and service advisor discussing vehicle work"
      />

      <div className="portal-grid">
        <section className="customer-card portal-form-card">
          <div className="section-header">
            <div className="section-header-text">
              <span className="customer-eyebrow">Guided feedback</span>
              <h2>{editingReview ? 'Edit review' : 'Submit feedback'}</h2>
              <p>{editingReview ? 'Update the rating and comment you already submitted.' : 'Choose the experience type, rating, and comment.'}</p>
            </div>
          </div>

          <PortalWorkflowSteps
            ariaLabel="Review steps"
            steps={[
              { label: 'Type', completed: Boolean(values.scope), current: false },
              { label: 'Rating', completed: Number(values.rating) >= 1, current: false },
              { label: 'Comment', completed: Boolean(values.comment.trim()), current: !values.comment.trim() },
            ]}
          />

          {formStatus && (
            <div className={`customer-form-alert ${formStatus.type === 'success' ? 'is-success' : ''}`} role={formStatus.type === 'error' ? 'alert' : 'status'}>
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
                <label htmlFor="appointmentId">Completed appointment</label>
                <select
                  id="appointmentId"
                  name="appointmentId"
                  className={`customer-input ${formErrors.appointmentId ? 'is-invalid' : ''}`}
                  value={values.appointmentId}
                  onChange={handleChange}
                  disabled={isSubmitting || Boolean(editingReview)}
                  aria-invalid={Boolean(formErrors.appointmentId)}
                >
                  <option value="">Select appointment</option>
                  {eligibleAppointments.map((appointment) => (
                    <option key={appointment.id} value={appointment.id}>
                      {appointment.serviceType} - {formatDate(appointment.preferredDate)}
                    </option>
                  ))}
                </select>
                {formErrors.appointmentId && <span className="customer-field-error">{formErrors.appointmentId}</span>}
                {eligibleAppointments.length === 0 && !editingReview && (
                  <span className="customer-field-help">Completed appointments that have not been reviewed will appear here.</span>
                )}
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
                placeholder="Mention what went well or what could be improved."
                aria-invalid={Boolean(formErrors.comment)}
              />
              {formErrors.comment && <span className="customer-field-error">{formErrors.comment}</span>}
              <span className="customer-field-help">Specific feedback helps improve future service visits.</span>
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
              <span className="customer-eyebrow">Manage feedback</span>
              <h2>Your reviews</h2>
              <p>Edit, inspect, or remove feedback linked to your account.</p>
            </div>
          </div>

          {reviews.length === 0 ? (
            <PortalEmptyState
              compact
              imageSrc={customerPortalImages.review}
              imageAlt="Service advisor gathering customer feedback"
              title="No reviews submitted"
              message="After a service visit, your feedback can help the team improve future experiences."
            />
          ) : (
            <div className="portal-item-list">
              {reviews.map((review) => (
                <article key={review.id} className="portal-list-item stacked">
                  <div className="portal-list-main">
                    <div className="portal-list-title-row">
                      <h3>{review.serviceType || 'General experience'}</h3>
                      <StarRating rating={review.rating} compact />
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

      <section className="customer-review-showcase" aria-labelledby="recent-reviews-title">
        <div className="review-showcase-header">
          <div>
            <span className="customer-eyebrow">Community feedback</span>
            <h2 id="recent-reviews-title">Recent reviews</h2>
          </div>
          <span>{communityReviews.length} shared</span>
        </div>

        {communityReviews.length === 0 ? (
          <PortalEmptyState
            compact
            imageSrc={customerPortalImages.review}
            imageAlt="Service advisor gathering customer feedback"
            title="No shared reviews yet"
            message="Customer reviews will appear here as soon as feedback is submitted."
          />
        ) : (
          <div className="review-card-grid">
            {communityReviews.map((review) => (
              <article key={review.id} className="review-card">
                <div className="review-card-topline">
                  <span className="review-avatar" aria-hidden="true">{getCustomerInitials(review.customerName)}</span>
                  <StarRating rating={review.rating} />
                </div>

                <div className="review-card-copy">
                  <h3>
                    <strong>{review.customerName}</strong>
                    <span> reviewed </span>
                    <strong>{review.serviceType || 'General experience'}</strong>
                  </h3>
                  <p>&ldquo;{review.comment}&rdquo;</p>
                </div>

                <div className="review-card-footer">
                  <span>{review.appointmentDate ? formatDate(review.appointmentDate) : formatDateTime(review.createdAt)}</span>
                  {review.isOwnReview && <span className="review-owner-badge">Your review</span>}
                </div>

                {review.isOwnReview && (
                  <div className="review-card-actions">
                    <button className="btn-outline btn-outline-on-dark" type="button" onClick={() => handleViewDetails(review.id)}>
                      Details
                    </button>
                    <button className="btn-outline btn-outline-on-dark" type="button" onClick={() => handleEdit(review)}>
                      Edit
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="customer-trust-strip">
        <div>
          <strong>Appointment-specific</strong>
          <span>Link feedback to completed service visits.</span>
        </div>
        <div>
          <strong>Editable feedback</strong>
          <span>Update a review when your experience changes.</span>
        </div>
        <div>
          <strong>History retained</strong>
          <span>Keep service context visible over time.</span>
        </div>
      </section>

      {(detailLoading || detail || detailError) && (
        <PortalModal title="Review details" onClose={() => {
          setDetail(null)
          setDetailError('')
          setDetailLoading(false)
        }}>
          {detailLoading && <StatusMessage type="loading" message="Loading review details..." />}
          {detailError && <StatusMessage type="error" message={detailError} />}
          {detail && (
            <div className="portal-detail-list">
              <div><span>Type</span><strong>{detail.category}</strong></div>
              <div><span>Rating</span><strong><StarRating rating={detail.rating} compact /></strong></div>
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
