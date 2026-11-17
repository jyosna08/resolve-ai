import { beforeEach, describe, expect, it, vi } from 'vitest'
import axiosClient, { setUnauthorizedHandler } from './axiosClient.js'
import { clearSession, saveSession } from '@/utils/authStorage.js'

describe('axiosClient', () => {
  beforeEach(() => { clearSession(); setUnauthorizedHandler(null) })
  async function send(status = 200, config = {}) {
    axiosClient.defaults.adapter = async (request) => {
      if (status >= 400) { const error = new Error('request failed'); error.config = request; error.response = { status, data: {}, config: request }; throw error }
      return { status, data: request, headers: {}, config: request }
    }
    try { return await axiosClient.get('/test', config) } catch (error) { return error }
  }
  it('attaches Authorization when a session exists', async () => {
    saveSession({ token: 'secret-token' })
    const response = await send()
    expect(response.data.headers.Authorization).toBe('Bearer secret-token')
  })
  it('does not attach Authorization without a session', async () => {
    const response = await send()
    expect(response.data.headers.Authorization).toBeUndefined()
  })
  it('calls the handler on 401 and skips it for login/register requests', async () => {
    const handler = vi.fn(); setUnauthorizedHandler(handler)
    await send(401); expect(handler).toHaveBeenCalledTimes(1)
    await send(401, { skipAuthRedirect: true }); expect(handler).toHaveBeenCalledTimes(1)
  })
})
