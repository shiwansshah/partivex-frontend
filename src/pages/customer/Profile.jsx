import { useState, useEffect } from 'react'
import { getProfile, updateProfile } from '../../api/authApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import StatusMessage from '../../components/ui/StatusMessage'

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
    return <StatusMessage type="loading" message="Loading profile..." />
  }

  if (error) {
    return (
      <div className="customer-container">
        <StatusMessage type="error" message={error} />
      </div>
    )
  }

  if (!profile) return null

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map((part) => part[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <div className="customer-container">
      <div className="customer-header">
        <h2>Personal info</h2>
        <p>Info about you and your preferences across Partivex services.</p>
      </div>

      <div className="profile-list-card">
        <div className="profile-list-header profile-list-header-actions">
          <div>
            <h3>Basic info</h3>
            <p>Keep your name and Nepali phone number up to date.</p>
          </div>
          {!isEditing && (
            <button className="btn-outline" type="button" onClick={() => setIsEditing(true)}>
              Edit profile
            </button>
          )}
        </div>

        {status && (
          <div className={`customer-form-alert ${status.includes('successfully') ? 'is-success' : ''}`}>
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
                placeholder="e.g. 9812345678 or +9779812345678"
                disabled={isSaving}
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
              <div className="profile-item-label">Profile picture</div>
              <div className="profile-item-value">
                <div className="profile-item-avatar">
                  {getInitials(profile.fullName)}
                </div>
              </div>
            </div>

            <div className="profile-list-item">
              <div className="profile-item-label">Name</div>
              <div className="profile-item-value">{profile.fullName}</div>
            </div>

            <div className="profile-list-item">
              <div className="profile-item-label">Account ID</div>
              <div className="profile-item-value text-mono">
                {profile.id}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="profile-list-card">
        <div className="profile-list-header">
          <h3>Contact info</h3>
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
      </div>
    </div>
  )
}

export default Profile
