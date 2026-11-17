import { TICKET_STATUS } from '@/utils/constants.js'
import { groupTicketsByStatus } from '@/utils/ticketSorting.js'
import { STATUS_COLUMNS } from '@/utils/ticketDisplay.js'
import KanbanColumn from './KanbanColumn.jsx'

/** Three-column board grouped and ordered by status. */
export default function KanbanBoard({ tickets = [], isLoading = false, selectedTicketId, onSelectTicket, onAddTicket }) {
  const groups = groupTicketsByStatus(tickets)
  return <section aria-label="Ticket board" className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">{STATUS_COLUMNS.map(({ status }) => <KanbanColumn key={status} status={status} tickets={groups[status]} isLoading={isLoading} selectedTicketId={selectedTicketId} onSelectTicket={onSelectTicket} onAddTicket={status === TICKET_STATUS.TO_DO ? onAddTicket : undefined} />)}</section>
}
