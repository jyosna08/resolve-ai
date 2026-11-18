import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./axiosClient.js', () => ({ default: { post: vi.fn() } }))
import axiosClient from './axiosClient.js'
import { register } from './authApi.js'

describe('authApi.register', () => {
  beforeEach(() => { vi.clearAllMocks(); axiosClient.post.mockResolvedValue({ data: { id: 1 } }) })

  it('sends only the public customer registration fields', async () => {
    await register({ fullName: 'Casey Customer', email: 'casey@example.com', password: 'Password123', role: 'ADMIN', department: 'BILLING' })
    expect(axiosClient.post).toHaveBeenCalledWith('/api/auth/register', {
      fullName: 'Casey Customer', email: 'casey@example.com', password: 'Password123',
    }, { skipAuthRedirect: true })
  })
})
