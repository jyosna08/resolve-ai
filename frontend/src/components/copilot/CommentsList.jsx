import { useMemo } from 'react'
import Badge from '@/components/common/Badge.jsx'
import Button from '@/components/common/Button.jsx'
import Skeleton from '@/components/common/Skeleton.jsx'
import useTicketComments from '@/hooks/useTicketComments.js'
import { formatDateTime } from '@/utils/formatters.js'

/** Chronological ticket comments with loading, retry, and empty states. */
export default function CommentsList({ ticketId, onReloadReady }) {
  const { comments, isLoading, error, reload } = useTicketComments(ticketId)
  const ordered = useMemo(() => [...comments].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)), [comments])
  onReloadReady?.(reload)
  return <section aria-label="Ticket comments" className="space-y-3"><h3 className="text-sm font-semibold text-gray-900">Comments</h3>
    {isLoading ? <div className="space-y-2" aria-label="Loading comments"><Skeleton className="h-16" /><Skeleton className="h-16" /></div> : error ? <div className="flex items-center justify-between gap-2 text-sm text-red-700"><p>{error}</p><Button variant="secondary" size="sm" onClick={reload}>Retry</Button></div> : ordered.length ? <ol className="space-y-3">{ordered.map((comment) => <li key={comment.id} className="rounded-lg border border-gray-200 bg-white p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium text-gray-900">{comment.authorName}</p><div className="flex items-center gap-2">{comment.aiVerified && <Badge className="bg-violet-100 text-violet-700">AI-verified</Badge>}<time className="text-xs text-gray-500">{formatDateTime(comment.createdAt)}</time></div></div><p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-gray-700">{comment.message}</p></li>)}</ol> : <p className="text-sm text-gray-500">No comments yet.</p>}
  </section>
}
