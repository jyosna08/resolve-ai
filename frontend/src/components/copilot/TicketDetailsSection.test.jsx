import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CATEGORY, PRIORITY, TICKET_STATUS } from '@/utils/constants.js'
import { formatDateTime } from '@/utils/formatters.js'
import TicketDetailsSection from './TicketDetailsSection.jsx'

describe('TicketDetailsSection timestamps', () => {
  it('renders a zone-less API creation time as the corresponding UTC instant', () => {
    const createdAt = '2026-11-17T12:54:00'
    const expected = formatDateTime('2026-11-17T12:54:00Z')
    render(<TicketDetailsSection ticket={{
      title: 'Payment issue',
      description: 'Payments fail during checkout.',
      priority: PRIORITY.HIGH,
      category: CATEGORY.BILLING,
      status: TICKET_STATUS.TO_DO,
      assignedAgentName: 'Agent One',
      createdAt,
      slaDeadline: null,
    }} />)

    expect(within(screen.getByText('Created').parentElement).getByText(expected)).toBeInTheDocument()
  })
})
