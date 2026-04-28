import axios from 'axios'

const DEFAULT_API_BASE_URL = 'https://localhost:7000/api'
const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

export const apiBaseUrl = (envApiBaseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, '')

const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT token to every request if available
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function getRequestErrorMessage(error, fallbackMessage) {
  if (error?.code === 'ERR_NETWORK') {
    return `Cannot reach the API at ${apiBaseUrl}. Start the backend or set VITE_API_BASE_URL in your .env file.`
  }

  // Handle global exception middleware response format
  const data = error?.response?.data
  if (data?.message) {
    return data.message
  }

  // Handle ASP.NET validation problem details
  if (data?.errors && typeof data.errors === 'object') {
    const messages = Object.values(data.errors).flat()
    if (messages.length > 0) {
      return messages.join(' ')
    }
  }

  return fallbackMessage
}

export default axiosClient
