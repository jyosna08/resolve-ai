import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import TeamPage from './TeamPage.jsx'
import { createUser } from '@/api/userApi.js'
import { ROLES } from '@/utils/constants.js'

vi.mock('@/api/userApi.js', () => ({ createUser: vi.fn() }))

describe('TeamPage', () => {
  beforeEach(() => vi.clearAllMocks())
  it('composes team creation and a dismissible success notice', async () => {
    createUser.mockResolvedValue({ id: 9, fullName: 'Riley Agent', role: ROLES.AGENT })
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><TeamPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Team' })).toBeInTheDocument()
    expect(screen.getByText('Create agent and administrator accounts.')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Riley Agent' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'riley@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('Agent Riley Agent created. They can sign in with the email and password you set.')).toBeInTheDocument()
    await waitFor(() => expect(createUser).toHaveBeenCalledOnce())
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notice' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
