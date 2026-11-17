import { useMemo } from 'react'
import { X } from 'lucide-react'
import Button from '@/components/common/Button.jsx'
import EmptyState from '@/components/common/EmptyState.jsx'
import Skeleton from '@/components/common/Skeleton.jsx'
import SlideOver from '@/components/common/SlideOver.jsx'
import useTicketComments from '@/hooks/useTicketComments.js'
import { formatDateTime } from '@/utils/formatters.js'
import { CUSTOMER_STATUS_LABELS } from '@/utils/ticketDisplay.js'
import { TICKET_STATUS } from '@/utils/constants.js'
import CustomerStatusBadge from './CustomerStatusBadge.jsx'

/** Customer-safe ticket details and public replies only. */
export default function CustomerTicketDrawer({ ticket, isOpen, onClose }) {
  const ticketId = ticket?.id ?? null
  const { comments, isLoading, error, reload } = useTicketComments(ticketId)
  const orderedComments = useMemo(() => [...comments].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)), [comments])
  if (!ticket) return null
  return <SlideOver isOpen={isOpen} onClose={onClose} title={ticket.title} ariaLabel={`Ticket ${ticket.id}: ${ticket.title}`}>
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4"><h2 className="pr-4 text-base font-semibold text-gray-900">{ticket.title}</h2><Button type="button" variant="ghost" size="sm" aria-label="Close ticket details" onClick={onClose}><X size={18} /></Button></header>
      <div className="flex-1 space-y-6 p-5">
        <section className="space-y-4" aria-label="Ticket details"><div className="flex items-center justify-between gap-3"><h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</h3><CustomerStatusBadge status={ticket.status} /></div><p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">{ticket.description}</p><p className="text-xs text-gray-500">Submitted {formatDateTime(ticket.createdAt)}</p>{ticket.status === TICKET_STATUS.RESOLVED && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">Resolved</p>}</section>
        <section aria-label="Replies" className="space-y-3"><h3 className="text-sm font-semibold text-gray-900">Replies</h3>{isLoading ? <div className="space-y-2" aria-label="Loading replies"><Skeleton className="h-16" /><Skeleton className="h-16" /></div> : error ? <div className="flex items-center justify-between gap-2 text-sm text-red-700"><p>{error}</p><Button type="button" variant="secondary" size="sm" onClick={reload}>Retry</Button></div> : orderedComments.length ? <ol className="space-y-3">{orderedComments.map((comment) => <li key={comment.id} className="rounded-lg border border-gray-200 bg-white p-3"><div className="flex items-center justify-between gap-2"><p className="text-sm font-medium text-gray-900">{comment.authorName}</p><time className="text-xs text-gray-500">{formatDateTime(comment.createdAt)}</time></div><p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-gray-700">{comment.message}</p></li>)}</ol> : <EmptyState title="No replies yet — our team is on it." message="We’ll share updates here as soon as we have them." className="rounded-lg border-0 bg-gray-50 px-4 py-8" />}</section>
      </div>
    </div>
  </SlideOver>
}
