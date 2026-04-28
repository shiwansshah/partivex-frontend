export function VehicleDto(data = {}) {
  return {
    id: data.id ?? data.vehicleId ?? null,
    customerId: data.customerId ?? null,
    vehicleNumber: data.vehicleNumber ?? '',
    model: data.model ?? '',
  }
}

export function CreateVehicleDto(data = {}) {
  return {
    customerId: data.customerId ?? null,
    vehicleNumber: data.vehicleNumber ?? '',
    model: data.model ?? '',
  }
}

export function UpdateVehicleDto(data = {}) {
  return {
    vehicleNumber: data.vehicleNumber ?? '',
    model: data.model ?? '',
  }
}
