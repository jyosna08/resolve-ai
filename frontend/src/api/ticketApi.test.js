import { beforeEach, describe, expect, it, vi } from 'vitest'
import axiosClient from './axiosClient.js'
import { getDashboardStats, getTicketComments, getTickets, updateTicketStatus, verifyReply } from './ticketApi.js'

describe('ticketApi', () => {
  const requests = []
  beforeEach(() => {
    requests.length = 0
    axiosClient.defaults.adapter = async (config) => {
      requests.push(config)
      return { status: 200, data: { ok: true }, headers: {}, config }
    }
  })
  it('sends only non-empty ticket filters and forwards cancellation', async () => {
    const controller = new AbortController()
    await getTickets({ search: ' payment ', status: '', priority: null }, { signal: controller.signal })
    expect(requests[0].url).toBe('/api/tickets')
    expect(requests[0].params).toEqual({ search: ' payment ' })
    expect(requests[0].signal).toBe(controller.signal)
  })
  it('calls stats, comments, status, and reply endpoints and returns response data', async () => {
    await getDashboardStats(); await getTicketComments(8); await updateTicketStatus(8, 'IN_PROGRESS'); await verifyReply(8, 'Reply text')
    expect(requests.map(({ url, method, data }) => [url, method, data])).toEqual([
      ['/api/tickets/dashboard-stats', 'get', undefined], ['/api/tickets/8/comments', 'get', undefined], ['/api/tickets/8/status', 'patch', JSON.stringify({ status: 'IN_PROGRESS' })], ['/api/tickets/8/verify-reply', 'post', JSON.stringify({ replyMessage: 'Reply text' })],
    ])
  })
})
