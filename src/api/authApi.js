import axiosClient from './axiosClient'

export const login = (data) =>
  axiosClient.post('/auth/login', data)

export const register = (data) => {
  const payload = {
    fullName: data.name,
    email: data.email,
    password: data.password,
    role: 'Customer',
  }

  return axiosClient.post('/auth/register', payload)
}

export const getProfile = () =>
  axiosClient.get('/customer/profile')