import axiosClient from './axiosClient'

export const getPermissions = () => axiosClient.get('/admin/permissions')

export const getRolePermissions = (roleName) =>
  axiosClient.get(`/admin/roles/${roleName}/permissions`)

export const updateRolePermissions = (roleName, permissionIds) =>
  axiosClient.post(`/admin/roles/${roleName}/permissions`, { permissionIds })
