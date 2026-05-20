import axiosInstance from './axiosInstance'

export const getAdminDashboardSummary = () =>
  axiosInstance.get('/api/admin/dashboard/summary')
