export const ROLES = {
  ADMIN: 'Admin',
  STAFF: 'Staff',
  CUSTOMER: 'Customer',
}

const ROLE_ALIASES = {
  admin: ROLES.ADMIN,
  staff: ROLES.STAFF,
  customer: ROLES.CUSTOMER,
}

export function normalizeRole(value) {
  const role = Array.isArray(value) ? value[0] : value

  if (!role) return ''

  const normalizedValue = String(role).trim()
  return ROLE_ALIASES[normalizedValue.toLowerCase()] || normalizedValue
}

export function hasRole(role, allowedRoles = []) {
  const normalizedRole = normalizeRole(role)
  return allowedRoles.some((allowedRole) => normalizeRole(allowedRole) === normalizedRole)
}

export function getHomePathForRole(role) {
  switch (normalizeRole(role)) {
    case ROLES.ADMIN:
      return '/admin'
    case ROLES.STAFF:
      return '/customers'
    case ROLES.CUSTOMER:
      return '/dashboard'
    default:
      return '/dashboard'
  }
}
