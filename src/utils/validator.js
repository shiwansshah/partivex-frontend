export function required(value) {
  return String(value || '').trim().length > 0
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

export function passwordsMatch(password, confirmPassword) {
  return password === confirmPassword
}
