import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext.jsx'
import RegisterForm from './RegisterForm.jsx'
import { clearSession } from '@/utils/authStorage.js'
import { DEPARTMENTS, ROLES } from '@/utils/constants.js'

vi.mock('@/api/authApi.js', () => ({ login: vi.fn(), register: vi.fn() }))
import * as authApi from '@/api/authApi.js'

function renderRegister() { return render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AuthProvider><RegisterForm /></AuthProvider></MemoryRouter>) }
function fill() {
  fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Riley Agent' } })
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'riley@example.com' } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123' } })
}

describe('RegisterForm', () => {
  beforeEach(() => { clearSession(); vi.clearAllMocks() })
  it('shows department only for the Agent role', () => {
    renderRegister(); expect(screen.queryByLabelText('Department')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: 'Agent' })); expect(screen.getByLabelText('Department')).toBeInTheDocument()
  })
  it('shows duplicate email error for 409', async () => {
    authApi.register.mockRejectedValue({ response: { status: 409, data: {} } }); renderRegister(); fill(); fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('An account with this email already exists.')).toBeInTheDocument()
  })
  it('registers an agent with the selected department and auto logs in', async () => {
    authApi.register.mockResolvedValue({ id: 4 }); authApi.login.mockResolvedValue({ token: 'token', userId: 4, fullName: 'Riley Agent', role: ROLES.AGENT })
    renderRegister(); fill(); fireEvent.click(screen.getByRole('radio', { name: 'Agent' })); fireEvent.change(screen.getByLabelText('Department'), { target: { value: DEPARTMENTS.TECHNICAL } }); fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    await waitFor(() => expect(authApi.register).toHaveBeenCalledWith({ fullName: 'Riley Agent', email: 'riley@example.com', password: 'Password123', role: ROLES.AGENT, department: DEPARTMENTS.TECHNICAL }))
    expect(authApi.login).toHaveBeenCalledWith({ email: 'riley@example.com', password: 'Password123' })
  })
})
