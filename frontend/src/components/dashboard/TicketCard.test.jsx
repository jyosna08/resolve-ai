import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CATEGORY, PRIORITY, SENTIMENT, TICKET_STATUS } from '@/utils/constants.js'
import TicketCard from './TicketCard.jsx'

const ticket = { id: 42, title: 'Payment failure after checkout', status: TICKET_STATUS.TO_DO, priority: PRIORITY.CRITICAL, category: CATEGORY.BILLING, sentiment: SENTIMENT.FRUSTRATED, assignedAgentName: null }

describe('TicketCard', () => {
  it('shows title, badges, sentiment, and unassigned footer', () => {
    render(<TicketCard ticket={ticket} onSelect={() => {}} />)
    expect(screen.getByRole('button', { name: /Payment failure/ })).toBeInTheDocument()
    expect(screen.getByText(PRIORITY.CRITICAL)).toBeInTheDocument(); expect(screen.getByText('Billing')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Frustrated' })).toBeInTheDocument(); expect(screen.getByText('#42 · Unassigned')).toBeInTheDocument()
  })
  it('shows no emoji for neutral sentiment', () => {
    render(<TicketCard ticket={{ ...ticket, sentiment: SENTIMENT.NEUTRAL }} />)
    expect(screen.queryByRole('img', { name: 'Neutral' })).not.toBeInTheDocument()
  })
  it('selects on click, Enter, and Space and marks the selected card', async () => {
    const select = vi.fn(); const user = userEvent.setup()
    const { rerender } = render(<TicketCard ticket={ticket} onSelect={select} />)
    const card = screen.getByRole('button', { name: /Payment failure/ })
    await user.click(card); card.focus(); await user.keyboard('{Enter}'); card.focus(); await user.keyboard(' ')
    expect(select).toHaveBeenCalledTimes(3)
    rerender(<TicketCard ticket={ticket} isSelected onSelect={select} />)
    expect(screen.getByRole('button', { name: /Payment failure/ })).toHaveAttribute('aria-current', 'true')
  })
})
