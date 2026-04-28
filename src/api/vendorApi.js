import axiosClient from './axiosClient'

export const getVendors = () => axiosClient.get('/vendor')

export const getVendorById = (id) => axiosClient.get(`/vendor/${id}`)

export const createVendor = (vendorData) => axiosClient.post('/vendor', vendorData)

export const updateVendor = (id, vendorData) =>
  axiosClient.put(`/vendor/${id}`, vendorData)

export const deleteVendor = (id) => axiosClient.delete(`/vendor/${id}`)
