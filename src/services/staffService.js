import axiosInstance from '../api/axiosInstance'
import {
  getStaffFeatureAccess,
  updateStaffFeatureAccess,
} from '../api/staffFeatureAccessApi'

export function StaffDto(data = {}) {
  return {
    id: data.id ?? null,
    fullName: data.fullName ?? data.name ?? '',
    email: data.email ?? '',
    role: data.role ?? 'Staff',
  }
}

export async function getStaff() {
  const response = await axiosInstance.get('/api/staff')
  return response.data.map(StaffDto)
}

export async function createStaff({ fullName, email, password, featureKeys = [] }) {
  const response = await axiosInstance.post('/api/staff', {
    fullName,
    email,
    password,
    featureKeys,
  })

  return StaffDto(response.data)
}

export async function updateStaff(id, { fullName }) {
  await axiosInstance.put(`/api/staff/${id}`, { fullName })
}

export async function deleteStaff(id) {
  await axiosInstance.delete(`/api/staff/${id}`)
}

export async function getStaffAccess(id) {
  const response = await getStaffFeatureAccess(id)
  return response.data
}

export async function updateStaffAccess(id, enabledFeatureKeys) {
  const response = await updateStaffFeatureAccess(id, enabledFeatureKeys)
  return response.data
}
