import axiosInstance from '../api/axiosInstance'
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/authModels'
import { removeToken, setToken } from '../utils/tokenStorage'

export async function login(email, password) {
  const response = await axiosInstance.post('/api/auth/login', LoginRequest(email, password))
  const auth = AuthResponse(response.data)

  if (auth.token) {
    setToken(auth.token)
  }

  return auth
}

export async function register(fullName, email, password) {
  const response = await axiosInstance.post(
    '/api/auth/register',
    RegisterRequest(fullName, email, password),
  )

  return AuthResponse(response.data)
}

export function logout() {
  removeToken()
}
