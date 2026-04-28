import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import AuthForm from '../components/forms/AuthForm'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { login } from '../api/authApi'
import { getRequestErrorMessage } from '../api/axiosClient'
import { isEmail, required } from '../utils/validator'

const initialValues = {
  email: '',
  password: '',
}

function parseJwtPayload(token) {
  try {
    const base64 = token.split('.')[1]
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

function getRoleFromToken(token) {
  const payload = parseJwtPayload(token)
  if (!payload) return null

  // ASP.NET puts role in the "role" or ClaimTypes.Role claim
  const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    || payload['role']

  // Could be an array if multiple roles
  if (Array.isArray(role)) return role[0]
  return role
}

function Login() {
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

    if (!required(values.email)) nextErrors.email = 'Email is required.'
    else if (!isEmail(values.email)) nextErrors.email = 'Enter a valid email.'

    if (!required(values.password)) nextErrors.password = 'Password is required.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('')

    if (!validate()) return

    try {
      setIsSubmitting(true)
      const response = await login(values)
      const token = response.data.token

      // Store token for authenticated requests
      localStorage.setItem('token', token)

      // Redirect based on role
      const role = getRoleFromToken(token)

      if (role === 'Customer') {
        navigate('/customer/profile')
      } else {
        navigate('/admin')
      }
    } catch (error) {
      setStatus(getRequestErrorMessage(error, 'Invalid email or password.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthForm
      title="Login"
      sidePanelTitle="Welcome Back"
      sidePanelSubtitle="Sign in to continue managing your services and vehicles."
      footer={
        <p>
          New customer? <Link to="/register">Create an account</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
        {status && <div className="form-alert">{status}</div>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Login'}
        </Button>
      </form>
    </AuthForm>
  )
}

export default Login
