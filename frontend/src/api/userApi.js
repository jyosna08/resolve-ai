import axiosClient from './axiosClient.js'
import { ROLES } from '@/utils/constants.js'

export async function createUser({ fullName, email, password, role, department }) {
  const body = { fullName, email, password, role }
  if (role === ROLES.AGENT) body.department = department
  const response = await axiosClient.post('/api/users', body)
  return response.data
}
