import axiosClient from './axiosClient'

export const getStaffAppointments = () =>
  axiosClient.get('/appointment-invoices/appointments')

export const getAppointmentInvoices = () =>
  axiosClient.get('/appointment-invoices')

export const createAppointmentInvoice = (data) =>
  axiosClient.post('/appointment-invoices', data)

export const updateAppointmentInvoicePaymentStatus = (id, paymentStatus) =>
  axiosClient.patch(`/appointment-invoices/${id}/payment-status`, { paymentStatus })

export const sendAppointmentInvoiceEmail = (id) =>
  axiosClient.post(`/appointment-invoices/${id}/email`)

export const sendOverdueAppointmentInvoiceReminders = () =>
  axiosClient.post('/appointment-invoices/overdue-reminders')

export const downloadAppointmentInvoicePdf = (id) =>
  axiosClient.get(`/appointment-invoices/${id}/pdf`, { responseType: 'blob' })

export const getMyAppointmentInvoices = () =>
  axiosClient.get('/customer/appointment-invoices')

export const payMyAppointmentInvoice = (id) =>
  axiosClient.patch(`/customer/appointment-invoices/${id}/pay`)

export const downloadMyAppointmentInvoicePdf = (id) =>
  axiosClient.get(`/customer/appointment-invoices/${id}/pdf`, { responseType: 'blob' })

export const getSmtpSetting = () =>
  axiosClient.get('/smtp-settings')

export const updateSmtpSetting = (senderEmail) =>
  axiosClient.put('/smtp-settings', { senderEmail })
