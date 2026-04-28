import axiosClient from './axiosClient'

export const getMyVehicles = () =>
  axiosClient.get('/vehicles/my')

export const addVehicle = (formData) =>
  axiosClient.post('/vehicles', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const updateVehicle = (id, formData) =>
  axiosClient.put(`/vehicles/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
