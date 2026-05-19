import { useEffect, useMemo, useState } from 'react'
import { getApiErrorMessage } from '../../api/axiosInstance'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import StatusMessage from '../../components/ui/StatusMessage'
import { STAFF_FEATURES } from '../../constants/staffFeatures'
import useAuth from '../../hooks/useAuth'
import {
  createStaff,
  deleteStaff,
  getStaff,
  getStaffAccess,
  updateStaff,
  updateStaffAccess,
} from '../../services/staffService'
import { hasRole, ROLES } from '../../utils/roles'
import { isEmail, required } from '../../utils/validator'

const initialValues = {
  fullName: '',
  email: '',
  password: '',
}

function StaffPage() {
  const { user } = useAuth()
  const isAdmin = hasRole(user?.role, [ROLES.ADMIN])
  const [staff, setStaff] = useState([])
  const [values, setValues] = useState(initialValues)
  const [editingStaff, setEditingStaff] = useState(null)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')
  const [featureStatus, setFeatureStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFeatureLoading, setIsFeatureLoading] = useState(false)
  const [isFeatureSaving, setIsFeatureSaving] = useState(false)
  const [selectedFeatureKeys, setSelectedFeatureKeys] = useState([])

  const formTitle = useMemo(
    () => (editingStaff ? 'Update staff member' : 'Add staff member'),
    [editingStaff],
  )

  async function loadStaff() {
    try {
      setStatus('')
      const data = await getStaff()
      setStaff(data)
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Unable to load staff.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isCurrent = true

    async function loadInitialStaff() {
      try {
        setStatus('')
        const data = await getStaff()
        if (isCurrent) setStaff(data)
      } catch (error) {
        if (isCurrent) setStatus(getApiErrorMessage(error, 'Unable to load staff.'))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadInitialStaff()

    return () => {
      isCurrent = false
    }
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function resetForm() {
    setEditingStaff(null)
    setValues(initialValues)
    setErrors({})
    setFeatureStatus('')
    setSelectedFeatureKeys([])
  }

  async function handleEdit(member) {
    setEditingStaff(member)
    setValues({
      fullName: member.fullName,
      email: member.email,
      password: '',
    })
    setErrors({})
    setStatus('')
    setFeatureStatus('')

    if (isAdmin) {
      await loadFeatureAccess(member.id)
    }
  }

  async function loadFeatureAccess(staffId) {
    try {
      setIsFeatureLoading(true)
      const access = await getStaffAccess(staffId)
      setSelectedFeatureKeys(
        access.features
          .filter((feature) => feature.isEnabled)
          .map((feature) => feature.featureKey),
      )
    } catch (error) {
      setFeatureStatus(getApiErrorMessage(error, 'Unable to load staff feature access.'))
      setSelectedFeatureKeys([])
    } finally {
      setIsFeatureLoading(false)
    }
  }

  function validate() {
    const nextErrors = {}

    if (!required(values.fullName)) nextErrors.fullName = 'Full name is required.'
    if (!editingStaff) {
      if (!required(values.email)) nextErrors.email = 'Email is required.'
      else if (!isEmail(values.email)) nextErrors.email = 'Enter a valid email.'
      if (!required(values.password)) nextErrors.password = 'Password is required.'
      else if (values.password.length < 6) nextErrors.password = 'Password must be at least 6 characters.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('')

    if (!validate()) return

    try {
      setIsSubmitting(true)

      if (editingStaff) {
        await updateStaff(editingStaff.id, { fullName: values.fullName.trim() })
      } else {
        await createStaff({
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          password: values.password,
          featureKeys: selectedFeatureKeys,
        })
      }

      resetForm()
      await loadStaff()
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Unable to save staff member.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id) {
    try {
      setStatus('')
      await deleteStaff(id)
      await loadStaff()
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Unable to delete staff member.'))
    }
  }

  function handleFeatureToggle(featureKey) {
    setSelectedFeatureKeys((current) =>
      current.includes(featureKey)
        ? current.filter((key) => key !== featureKey)
        : [...current, featureKey],
    )
  }

  async function handleFeatureSave() {
    if (!editingStaff) return

    try {
      setIsFeatureSaving(true)
      setFeatureStatus('')
      await updateStaffAccess(editingStaff.id, selectedFeatureKeys)
      setFeatureStatus('Feature access updated successfully.')
    } catch (error) {
      setFeatureStatus(getApiErrorMessage(error, 'Unable to update feature access.'))
    } finally {
      setIsFeatureSaving(false)
    }
  }

  return (
    <section className="page-stack">
      <div className="surface-panel">
        <PageHeader
          title="Staff Management"
          subtitle={
            isAdmin
              ? 'Create, update, and remove staff accounts.'
              : 'View staff accounts. Administrative changes are restricted to admins.'
          }
        />
      </div>

      {isAdmin && (
        <div className="surface-panel narrow-panel">
          <PageHeader title={formTitle} />
          <form className="managed-form" onSubmit={handleSubmit} noValidate>
            <Input
              id="staffFullName"
              label="Full name"
              name="fullName"
              value={values.fullName}
              onChange={handleChange}
              error={errors.fullName}
            />
            <Input
              id="staffEmail"
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              error={errors.email}
              disabled={Boolean(editingStaff)}
            />
            {!editingStaff && (
              <>
                <Input
                  id="staffPassword"
                  label="Temporary password"
                  name="password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  error={errors.password}
                />

                <div className="form-section">
                  <h3>Feature Access</h3>
                  {STAFF_FEATURES.map((feature) => (
                    <label key={feature.key} className="form-check-row">
                      <input
                        type="checkbox"
                        checked={selectedFeatureKeys.includes(feature.key)}
                        onChange={() => handleFeatureToggle(feature.key)}
                        disabled={isSubmitting}
                      />
                      <span>{feature.label}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
            <div className="form-actions">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingStaff ? 'Update Staff' : 'Create Staff'}
              </Button>
              {editingStaff && (
                <Button type="button" variant="secondary" onClick={resetForm} disabled={isSubmitting}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>
      )}

      {isAdmin && editingStaff && (
        <div className="surface-panel narrow-panel">
          <PageHeader
            title="Feature Access"
            subtitle={`Choose which staff modules ${editingStaff.fullName || editingStaff.email} can use.`}
          />

          {featureStatus && (
            <StatusMessage
              type={featureStatus.includes('successfully') ? 'success' : 'error'}
              message={featureStatus}
            />
          )}
          {isFeatureLoading && <StatusMessage message="Loading feature access..." />}

          {!isFeatureLoading && (
            <div className="managed-form">
              {STAFF_FEATURES.map((feature) => (
                <label key={feature.key} className="form-check-row">
                  <input
                    type="checkbox"
                    checked={selectedFeatureKeys.includes(feature.key)}
                    onChange={() => handleFeatureToggle(feature.key)}
                    disabled={isFeatureSaving}
                  />
                  <span>{feature.label}</span>
                </label>
              ))}

              <div className="form-actions">
                <Button type="button" onClick={handleFeatureSave} disabled={isFeatureSaving}>
                  {isFeatureSaving ? 'Saving...' : 'Save Feature Access'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="surface-panel">
        {status && <StatusMessage type="error" message={status} />}
        {isLoading && <StatusMessage message="Loading staff..." />}
        {!isLoading && !status && staff.length === 0 && (
          <StatusMessage type="empty" message="No staff accounts found." />
        )}

        {!isLoading && !status && staff.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <strong>{member.fullName}</strong>
                    </td>
                    <td>{member.email}</td>
                    <td>
                      <span className="metric-pill">{member.role}</span>
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="table-actions">
                          <Button variant="outline" onClick={() => handleEdit(member)}>
                            Edit
                          </Button>
                          <Button variant="danger" onClick={() => handleDelete(member.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default StaffPage
