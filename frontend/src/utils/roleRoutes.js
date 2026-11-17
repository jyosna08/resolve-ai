import { ROLES } from './constants.js'

export function getHomePathForRole(role) {
  if (role === ROLES.CUSTOMER) return '/my-tickets'
  if (role === ROLES.AGENT || role === ROLES.ADMIN) return '/dashboard'
  return '/login'
}
