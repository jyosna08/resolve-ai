import { Plus } from 'lucide-react'
import Button from '@/components/common/Button.jsx'
import EmptyState from '@/components/common/EmptyState.jsx'
import Skeleton from '@/components/common/Skeleton.jsx'
import { MAX_RESOLVED_VISIBLE, TICKET_STATUS } from '@/utils/constants.js'
import { STATUS_COLUMNS } from '@/utils/ticketDisplay.js'
import TicketCard from './TicketCard.jsx'

/** Renders one ticket status lane, including loading, empty, and capped states. */
export default function KanbanColumn({ status, tickets = [], isLoading = false, selectedTicketId, onSelectTicket, headerAction, onAddTicket }) {
  const config = STATUS_COLUMNS.find((column) => column.status === status) || STATUS_COLUMNS[0]
  const visibleTickets = status === TICKET_STATUS.RESOLVED ? tickets.slice(0, MAX_RESOLVED_VISIBLE) : tickets
  const Icon = config.icon
  return <section aria-label={`${config.label} tickets`} className="min-w-0 rounded-xl bg-gray-100 p-3 sm:p-4">
    <header className="mb-4 flex min-h-9 items-center justify-between gap-2"><div className="flex items-center gap-2"><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide ${config.pillClassName}`}>{Icon && <Icon size={13} aria-hidden="true" />}{config.label}</span><span className="text-sm font-medium text-gray-500" aria-label={`${tickets.length} tickets`}>{tickets.length}</span></div>
      <div className="flex items-center gap-1">{headerAction}{status === TICKET_STATUS.TO_DO && <Button variant="ghost" size="sm" onClick={onAddTicket} aria-label="Add ticket"><Plus size={16} />Add Ticket</Button>}</div>
    </header>
    {isLoading ? <div className="space-y-3" aria-label="Loading tickets">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-28 rounded-lg" />)}</div> : tickets.length === 0 ? <EmptyState title="No tickets here" message="Tickets in this status will appear here." className="rounded-lg border-0 bg-transparent px-2 py-8" /> : <div className="space-y-3">{visibleTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} isSelected={selectedTicketId === ticket.id} onSelect={onSelectTicket} />)}{status === TICKET_STATUS.RESOLVED && tickets.length > MAX_RESOLVED_VISIBLE && <p className="px-1 pt-1 text-center text-xs text-gray-500">Showing {MAX_RESOLVED_VISIBLE} of {tickets.length}</p>}</div>}
  </section>
}
