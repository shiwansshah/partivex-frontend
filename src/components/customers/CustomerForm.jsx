import { useState } from 'react'
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
  const [formData, setFormData] = useState({ ...emptyCustomer, ...initialValues })
  const [errors, setErrors] = useState({})

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

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
      email: formData.email.trim(),
      address: formData.address.trim(),
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

      <div className="form-actions">
        <Button type="submit" className="customer-submit-button" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default CustomerForm
