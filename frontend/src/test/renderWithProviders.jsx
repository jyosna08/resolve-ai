import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext.jsx'

export function renderWithProviders(ui, { initialEntries = ['/'], ...options } = {}) {
  return render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={initialEntries}><AuthProvider>{ui}</AuthProvider></MemoryRouter>, options)
}
