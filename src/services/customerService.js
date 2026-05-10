import axiosInstance from '../api/axiosInstance'
import { CustomerDto, CustomerHistoryDto } from '../models/customerModels'

export async function getCustomers() {
  const response = await axiosInstance.get('/api/customers')
  return response.data.map(CustomerDto)
}

export async function getCustomerById(id) {
  const response = await axiosInstance.get(`/api/customers/${id}`)
  return CustomerDto(response.data)
}

export async function getCustomerHistory(id) {
  const response = await axiosInstance.get(`/api/customers/${id}/history`)
  return CustomerHistoryDto(response.data)
}

export async function createCustomer({ fullName, email, password }) {
  const response = await axiosInstance.post('/auth/create-customer', {
    fullName,
    email,
    password,
  })

  return response.data
}
