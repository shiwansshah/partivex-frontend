const STORAGE_KEY = 'partivexVehicleImages'

function readVehicleImages() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

function writeVehicleImages(images) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images))
}

function getFallbackKey(customerId, vehicleNumber) {
  return `customer-${customerId}-vehicle-${String(vehicleNumber || '').toLowerCase()}`
}

export function saveVehicleImage({ vehicleId, customerId, vehicleNumber, imageDataUrl, imageName }) {
  if (!imageDataUrl) {
    return
  }

  const images = readVehicleImages()
  const key = vehicleId ? `vehicle-${vehicleId}` : getFallbackKey(customerId, vehicleNumber)

  images[key] = {
    imageDataUrl,
    imageName: imageName || 'Vehicle image',
  }

  writeVehicleImages(images)
}

export function getVehicleImage(vehicle, customerId) {
  const images = readVehicleImages()

  if (vehicle?.id && images[`vehicle-${vehicle.id}`]) {
    return images[`vehicle-${vehicle.id}`]
  }

  return images[getFallbackKey(customerId, vehicle?.vehicleNumber)] || null
}
