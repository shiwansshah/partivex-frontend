import axiosInstance from '../api/axiosInstance'
import { CustomerDto } from '../models/customerModels'

export async function getCustomers() {
  const response = await axiosInstance.get('/api/customers')
  return response.data.map(CustomerDto)
}

export async function getCustomerById(id) {
  const response = await axiosInstance.get(`/api/customers/${id}`)
  return CustomerDto(response.data)
}
