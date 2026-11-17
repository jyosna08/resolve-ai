import { useRef } from 'react'
import { Sparkles, X } from 'lucide-react'
import Button from '@/components/common/Button.jsx'
import { TICKET_STATUS } from '@/utils/constants.js'
import AiSummarySection from './AiSummarySection.jsx'
import CommentsList from './CommentsList.jsx'
import DraftReplyEditor from './DraftReplyEditor.jsx'
import StatusActions from './StatusActions.jsx'
import TicketDetailsSection from './TicketDetailsSection.jsx'

/** Stateful drawer content, keyed by ticket to reset the reply draft between tickets. */
export default function TicketCopilotContent({ ticket, onClose, onTicketUpdated, onRefresh }) {
  const reloadComments = useRef(null)
  return <div className="flex min-h-full flex-col">
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-violet-200 bg-white px-5 py-4"><div className="flex items-center gap-2.5"><span className="rounded-lg bg-violet-100 p-2 text-violet-700"><Sparkles size={18} aria-hidden="true" /></span><h2 className="font-semibold text-gray-900">AI Co-Pilot Triage</h2></div><Button variant="ghost" size="sm" aria-label="Close AI Co-Pilot" onClick={onClose}><X size={18} /></Button></header>
    <div className="flex-1 space-y-5 p-5"><TicketDetailsSection ticket={ticket} /><AiSummarySection ticket={ticket} /><StatusActions ticket={ticket} onTicketUpdated={onTicketUpdated} /><DraftReplyEditor ticket={ticket} onTicketUpdated={onTicketUpdated} onRefresh={onRefresh} reloadComments={() => reloadComments.current?.()} />{ticket.status === TICKET_STATUS.RESOLVED && <CommentsList ticketId={ticket.id} onReloadReady={(reload) => { reloadComments.current = reload }} />}</div>
  </div>
}
