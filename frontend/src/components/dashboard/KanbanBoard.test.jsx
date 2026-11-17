import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PRIORITY, TICKET_STATUS } from '@/utils/constants.js'
import KanbanBoard from './KanbanBoard.jsx'

const ticket = (id, status, priority = PRIORITY.MEDIUM) => ({ id, title: `Ticket ${id}`, status, priority, category: 'GENERAL', sentiment: 'NEUTRAL', createdAt: `2026-01-${String(id).padStart(2, '0')}T10:00:00` })

describe('KanbanBoard', () => {
  it('places tickets in the right columns and sorts priority order', () => {
    render(<KanbanBoard tickets={[ticket(1, TICKET_STATUS.TO_DO, PRIORITY.LOW), ticket(2, TICKET_STATUS.TO_DO, PRIORITY.CRITICAL), ticket(3, TICKET_STATUS.IN_PROGRESS)]} />)
    const todo = within(screen.getByRole('region', { name: 'TO DO tickets' }))
    expect(todo.getByText('2')).toBeInTheDocument()
    const cards = todo.getAllByRole('button').filter((button) => button.getAttribute('aria-label')?.startsWith('Open ticket'))
    expect(cards.map((button) => button.textContent)).toEqual([expect.stringContaining('Ticket 2'), expect.stringContaining('Ticket 1')])
    expect(within(screen.getByRole('region', { name: 'IN PROGRESS tickets' })).getByText('Ticket 3')).toBeInTheDocument()
  })
  it('shows empty and loading states', () => {
    const { rerender } = render(<KanbanBoard tickets={[]} />)
    expect(screen.getAllByText('No tickets here')).toHaveLength(3)
    rerender(<KanbanBoard tickets={[]} isLoading />)
    expect(screen.getAllByLabelText('Loading tickets')).toHaveLength(3)
  })
  it('truncates resolved cards and invokes the add-ticket callback', () => {
    const add = vi.fn()
    const resolved = Array.from({ length: 22 }, (_, index) => ticket(index + 1, TICKET_STATUS.RESOLVED))
    render(<KanbanBoard tickets={resolved} onAddTicket={add} />)
    expect(screen.getByText('Showing 20 of 22')).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'RESOLVED tickets' })).getAllByRole('button')).toHaveLength(20)
    fireEvent.click(screen.getByRole('button', { name: 'Add ticket' })); expect(add).toHaveBeenCalledOnce()
  })
})
