import axios from 'axios'

const DEFAULT_API_BASE_URL = 'https://localhost:7000/api'
console.log('BASE URL:', import.meta.env.VITE_API_BASE_URL)
const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

export const apiBaseUrl = (envApiBaseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, '')

const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function getRequestErrorMessage(error, fallbackMessage) {
  if (error?.code === 'ERR_NETWORK') {
    return `Cannot reach the API at ${apiBaseUrl}. Start the backend or set VITE_API_BASE_URL in your .env file.`
  }

  return error?.response?.data?.message || fallbackMessage
}

export default axiosClient
