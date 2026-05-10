import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../api/axiosInstance'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { createCustomer } from '../../services/customerService'
import { isEmail, required } from '../../utils/validator'

const initialValues = {
  fullName: '',
  email: '',
  password: '',
}

function AddCustomer() {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

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
      })
      navigate('/customers')
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Unable to create customer.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-stack narrow-page">
      <div className="surface-panel">
        <div className="section-heading">
          <PageHeader title="Add Customer" subtitle="Create a customer account with portal access." />
          <Link className="button button-outline" to="/customers">
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
