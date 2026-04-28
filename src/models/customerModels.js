export function CustomerDto(data = {}) {
  return {
    id: data.id ?? data.customerId ?? null,
    fullName: data.fullName ?? data.name ?? '',
    email: data.email ?? '',
  }
}
