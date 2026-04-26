import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function login(data) {
  const response = await client.post('/login', data)
  return response.data
}

export async function register(data) {
  const payload = {
    fullName: data.name,
    email: data.email,
    password: data.password,
    role: 'Customer',
  }

  const response = await client.post('/register', payload)
  return response.data
}
