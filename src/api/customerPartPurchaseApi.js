import axiosClient from './axiosClient'

export const getCustomerPartCatalog = () => axiosClient.get('/customer/parts')

export const checkoutCustomerParts = (items) => axiosClient.post('/customer/parts/checkout', { items })

export const getMyCustomerPartInvoices = () => axiosClient.get('/customer/parts/invoices')

export const getCustomerPartPurchaseInvoices = () => axiosClient.get('/customer-part-purchase-invoices')

export const sendCustomerPartPurchaseInvoiceEmail = (id, email) =>
  axiosClient.post(`/customer-part-purchase-invoices/${id}/email`, { email })

export const downloadCustomerPartPurchaseInvoicePdf = (id) =>
  axiosClient.get(`/customer-part-purchase-invoices/${id}/pdf`, { responseType: 'blob' })

export const downloadMyCustomerPartInvoicePdf = (id) =>
  axiosClient.get(`/customer/parts/invoices/${id}/pdf`, { responseType: 'blob' })

export const getStaffPartRequests = () => axiosClient.get('/staff/part-requests')

export const approveStaffPartRequest = (id, data) =>
  axiosClient.post(`/staff/part-requests/${id}/approve`, data)
