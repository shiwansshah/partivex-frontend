import axiosInstance from '../api/axiosInstance'
import { CustomerDto, CustomerHistoryDto } from '../models/customerModels'

function normalizeCustomerCollection(data) {
  const records = Array.isArray(data)
    ? data
    : Array.isArray(data?.records)
      ? data.records
      : Array.isArray(data?.customers)
        ? data.customers
        : Array.isArray(data?.items)
          ? data.items
          : []

  return records.map(CustomerDto)
}

export async function getCustomers() {
  const response = await axiosInstance.get('/api/customers')
  return normalizeCustomerCollection(response.data)
}

export async function getCustomerById(id) {
  const response = await axiosInstance.get(`/api/customers/${id}`)
  return CustomerDto(response.data)
}

export async function getCustomerHistory(id) {
  const response = await axiosInstance.get(`/api/customers/${id}/history`)
  return CustomerHistoryDto(response.data)
}

export async function updateCustomer(id, customerData) {
  const response = await axiosInstance.put(`/api/customers/${id}`, customerData)
  return CustomerDto(response.data)
}

export async function searchCustomers(term) {
  const response = await axiosInstance.get('/api/customers/search', {
    params: { term },
  })

  return normalizeCustomerCollection(response.data)
}

export async function addCustomerHistory(id, historyData) {
  const response = await axiosInstance.post(`/api/customers/${id}/history`, historyData)
  return response.data
}

export async function getRegularCustomersReport() {
  const response = await axiosInstance.get('/api/customer-reports/regular')
  return normalizeCustomerCollection(response.data)
}

export async function getHighSpendersReport() {
  const response = await axiosInstance.get('/api/customer-reports/high-spenders')
  return normalizeCustomerCollection(response.data)
}

export async function getCreditCustomersReport() {
  const response = await axiosInstance.get('/api/customer-reports/credit')
  return normalizeCustomerCollection(response.data)
}

export async function createCustomer({ fullName, email, password }) {
  const response = await axiosInstance.post('/auth/create-customer', {
    fullName,
    email,
    password,
  })

  return response.data
}
