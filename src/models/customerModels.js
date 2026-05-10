export function CustomerDto(data = {}) {
  return {
    id: data.id ?? data.customerId ?? null,
    fullName: data.fullName ?? data.name ?? '',
    email: data.email ?? '',
    phoneNumber: data.phoneNumber ?? data.phone ?? '',
    vehicles: Array.isArray(data.vehicles) ? data.vehicles : [],
  }
}

export function CustomerHistoryDto(data = {}) {
  return {
    customerId: data.customerId ?? '',
    records: Array.isArray(data.records) ? data.records : [],
  }
}
