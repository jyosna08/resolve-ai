import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./axiosClient.js', () => ({ default: { post: vi.fn() } }))
import axiosClient from './axiosClient.js'
import { createUser } from './userApi.js'
import { DEPARTMENTS, ROLES } from '@/utils/constants.js'

describe('userApi.createUser', () => {
  beforeEach(() => { vi.clearAllMocks(); axiosClient.post.mockResolvedValue({ data: { id: 1 } }) })

  it('sends department for an agent and returns response data', async () => {
    const user = await createUser({ fullName: 'Agent', email: 'agent@example.com', password: 'Password123', role: ROLES.AGENT, department: DEPARTMENTS.BILLING })
    expect(axiosClient.post).toHaveBeenCalledWith('/api/users', { fullName: 'Agent', email: 'agent@example.com', password: 'Password123', role: ROLES.AGENT, department: DEPARTMENTS.BILLING })
    expect(user).toEqual({ id: 1 })
  })

  it('omits department for an admin', async () => {
    await createUser({ fullName: 'Admin', email: 'admin@example.com', password: 'Password123', role: ROLES.ADMIN, department: DEPARTMENTS.TECHNICAL })
    expect(axiosClient.post).toHaveBeenCalledWith('/api/users', { fullName: 'Admin', email: 'admin@example.com', password: 'Password123', role: ROLES.ADMIN })
  })
})
