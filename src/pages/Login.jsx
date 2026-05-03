import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { getApiErrorMessage } from '../api/axiosInstance'
import AuthForm from '../components/forms/AuthForm'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import useAuth from '../hooks/useAuth'
import { getHomePathForRole } from '../utils/roles'
import { isEmail, required } from '../utils/validator'

const initialValues = {
  email: '',
  password: '',
}

function Login() {
  const navigate = useNavigate()
  const { getCurrentUser, login } = useAuth()
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
      await login(values.email, values.password)

      const authenticatedUser = getCurrentUser()
      navigate(getHomePathForRole(authenticatedUser?.role), { replace: true })
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Invalid email or password.'))
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
