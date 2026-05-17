export function formatDate(value) {
  if (!value) return 'Not set'

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function formatTime(value) {
  if (!value) return 'Not set'

  const [hour, minute] = String(value).split(':')
  const date = new Date()
  date.setHours(Number(hour), Number(minute), 0, 0)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatDateTime(value) {
  if (!value) return 'Not set'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}
