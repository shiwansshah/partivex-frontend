import axiosInstance from '../api/axiosInstance'
import { VehicleDto } from '../models/vehicleModels'

function isFormData(value) {
  return typeof FormData !== 'undefined' && value instanceof FormData
}

function appendVehicleField(formData, key, value) {
  if (value === undefined || value === null || value === '') return
  formData.append(key, value)
}

function toVehicleFormData(data = {}) {
  if (isFormData(data)) {
    return data
  }

  const formData = new FormData()
  appendVehicleField(formData, 'customerId', data.customerId)
  appendVehicleField(formData, 'name', data.name ?? data.model)
  appendVehicleField(formData, 'number', data.number ?? data.vehicleNumber)

  if (data.imageFile) {
    formData.append('image', data.imageFile)
  } else if (data.image instanceof File) {
    formData.append('image', data.image)
  }

  return formData
}

export async function createVehicle(data) {
  const payload = toVehicleFormData(data)
  const customerId = isFormData(data) ? data.get('customerId') : data.customerId
  const response = await axiosInstance.post(`/customers/${customerId}/vehicles`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return VehicleDto(response.data)
}

export async function getVehiclesByCustomer(customerId) {
  const response = await axiosInstance.get(`/customers/${customerId}/vehicles`)
  const data = response.data
  const records = Array.isArray(data)
    ? data
    : Array.isArray(data?.records)
      ? data.records
      : Array.isArray(data?.vehicles)
        ? data.vehicles
        : Array.isArray(data?.items)
          ? data.items
          : []

  return records.map(VehicleDto)
}

export async function updateVehicle(id, data) {
  const payload = toVehicleFormData(data)
  const response = await axiosInstance.put(`/vehicles/${id}`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return VehicleDto(response.data)
}

export async function deleteVehicle(id) {
  await axiosInstance.delete(`/vehicles/${id}`)
}
