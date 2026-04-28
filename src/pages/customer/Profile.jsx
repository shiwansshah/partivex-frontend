import { useState, useEffect } from 'react'
import { getProfile } from '../../api/authApi'
import { getRequestErrorMessage } from '../../api/axiosClient'
import StatusMessage from '../../components/ui/StatusMessage'

function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await getProfile()
        setProfile(response.data)
      } catch (err) {
        setError(getRequestErrorMessage(err, 'Failed to load profile.'))
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

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

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <div className="customer-container">
      <div className="customer-header">
        <h2>Personal info</h2>
        <p>Info about you and your preferences across Partivex services.</p>
      </div>

      <div className="profile-list-card">
        <div className="profile-list-header">
          <h3>Basic info</h3>
          <p>Some info may be visible to other people using Partivex services.</p>
        </div>

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
