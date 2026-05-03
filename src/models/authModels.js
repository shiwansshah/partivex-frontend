export function LoginRequest(email, password) {
  return {
    email,
    password,
  }
}

export function RegisterRequest(fullName, email, password) {
  return {
    fullName,
    email,
    password,
  }
}

export function AuthResponse(data = {}) {
  return {
    token: data.token || data.accessToken || data.jwt || '',
    user: data.user || null,
  }
}
