export function CustomerDto(data = {}) {
  return {
    id: data.id ?? data.customerId ?? null,
    fullName: data.fullName ?? data.name ?? '',
    email: data.email ?? '',
    phoneNumber: data.phoneNumber ?? data.phone ?? '',
    address: data.address ?? '',
    profileImageUrl: data.profileImageUrl ?? data.imageUrl ?? null,
    vehicles: Array.isArray(data.vehicles) ? data.vehicles : [],
  }
}

export function CustomerHistoryDto(data = {}) {
  const records = Array.isArray(data)
    ? data
    : Array.isArray(data.records)
      ? data.records
      : Array.isArray(data.history)
        ? data.history
        : []

  return {
    customerId: data.customerId ?? '',
    records,
  }
}
