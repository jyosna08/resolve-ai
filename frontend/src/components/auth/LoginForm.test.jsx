import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext.jsx'
import LoginForm from './LoginForm.jsx'
import { clearSession } from '@/utils/authStorage.js'
import { ROLES } from '@/utils/constants.js'

vi.mock('@/api/authApi.js', () => ({ login: vi.fn(), register: vi.fn() }))
import * as authApi from '@/api/authApi.js'

function Destination() { const location = useLocation(); return <p>At {location.pathname}</p> }
function renderLogin(initialEntries = ['/login']) {
  return render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={initialEntries}><AuthProvider><Routes><Route path="/login" element={<LoginForm />} /><Route path="/dashboard" element={<Destination />} /><Route path="/my-tickets" element={<Destination />} /></Routes></AuthProvider></MemoryRouter>)
}

describe('LoginForm', () => {
  beforeEach(() => { clearSession(); vi.clearAllMocks() })
  it('shows validation errors without calling the API', async () => {
    renderLogin(); fireEvent.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByText('Email is required.')).toBeInTheDocument(); expect(authApi.login).not.toHaveBeenCalled()
  })
  it('calls login with entered values and navigates by role', async () => {
    authApi.login.mockResolvedValue({ token: 'token', userId: 3, fullName: 'Alex Agent', role: ROLES.AGENT })
    renderLogin(); fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alex@example.com' } }); fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123' } }); fireEvent.click(screen.getByRole('button', { name: 'Log in' }))
    await waitFor(() => expect(screen.getByText('At /dashboard')).toBeInTheDocument())
    expect(authApi.login).toHaveBeenCalledWith({ email: 'alex@example.com', password: 'Password123' })
  })
  it('shows API authentication error', async () => {
    authApi.login.mockRejectedValue({ response: { status: 401, data: { message: 'Invalid email or password' } } })
    renderLogin(); fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } }); fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123' } }); fireEvent.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password')
  })
  it('uses an allowed return route after login', async () => {
    authApi.login.mockResolvedValue({ token: 'token', userId: 4, fullName: 'Kim Customer', role: ROLES.CUSTOMER })
    renderLogin([{ pathname: '/login', state: { from: { pathname: '/my-tickets' } } }]); fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'kim@example.com' } }); fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123' } }); fireEvent.click(screen.getByRole('button', { name: 'Log in' }))
    await waitFor(() => expect(screen.getByText('At /my-tickets')).toBeInTheDocument())
  })
})
