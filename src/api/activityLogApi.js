import axiosClient from './axiosClient'

export const getActivityLogs = (params = {}) =>
  axiosClient.get('/admin/activity-logs', { params })
