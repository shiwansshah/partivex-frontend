import { useEffect, useRef, useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { isEmail, required } from '../../utils/validator'

const emptyCustomer = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
}

function CustomerForm({
  initialValues = emptyCustomer,
  onSubmit,
  submitLabel = 'Save Customer',
  isSubmitting = false,
  serverError = '',
}) {
  const profileImageInputRef = useRef(null)
  const [formData, setFormData] = useState(() => ({
    ...emptyCustomer,
    ...initialValues,
    phone: initialValues.phone ?? initialValues.phoneNumber ?? '',
  }))
  const [errors, setErrors] = useState({})
  const [profileImageFile, setProfileImageFile] = useState(null)
  const [profileImagePreview, setProfileImagePreview] = useState(
    initialValues.profileImageUrl ?? initialValues.imageUrl ?? '',
  )

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null

    setProfileImageFile(file)
    setProfileImagePreview((current) => {
      if (current?.startsWith('blob:')) {
        URL.revokeObjectURL(current)
      }

      return file ? URL.createObjectURL(file) : (initialValues.profileImageUrl ?? initialValues.imageUrl ?? '')
    })
  }

  function handleRemoveImage() {
    setProfileImageFile(null)
    setProfileImagePreview((current) => {
      if (current?.startsWith('blob:')) {
        URL.revokeObjectURL(current)
      }

      return ''
    })

    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = ''
    }
  }

  useEffect(() => {
    return () => {
      if (profileImagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(profileImagePreview)
      }
    }
  }, [profileImagePreview])

  function validateForm() {
    const nextErrors = {}

    if (!required(formData.fullName)) {
      nextErrors.fullName = 'Full name is required.'
    }

    if (!required(formData.phone)) {
      nextErrors.phone = 'Phone number is required.'
    }

    if (formData.email && !isEmail(formData.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    onSubmit({
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      phoneNumber: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      profileImage: profileImageFile,
    })
  }

  return (
    <form className="form-card customer-form" onSubmit={handleSubmit}>
      {serverError && <div className="form-alert">{serverError}</div>}

      <div className="customer-form-note">
        <span>Required</span>
        <p>Full name and phone number are needed to create a customer record.</p>
      </div>

      <Input
        id="fullName"
        name="fullName"
        label="Full Name"
        value={formData.fullName}
        onChange={handleChange}
        error={errors.fullName}
      />

      <Input
        id="phone"
        name="phone"
        label="Phone"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
      />

      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />

      <Input
        id="address"
        name="address"
        label="Address"
        value={formData.address}
        onChange={handleChange}
      />

      <div className="customer-form-note">
        <span>Optional</span>
        <p>Add or update a customer profile picture.</p>
      </div>

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
          {profileImagePreview && (
            <button type="button" className="btn-outline" onClick={handleRemoveImage}>
              Remove Picture
            </button>
          )}
        </div>
      </div>

      <div className="form-actions">
        <Button type="submit" className="customer-submit-button" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default CustomerForm
