import { useState, useEffect } from 'react'
import { getProfile, updateProfile } from '../../api/authApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import PortalHero from '../../components/customer/PortalHero'
import StatusMessage from '../../components/ui/StatusMessage'
import { customerPortalImages } from '../../utils/customerPortalImages'

const emptyForm = {
  fullName: '',
  phoneNumber: '',
}

function normalizePhoneInput(value) {
  return value.trim().replace(/\s+/g, '')
}

function isNepaliMobileNumber(value) {
  if (!value.trim()) return true

  const digits = value.replace(/\D/g, '')
  const localDigits = digits.startsWith('977') ? digits.slice(3) : digits

  return /^9[78]\d{8}$/.test(localDigits)
}

function getInitials(name) {
  if (!name) return 'U'
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

function Profile() {
  const [profile, setProfile] = useState(null)
  const [values, setValues] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await getProfile()
        setProfile(response.data)
        setValues({
          fullName: response.data.fullName || '',
          phoneNumber: response.data.phoneNumber || '',
        })
      } catch (err) {
        setError(getRequestErrorMessage(err, 'Failed to load profile.'))
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function validate() {
    const nextErrors = {}

    if (!values.fullName.trim()) {
      nextErrors.fullName = 'Name is required.'
    }

    if (!isNepaliMobileNumber(values.phoneNumber)) {
      nextErrors.phoneNumber = 'Enter a valid Nepali mobile number.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function cancelEdit() {
    setValues({
      fullName: profile.fullName || '',
      phoneNumber: profile.phoneNumber || '',
    })
    setErrors({})
    setStatus('')
    setIsEditing(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('')

    if (!validate()) return

    try {
      setIsSaving(true)
      const response = await updateProfile({
        fullName: values.fullName.trim(),
        phoneNumber: normalizePhoneInput(values.phoneNumber),
      })

      setProfile(response.data)
      setValues({
        fullName: response.data.fullName || '',
        phoneNumber: response.data.phoneNumber || '',
      })
      setIsEditing(false)
      setStatus('Profile updated successfully.')
    } catch (err) {
      setStatus(getRequestErrorMessage(err, 'Failed to update profile.'))
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="customer-container portal-container">
        <StatusMessage type="loading" message="Loading your profile..." />
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

  if (!profile) return null

  return (
    <div className="customer-page">
      <PortalHero
        eyebrow="Account"
        title="Keep contact details ready for service coordination"
        description="Your profile information helps connect bookings, part requests, and customer support conversations to the right account."
        imageSrc={customerPortalImages.support}
        imageAlt="Service team reviewing vehicle service information"
      />

      <div className="profile-layout-grid">
        <section className="profile-list-card">
          <div className="profile-list-header profile-list-header-actions">
            <div>
              <span className="customer-eyebrow">Identity</span>
              <h3>Basic information</h3>
              <p>Name and phone number are editable. Email remains tied to sign-in.</p>
            </div>
            {!isEditing && (
              <button className="btn-outline" type="button" onClick={() => setIsEditing(true)}>
                Edit profile
              </button>
            )}
          </div>

          {status && (
            <div
              className={`customer-form-alert ${status.includes('successfully') ? 'is-success' : ''}`}
              role={status.includes('successfully') ? 'status' : 'alert'}
            >
              {status}
            </div>
          )}

          {isEditing ? (
            <form className="customer-form profile-edit-form" onSubmit={handleSubmit} noValidate>
              <div className="customer-form-group">
                <label htmlFor="fullName">Name</label>
                <input
                  id="fullName"
                  className={`customer-input ${errors.fullName ? 'is-invalid' : ''}`}
                  name="fullName"
                  value={values.fullName}
                  onChange={handleChange}
                  disabled={isSaving}
                  aria-invalid={Boolean(errors.fullName)}
                />
                {errors.fullName && <span className="customer-field-error">{errors.fullName}</span>}
              </div>

              <div className="customer-form-group">
                <label htmlFor="phoneNumber">Nepali mobile number</label>
                <input
                  id="phoneNumber"
                  className={`customer-input ${errors.phoneNumber ? 'is-invalid' : ''}`}
                  name="phoneNumber"
                  value={values.phoneNumber}
                  onChange={handleChange}
                  placeholder="9812345678 or +9779812345678"
                  disabled={isSaving}
                  aria-invalid={Boolean(errors.phoneNumber)}
                />
                {errors.phoneNumber && <span className="customer-field-error">{errors.phoneNumber}</span>}
              </div>

              <div className="form-actions">
                <button className="btn-primary" type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
                <button className="btn-outline" type="button" onClick={cancelEdit} disabled={isSaving}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="profile-list-item">
                <div className="profile-item-label">Profile marker</div>
                <div className="profile-item-value">
                  <div className="profile-item-avatar">{getInitials(profile.fullName)}</div>
                </div>
              </div>

              <div className="profile-list-item">
                <div className="profile-item-label">Name</div>
                <div className="profile-item-value">{profile.fullName}</div>
              </div>

              <div className="profile-list-item">
                <div className="profile-item-label">Account ID</div>
                <div className="profile-item-value text-mono">{profile.id}</div>
              </div>
            </>
          )}
        </section>

        <section className="profile-list-card">
          <div className="profile-list-header">
            <span className="customer-eyebrow">Reachability</span>
            <h3>Contact information</h3>
            <p>These details support appointment and part request follow-up.</p>
          </div>

          <div className="profile-list-item">
            <div className="profile-item-label">Email</div>
            <div className="profile-item-value">{profile.email}</div>
          </div>

          <div className="profile-list-item">
            <div className="profile-item-label">Phone</div>
            <div className="profile-item-value">
              {profile.phoneNumber || <span className="text-muted">Not set</span>}
            </div>
          </div>
        </section>

        <aside className="customer-side-panel profile-side-panel">
          <img src={customerPortalImages.garage} alt="Service team preparing a garage bay" />
          <div>
            <span className="customer-eyebrow">Why update this?</span>
            <h2>Service teams use contact details when they need to confirm a booking or clarify a part request.</h2>
            <p>Your account identity stays protected while editable contact details remain practical for coordination.</p>
          </div>
        </aside>
      </div>

      <section className="customer-trust-strip">
        <div>
          <strong>Protected route</strong>
          <span>Your profile details are available only after customer sign-in.</span>
        </div>
        <div>
          <strong>Clean phone input</strong>
          <span>Spacing is normalized before the update request is sent.</span>
        </div>
        <div>
          <strong>Email stability</strong>
          <span>Sign-in email remains visible without adding unsupported edits.</span>
        </div>
      </section>
    </div>
  )
}

export default Profile
