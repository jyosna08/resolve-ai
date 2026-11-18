import { describe, expect, it } from 'vitest'
import { PRIORITY, TICKET_STATUS } from './constants.js'
import { groupTicketsByStatus, sortTicketsForBoard, sortTicketsNewestFirst } from './ticketSorting.js'

const make = (id, priority, status, createdAt) => ({ id, priority, status, createdAt })

describe('ticket sorting', () => {
  it('sorts by priority rank and newest within a priority', () => {
    const tickets = [make(1, PRIORITY.LOW, TICKET_STATUS.TO_DO, '2026-01-01'), make(2, PRIORITY.CRITICAL, TICKET_STATUS.TO_DO, '2026-01-01'), make(3, PRIORITY.CRITICAL, TICKET_STATUS.TO_DO, '2026-02-01')]
    expect(sortTicketsForBoard(tickets).map((ticket) => ticket.id)).toEqual([3, 2, 1])
  })
  it('groups and sorts known statuses and ignores unknown ones', () => {
    const tickets = [make(1, PRIORITY.LOW, TICKET_STATUS.TO_DO), make(2, PRIORITY.CRITICAL, TICKET_STATUS.TO_DO), make(3, PRIORITY.HIGH, TICKET_STATUS.IN_PROGRESS), make(4, PRIORITY.HIGH, 'UNKNOWN')]
    const groups = groupTicketsByStatus(tickets)
    expect(groups[TICKET_STATUS.TO_DO].map((ticket) => ticket.id)).toEqual([2, 1])
    expect(groups[TICKET_STATUS.IN_PROGRESS].map((ticket) => ticket.id)).toEqual([3])
    expect(groups[TICKET_STATUS.RESOLVED]).toEqual([])
  })
  it('orders fractional seconds with different precisions by their actual time', () => {
    const tickets = [
      make(1, PRIORITY.MEDIUM, TICKET_STATUS.TO_DO, '2026-11-17T12:54:00.1'),
      make(2, PRIORITY.MEDIUM, TICKET_STATUS.TO_DO, '2026-11-17T12:54:00.123456'),
      make(3, PRIORITY.MEDIUM, TICKET_STATUS.TO_DO, '2026-11-17T12:54:00.123'),
    ]
    expect(sortTicketsForBoard(tickets).map((ticket) => ticket.id)).toEqual([2, 3, 1])
    expect(sortTicketsNewestFirst(tickets).map((ticket) => ticket.id)).toEqual([2, 3, 1])
  })
})
