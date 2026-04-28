import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { getApiErrorMessage } from '../api/axiosInstance'
import AuthForm from '../components/forms/AuthForm'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { register } from '../services/authService'
import { isEmail, passwordsMatch, required } from '../utils/validator'

const initialValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function Register() {
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

    if (!required(values.name)) nextErrors.name = 'Name is required.'
    if (!required(values.email)) nextErrors.email = 'Email is required.'
    else if (!isEmail(values.email)) nextErrors.email = 'Enter a valid email.'
    if (!required(values.password)) nextErrors.password = 'Password is required.'
    if (!required(values.confirmPassword)) nextErrors.confirmPassword = 'Confirm your password.'
    else if (!passwordsMatch(values.password, values.confirmPassword)) {
      nextErrors.confirmPassword = 'Passwords must match.'
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
      await register(values.name, values.email, values.password)
      navigate('/login')
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Registration failed. Check the details and try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthForm
      title="Customer Registration"
      subtitle="Create a customer account for Partivex services."
      sidePanelTitle="Welcome To Partivex"
      sidePanelSubtitle="Join Partivex today and take control of your vehicle management."
      footer={
        <p>
          Already registered? <Link to="/login">Login</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Input
          id="name"
          label="Name"
          name="name"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
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
          label="Password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Input
          id="confirmPassword"
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />
        {status && <div className="form-alert">{status}</div>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Register'}
        </Button>
      </form>
    </AuthForm>
  )
}

export default Register
