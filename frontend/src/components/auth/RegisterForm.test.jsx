import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext.jsx'
import RegisterForm from './RegisterForm.jsx'
import { clearSession } from '@/utils/authStorage.js'
import { ROLES } from '@/utils/constants.js'

vi.mock('@/api/authApi.js', () => ({ login: vi.fn(), register: vi.fn() }))
import * as authApi from '@/api/authApi.js'

function LocationView() { const location = useLocation(); return <output>{location.pathname}</output> }
function renderRegister() { return render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AuthProvider><Routes><Route path="*" element={<><RegisterForm /><LocationView /></>} /></Routes></AuthProvider></MemoryRouter>) }
function fill() {
  fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Riley Customer' } })
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'riley@example.com' } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123' } })
}

describe('RegisterForm', () => {
  beforeEach(() => { clearSession(); vi.clearAllMocks() })
  it('does not render role or department controls', () => {
    renderRegister()
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Department')).not.toBeInTheDocument()
  })
  it('shows duplicate email error for 409', async () => {
    authApi.register.mockRejectedValue({ response: { status: 409, data: {} } }); renderRegister(); fill(); fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('An account with this email already exists.')).toBeInTheDocument()
  })
  it('registers only customer fields, auto logs in, and navigates home', async () => {
    authApi.register.mockResolvedValue({ id: 4 }); authApi.login.mockResolvedValue({ token: 'token', userId: 4, fullName: 'Riley Customer', role: ROLES.CUSTOMER })
    renderRegister(); fill(); fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    await waitFor(() => expect(authApi.register).toHaveBeenCalledWith({ fullName: 'Riley Customer', email: 'riley@example.com', password: 'Password123' }))
    expect(authApi.login).toHaveBeenCalledWith({ email: 'riley@example.com', password: 'Password123' })
    expect(await screen.findByText('/my-tickets')).toBeInTheDocument()
  })
  it('ignores a rapid second submit while registration is pending', async () => {
    authApi.register.mockReturnValue(new Promise(() => {}))
    renderRegister(); fill()
    const button = screen.getByRole('button', { name: 'Create account' })
    act(() => { fireEvent.click(button); fireEvent.click(button) })
    expect(authApi.register).toHaveBeenCalledOnce()
    expect(button).toBeDisabled()
  })
})
