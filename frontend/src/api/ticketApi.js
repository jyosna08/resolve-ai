import axiosClient from './axiosClient.js'

export async function getTickets({ search, status, priority } = {}, { signal } = {}) {
  const params = Object.fromEntries(Object.entries({ search, status, priority }).filter(([, value]) => typeof value === 'string' && value.trim()))
  const response = await axiosClient.get('/api/tickets', { params, signal })
  return response.data
}

export async function getDashboardStats({ signal } = {}) {
  const response = await axiosClient.get('/api/tickets/dashboard-stats', { signal })
  return response.data
}

export async function getTicketComments(id, { signal } = {}) {
  const response = await axiosClient.get(`/api/tickets/${id}/comments`, { signal })
  return response.data
}

export async function updateTicketStatus(id, status) {
  const response = await axiosClient.patch(`/api/tickets/${id}/status`, { status })
  return response.data
}

export async function verifyReply(id, replyMessage) {
  const response = await axiosClient.post(`/api/tickets/${id}/verify-reply`, { replyMessage })
  return response.data
}

export async function createTicket({ title, description }) {
  const response = await axiosClient.post('/api/tickets', { title, description })
  return response.data
}
