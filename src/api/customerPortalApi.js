import axiosClient from './axiosClient'

export const getAppointmentServiceOptions = () =>
  axiosClient.get('/customer/appointments/service-options')

export const getAppointments = () =>
  axiosClient.get('/customer/appointments')

export const getAppointment = (id) =>
  axiosClient.get(`/customer/appointments/${id}`)

export const createAppointment = (data) =>
  axiosClient.post('/customer/appointments', data)

export const cancelAppointment = (id) =>
  axiosClient.patch(`/customer/appointments/${id}/cancel`)

export const getPartRequests = () =>
  axiosClient.get('/customer/part-requests')

export const getPartRequest = (id) =>
  axiosClient.get(`/customer/part-requests/${id}`)

export const createPartRequest = (data) =>
  axiosClient.post('/customer/part-requests', data)

export const cancelPartRequest = (id) =>
  axiosClient.patch(`/customer/part-requests/${id}/cancel`)

export const getReviews = () =>
  axiosClient.get('/customer/reviews')

export const getReview = (id) =>
  axiosClient.get(`/customer/reviews/${id}`)

export const createReview = (data) =>
  axiosClient.post('/customer/reviews', data)

export const updateReview = (id, data) =>
  axiosClient.put(`/customer/reviews/${id}`, data)

export const deleteReview = (id) =>
  axiosClient.delete(`/customer/reviews/${id}`)
