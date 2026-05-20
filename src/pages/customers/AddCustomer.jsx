import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../api/axiosInstance'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { createCustomer } from '../../services/customerService'
import { buildPanelPath } from '../../utils/panelRoutes'
import { isEmail, required } from '../../utils/validator'

const initialValues = {
  fullName: '',
  email: '',
  password: '',
}

function AddCustomer() {
  const location = useLocation()
  const navigate = useNavigate()
  const customersPath = buildPanelPath(location.pathname, '/customers')
  const profileImageInputRef = useRef(null)
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileImageFile, setProfileImageFile] = useState(null)
  const [profileImagePreview, setProfileImagePreview] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null

    setProfileImageFile(file)
    setProfileImagePreview((current) => {
      if (current?.startsWith('blob:')) {
        URL.revokeObjectURL(current)
      }

      return file ? URL.createObjectURL(file) : ''
    })
  }

  useEffect(() => {
    return () => {
      if (profileImagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(profileImagePreview)
      }
    }
  }, [profileImagePreview])

  function validate() {
    const nextErrors = {}

    if (!required(values.fullName)) nextErrors.fullName = 'Full name is required.'
    if (!required(values.email)) nextErrors.email = 'Email is required.'
    else if (!isEmail(values.email)) nextErrors.email = 'Enter a valid email.'
    if (!required(values.password)) nextErrors.password = 'Password is required.'
    else if (values.password.length < 6) nextErrors.password = 'Password must be at least 6 characters.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('')

    if (!validate()) return

    try {
      setIsSubmitting(true)
      await createCustomer({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
        profileImage: profileImageFile,
      })
      navigate(customersPath)
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Unable to create customer.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCancelImage() {
    setProfileImageFile(null)
    setProfileImagePreview((current) => {
      if (current?.startsWith('blob:')) {
        URL.revokeObjectURL(current)
      }

      return ''
    })
  }

  function renderImageUpload() {
    return (
      <div className="customer-form-group">
        <label htmlFor="profileImage">Customer profile picture</label>
        <div className="image-upload-area">
          {profileImagePreview && (
            <div className="image-preview">
              <img src={profileImagePreview} alt="Customer profile preview" />
            </div>
          )}
          <input
            ref={profileImageInputRef}
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />
          <button
            type="button"
            className="image-upload-btn"
            onClick={() => profileImageInputRef.current?.click()}
          >
            {profileImagePreview ? 'Re-upload Picture' : 'Upload Picture'}
          </button>
          {profileImageFile && (
            <button type="button" className="btn-outline" onClick={handleCancelImage}>
              Remove Picture
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <section className="page-stack narrow-page">
      <div className="surface-panel">
        <div className="section-heading">
          <PageHeader title="Add Customer" subtitle="Create a customer account with portal access." />
          <Link className="button button-outline" to={customersPath}>
            Cancel
          </Link>
        </div>

        <form className="managed-form" onSubmit={handleSubmit} noValidate>
          <Input
            id="fullName"
            label="Full name"
            name="fullName"
            value={values.fullName}
            onChange={handleChange}
            error={errors.fullName}
          />
          <Input
            id="email"
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
          />
          <Input
            id="password"
            label="Temporary password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
          />

          {renderImageUpload()}

          {status && <div className="form-alert">{status}</div>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Customer'}
          </Button>
        </form>
      </div>
    </section>
  )
}

export default AddCustomer
