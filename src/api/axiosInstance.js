import axios from 'axios'
import { getToken, removeToken } from '../utils/tokenStorage'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5204').replace(
  /\/+$/,
  '',
)

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      removeToken()

      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error, fallbackMessage = 'Something went wrong.') {
  const status = error?.response?.status
  const data = error?.response?.data

  if (data?.message) return data.message
  if (data?.title) return data.title
  if (typeof data === 'string') return data

  if (status === 400) return 'Validation failed. Check the details and try again.'
  if (status === 401) return 'Your session expired. Please login again.'
  if (status === 403) return 'Access denied.'
  if (status === 404) return 'The requested record was not found.'

  if (error?.code === 'ERR_NETWORK') {
    return `Cannot reach the API at ${API_BASE_URL}. Start the backend and try again.`
  }

  return fallbackMessage
}

export default axiosInstance
