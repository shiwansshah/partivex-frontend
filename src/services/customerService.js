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
  const hasProfileImage = customerData?.profileImage instanceof File

  if (hasProfileImage) {
    const formData = new FormData()
    formData.append('fullName', customerData.fullName)
    formData.append('phoneNumber', customerData.phoneNumber)
    formData.append('phone', customerData.phone ?? customerData.phoneNumber ?? '')
    formData.append('email', customerData.email ?? '')
    formData.append('address', customerData.address ?? '')
    formData.append('profileImage', customerData.profileImage)
    formData.append('image', customerData.profileImage)

    const response = await axiosInstance.put(`/api/customers/${id}`, formData)
    return CustomerDto(response.data)
  }

  const response = await axiosInstance.put(`/api/customers/${id}`, customerData)
  return CustomerDto(response.data)
}

export async function searchCustomers(term) {
  const response = await axiosInstance.get('/api/customers/search', {
    params: { searchTerm: term },
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

export async function createCustomer(customerData) {
  const { fullName, email, password, profileImage } = customerData

  if (profileImage instanceof File) {
    const formData = new FormData()
    formData.append('fullName', fullName)
    formData.append('email', email)
    formData.append('password', password)
    formData.append('profileImage', profileImage)
    formData.append('image', profileImage)

    const response = await axiosInstance.post('/auth/create-customer', formData)
    return response.data
  }

  const response = await axiosInstance.post('/auth/create-customer', {
    fullName,
    email,
    password,
  })

  return response.data
}
