import CategoryTag from '@/components/tickets/CategoryTag.jsx'
import PriorityBadge from '@/components/tickets/PriorityBadge.jsx'
import SentimentIcon from '@/components/tickets/SentimentIcon.jsx'

/** Keyboard-operable ticket summary button for a Kanban column. */
export default function TicketCard({ ticket, isSelected = false, onSelect }) {
  return <button type="button" onClick={() => onSelect?.(ticket)} aria-current={isSelected ? 'true' : undefined} aria-label={`Open ticket ${ticket.title}, ${ticket.priority || 'ticket'}`} className={`block w-full rounded-lg border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${isSelected ? 'border-brand-500 ring-2 ring-brand-100' : 'border-gray-200'}`}>
    <span className="line-clamp-2 block min-h-10 text-sm font-semibold leading-5 text-gray-900">{ticket.title}</span>
    <span className="mt-3 flex flex-wrap items-center gap-2"><PriorityBadge priority={ticket.priority} /><CategoryTag category={ticket.category} /><SentimentIcon sentiment={ticket.sentiment} hideWhenNeutral /></span>
    <span className="mt-4 block truncate text-xs text-gray-500">#{ticket.id} · {ticket.assignedAgentName || 'Unassigned'}</span>
  </button>
}
