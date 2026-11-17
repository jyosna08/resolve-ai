import axios from 'axios'
import { getSession } from '@/utils/authStorage.js'

let unauthorizedHandler = null
const axiosClient = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', timeout: 30000 })

axiosClient.interceptors.request.use((config) => {
  const session = getSession()
  if (session?.token) config.headers.Authorization = `Bearer ${session.token}`
  return config
})

axiosClient.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401 && error.config?.skipAuthRedirect !== true) unauthorizedHandler?.()
  return Promise.reject(error)
})

export function setUnauthorizedHandler(handler) { unauthorizedHandler = typeof handler === 'function' ? handler : null }
export default axiosClient
