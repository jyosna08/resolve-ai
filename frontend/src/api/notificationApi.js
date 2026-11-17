import axiosClient from './axiosClient.js'

export async function getAlerts({ signal } = {}) {
  const response = await axiosClient.get('/api/notifications/alerts', { signal })
  return response.data
}

export async function acknowledgeAlert(id) {
  const response = await axiosClient.patch(`/api/notifications/alerts/${id}/acknowledge`)
  return response.data
}
