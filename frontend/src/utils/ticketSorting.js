import { PRIORITY_RANK, TICKET_STATUS } from './constants.js'

export function sortTicketsForBoard(tickets = []) {
  return [...tickets].sort((left, right) => {
    const rankDifference = (PRIORITY_RANK[left.priority] ?? Number.MAX_SAFE_INTEGER) - (PRIORITY_RANK[right.priority] ?? Number.MAX_SAFE_INTEGER)
    if (rankDifference) return rankDifference
    return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
  })
}

export function groupTicketsByStatus(tickets = []) {
  const groups = { [TICKET_STATUS.TO_DO]: [], [TICKET_STATUS.IN_PROGRESS]: [], [TICKET_STATUS.RESOLVED]: [] }
  for (const ticket of tickets) if (Object.hasOwn(groups, ticket.status)) groups[ticket.status].push(ticket)
  for (const status of Object.keys(groups)) groups[status] = sortTicketsForBoard(groups[status])
  return groups
}
