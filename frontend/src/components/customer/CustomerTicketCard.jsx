import { formatDateTime } from '@/utils/formatters.js'
import CustomerStatusBadge from './CustomerStatusBadge.jsx'

/** Customer-safe ticket summary button with only public ticket information. */
export default function CustomerTicketCard({ ticket, onSelect }) {
  return <button type="button" onClick={() => onSelect?.(ticket)} aria-label={`Open ticket ${ticket.title}`} className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-brand-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:p-5">
    <span className="flex flex-wrap items-start justify-between gap-3"><span className="line-clamp-2 text-base font-semibold text-gray-900">{ticket.title}</span><CustomerStatusBadge status={ticket.status} /></span>
    <span className="mt-4 flex items-center justify-between text-xs text-gray-500"><span>#{ticket.id}</span><time>{formatDateTime(ticket.createdAt)}</time></span>
  </button>
}
