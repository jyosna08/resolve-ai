import axiosClient from './axiosClient.js'

export async function register(payload) {
  const { fullName, email, password } = payload
  const response = await axiosClient.post('/api/auth/register', { fullName, email, password }, { skipAuthRedirect: true })
  return response.data
}

export async function login(credentials) {
  const response = await axiosClient.post('/api/auth/login', credentials, { skipAuthRedirect: true })
  return response.data
}
