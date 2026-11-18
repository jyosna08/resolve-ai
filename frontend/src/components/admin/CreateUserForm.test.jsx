import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CreateUserForm from './CreateUserForm.jsx'
import { createUser } from '@/api/userApi.js'
import { DEPARTMENTS, ROLES } from '@/utils/constants.js'

vi.mock('@/api/userApi.js', () => ({ createUser: vi.fn() }))

function fill() {
  fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Riley Agent' } })
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'riley@example.com' } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123' } })
}

describe('CreateUserForm', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('shows department only for agents', () => {
    render(<CreateUserForm />)
    expect(screen.getByLabelText('Department')).toHaveValue(DEPARTMENTS.TECHNICAL)
    fireEvent.click(screen.getByRole('radio', { name: 'Admin' }))
    expect(screen.queryByLabelText('Department')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: 'Agent' }))
    expect(screen.getByLabelText('Department')).toHaveValue(DEPARTMENTS.TECHNICAL)
  })

  it('validates invalid fields and focuses the first one without calling the API', () => {
    render(<CreateUserForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByText('Full name is required.')).toBeInTheDocument()
    expect(screen.getByLabelText('Full name')).toHaveFocus()
    expect(createUser).not.toHaveBeenCalled()
  })

  it('creates an agent with department and resets the form on success', async () => {
    const user = { id: 4, fullName: 'Riley Agent', role: ROLES.AGENT }
    createUser.mockResolvedValue(user)
    const onCreated = vi.fn()
    render(<CreateUserForm onCreated={onCreated} />)
    fill(); fireEvent.change(screen.getByLabelText('Department'), { target: { value: DEPARTMENTS.BILLING } })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    await waitFor(() => expect(createUser).toHaveBeenCalledWith({ fullName: 'Riley Agent', email: 'riley@example.com', password: 'Password123', role: ROLES.AGENT, department: DEPARTMENTS.BILLING }))
    expect(onCreated).toHaveBeenCalledWith(user)
    expect(screen.getByLabelText('Full name')).toHaveValue('')
    expect(screen.getByLabelText('Email')).toHaveValue('')
    expect(screen.getByLabelText('Department')).toHaveValue(DEPARTMENTS.TECHNICAL)
    expect(screen.getByRole('radio', { name: 'Agent' })).toHaveAttribute('aria-checked', 'true')
  })

  it('creates an admin without a department', async () => {
    createUser.mockResolvedValue({ id: 5, fullName: 'Riley Agent', role: ROLES.ADMIN })
    render(<CreateUserForm />)
    fill(); fireEvent.click(screen.getByRole('radio', { name: 'Admin' })); fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    await waitFor(() => expect(createUser).toHaveBeenCalledWith({ fullName: 'Riley Agent', email: 'riley@example.com', password: 'Password123', role: ROLES.ADMIN }))
  })

  it('shows duplicate email errors under the email field', async () => {
    createUser.mockRejectedValue({ response: { status: 409, data: {} } })
    render(<CreateUserForm />); fill(); fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('An account with this email already exists.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows a forbidden response message in the banner', async () => {
    createUser.mockRejectedValue({ response: { status: 403, data: { message: 'Access denied by administrator policy.' } } })
    render(<CreateUserForm />); fill(); fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Access denied by administrator policy.')
  })

  it('ignores a rapid second submit while creation is pending', () => {
    createUser.mockReturnValue(new Promise(() => {}))
    render(<CreateUserForm />); fill()
    const button = screen.getByRole('button', { name: 'Create account' })
    act(() => { fireEvent.click(button); fireEvent.click(button) })
    expect(createUser).toHaveBeenCalledOnce()
    expect(button).toBeDisabled()
  })
})
