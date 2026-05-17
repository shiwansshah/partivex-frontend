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
    <div className="customer-container" style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* Premium Profile Hero */}
      <div className="customer-card" style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '0',
        marginBottom: 'var(--space-8)',
        border: 'none',
        background: 'transparent',
        boxShadow: 'none'
      }}>
        {/* Cover Background */}
        <div style={{
          height: '160px',
          background: 'linear-gradient(135deg, rgba(239, 35, 60, 0.8), rgba(23, 26, 33, 0.9)), url("/src/assets/auth-vehicle-bg.png") center / cover',
          borderRadius: 'var(--radius-2xl)'
        }} />

        {/* Profile Info Overlay */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          padding: '0 var(--space-8)',
          marginTop: '-64px',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{
            width: '128px',
            height: '128px',
            borderRadius: '50%',
            background: 'white',
            padding: '8px',
            marginRight: 'var(--space-6)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'var(--color-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--text-4xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--color-primary)'
            }}>
              {getInitials(profile.fullName)}
            </div>
          </div>
          <div style={{ paddingBottom: 'var(--space-2)' }}>
            <h1 style={{ fontSize: 'var(--text-5xl)', fontWeight: 'var(--weight-extrabold)', letterSpacing: '-1px', margin: '0 0 var(--space-2)' }}>
              {profile.fullName}
            </h1>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', margin: 0 }}>
              {profile.email} • {profile.phoneNumber || 'No phone set'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-6)' }}>
        <div className="customer-card">
          <div className="profile-list-header profile-list-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
            <div>
              <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', margin: '0 0 4px' }}>Personal Information</h3>
              <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Keep your details up to date.</p>
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                style={{
                  background: 'var(--color-bg)',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  fontWeight: 'var(--weight-bold)',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-surface)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
              >
                Edit profile
              </button>
            )}
          </div>

          {status && (
            <div className={`customer-form-alert ${status.includes('successfully') ? 'is-success' : ''}`} style={{ marginBottom: 'var(--space-6)' }}>
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
                  style={{ borderRadius: 'var(--radius-lg)' }}
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
                  style={{ borderRadius: 'var(--radius-lg)' }}
                />
                {errors.phoneNumber && <span className="customer-field-error">{errors.phoneNumber}</span>}
              </div>

              <div className="form-actions" style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)' }}>
                <button className="btn-primary" type="submit" disabled={isSaving} style={{ borderRadius: '999px', padding: '10px 24px' }}>
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  className="btn-outline"
                  type="button"
                  onClick={cancelEdit}
                  disabled={isSaving}
                  style={{ borderRadius: '999px', padding: '10px 24px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
              <div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 'var(--weight-bold)', marginBottom: '4px' }}>Full Name</div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)' }}>{profile.fullName}</div>
              </div>

              <div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 'var(--weight-bold)', marginBottom: '4px' }}>Phone Number</div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)' }}>{profile.phoneNumber || <span className="text-muted">Not set</span>}</div>
              </div>

              <div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 'var(--weight-bold)', marginBottom: '4px' }}>Account ID</div>
                <div style={{ fontSize: 'var(--text-base)', fontFamily: 'var(--font-mono)', padding: '4px 8px', background: 'var(--color-bg)', display: 'inline-block', borderRadius: '4px' }}>
                  {profile.id}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="customer-card">
          <div className="profile-list-header" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', margin: '0 0 4px' }}>Security & Details</h3>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Your authentication info.</p>
          </div>

          <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 'var(--weight-bold)', marginBottom: '4px' }}>Registered Email</div>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)' }}>{profile.email}</div>
            </div>

            <div style={{ padding: 'var(--space-6)', background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-success)' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <div>
                  <div style={{ fontWeight: 'var(--weight-bold)' }}>Account Secure</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>You are currently logged in securely.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
