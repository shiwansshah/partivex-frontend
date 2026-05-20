import axiosInstance from './axiosInstance'

export const getStaffFeatureAccess = (userId) =>
  axiosInstance.get(`/api/admin/users/${userId}/feature-access`)

export const updateStaffFeatureAccess = (userId, enabledFeatureKeys) =>
  axiosInstance.put(`/api/admin/users/${userId}/feature-access`, { enabledFeatureKeys })

export const getMyStaffFeatureAccess = () =>
  axiosInstance.get('/api/staff/me/feature-access')
