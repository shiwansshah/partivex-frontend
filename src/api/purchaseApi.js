import axiosClient from './axiosClient'

export const getPurchaseInvoices = () => axiosClient.get('/purchases')

export const getPurchaseInvoice = (id) => axiosClient.get(`/purchases/${id}`)

export const createPurchaseInvoice = (data) => axiosClient.post('/purchases', data)

export const confirmPurchaseInvoice = (id) => axiosClient.post(`/purchases/${id}/confirm`)

export const deletePurchaseInvoice = (id) => axiosClient.delete(`/purchases/${id}`)
