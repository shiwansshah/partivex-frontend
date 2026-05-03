export function VehicleDto(data = {}) {
  const name = data.name ?? data.model ?? ''
  const number = data.number ?? data.vehicleNumber ?? ''

  return {
    id: data.id ?? data.vehicleId ?? null,
    customerId: data.customerId ?? '',
    name,
    number,
    imageUrl: data.imageUrl ?? null,
    model: name,
    vehicleNumber: number,
  }
}

export function CreateVehicleDto(data = {}) {
  return {
    customerId: data.customerId ?? '',
    name: data.name ?? data.model ?? '',
    number: data.number ?? data.vehicleNumber ?? '',
  }
}

export function UpdateVehicleDto(data = {}) {
  return {
    name: data.name ?? data.model ?? '',
    number: data.number ?? data.vehicleNumber ?? '',
  }
}
