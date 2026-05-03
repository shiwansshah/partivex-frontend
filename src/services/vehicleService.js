import axiosInstance from '../api/axiosInstance'
import { CreateVehicleDto, UpdateVehicleDto, VehicleDto } from '../models/vehicleModels'

export async function createVehicle(data) {
  const response = await axiosInstance.post('/api/vehicles', CreateVehicleDto(data))
  return VehicleDto(response.data)
}

export async function getVehiclesByCustomer(customerId) {
  const response = await axiosInstance.get(`/api/vehicles/customer/${customerId}`)
  return response.data.map(VehicleDto)
}

export async function updateVehicle(id, data) {
  const response = await axiosInstance.put(`/api/vehicles/${id}`, UpdateVehicleDto(data))
  return VehicleDto(response.data)
}

export async function deleteVehicle(id) {
  await axiosInstance.delete(`/api/vehicles/${id}`)
}
