import axiosClient from './axiosClient'

export const getCustomers = () => axiosClient.get('/customers')

export const getCustomerById = (id) => axiosClient.get(`/customers/${id}`)

export const createCustomer = (customerData) =>
  axiosClient.post('/customers', customerData)

export const updateCustomer = (id, customerData) =>
  axiosClient.put(`/customers/${id}`, customerData)

export const deleteCustomer = (id) => axiosClient.delete(`/customers/${id}`)

export const searchCustomers = (searchTerm) =>
  axiosClient.get('/customers/search', {
    params: { searchTerm },
  })

export const getCustomerVehicles = (customerId) =>
  axiosClient.get(`/customers/${customerId}/vehicles`)

export const addCustomerVehicle = (customerId, vehicleData) =>
  axiosClient.post(`/customers/${customerId}/vehicles`, vehicleData)

export const updateVehicle = (vehicleId, vehicleData) =>
  axiosClient.put(`/vehicles/${vehicleId}`, vehicleData)

export const deleteVehicle = (vehicleId) =>
  axiosClient.delete(`/vehicles/${vehicleId}`)

export const getCustomerHistory = (customerId) =>
  axiosClient.get(`/customers/${customerId}/history`)

export const addCustomerHistory = (customerId, historyData) =>
  axiosClient.post(`/customers/${customerId}/history`, historyData)

export const getRegularCustomersReport = () =>
  axiosClient.get('/customers/reports/regular')

export const getHighSpendersReport = () =>
  axiosClient.get('/customers/reports/high-spenders')

export const getCreditCustomersReport = () =>
  axiosClient.get('/customers/reports/credit')
