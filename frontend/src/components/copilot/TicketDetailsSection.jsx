import { TICKET_STATUS } from '@/utils/constants.js'
import { formatDateTime, formatSlaStatus } from '@/utils/formatters.js'
import CategoryTag from '@/components/tickets/CategoryTag.jsx'
import PriorityBadge from '@/components/tickets/PriorityBadge.jsx'
import StatusBadge from '@/components/tickets/StatusBadge.jsx'

/** Ticket facts and local-time SLA status in the copilot drawer. */
export default function TicketDetailsSection({ ticket }) {
  const sla = formatSlaStatus(ticket.slaDeadline, ticket.status)
  return <section className="space-y-4" aria-label="Ticket details">
    <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Title</p><h3 className="mt-1 text-base font-semibold text-gray-900">{ticket.title}</h3></div>
    <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-700">{ticket.description}</p></div>
    <div className="flex flex-wrap items-center gap-2"><PriorityBadge priority={ticket.priority} /><CategoryTag category={ticket.category} /><StatusBadge status={ticket.status} /></div>
    <dl className="grid grid-cols-2 gap-3 border-y border-gray-100 py-3 text-sm"><div><dt className="text-xs text-gray-500">Assigned agent</dt><dd className="mt-1 font-medium text-gray-800">{ticket.assignedAgentName || 'Unassigned'}</dd></div><div><dt className="text-xs text-gray-500">Created</dt><dd className="mt-1 font-medium text-gray-800">{formatDateTime(ticket.createdAt)}</dd></div></dl>
    {sla && <p className={`text-sm font-medium ${sla.isOverdue ? 'text-red-700' : sla.isWarning ? 'text-amber-700' : 'text-gray-600'}`} aria-label={`SLA ${sla.text}`}>{sla.text}</p>}
    {ticket.status === TICKET_STATUS.RESOLVED && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-800">This ticket is resolved.</p>}
  </section>
}
