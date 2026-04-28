import { useMemo } from 'react'
import * as authService from '../services/authService'
import { normalizeRole } from '../utils/roles'
import { getToken } from '../utils/tokenStorage'

const ROLE_CLAIMS = [
  'role',
  'roles',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
]

const ID_CLAIMS = [
  'customerId',
  'CustomerId',
  'nameid',
  'sub',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
]

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
  return atob(padded)
}

function decodeJwt(token) {
  if (!token) return null

  try {
    const [, payload] = token.split('.')
    return JSON.parse(decodeBase64Url(payload))
  } catch {
    return null
  }
}

function getClaim(payload, claims) {
  return claims.map((claim) => payload?.[claim]).find((value) => value !== undefined && value !== null)
}

function getCurrentUser(token = getToken()) {
  const payload = decodeJwt(token)

  if (!payload) return null

  return {
    token,
    customerId: getClaim(payload, ID_CLAIMS),
    email: payload.email || payload.unique_name || '',
    fullName: payload.fullName || payload.name || '',
    role: normalizeRole(getClaim(payload, ROLE_CLAIMS)),
    claims: payload,
  }
}

export function useAuth() {
  const token = getToken()
  const user = useMemo(() => getCurrentUser(token), [token])

  return {
    user,
    token,
    isAuthenticated: Boolean(token),
    login: authService.login,
    logout: authService.logout,
    getCurrentUser,
  }
}

export default useAuth
