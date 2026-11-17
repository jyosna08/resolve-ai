import SlideOver from '@/components/common/SlideOver.jsx'
import TicketCopilotContent from './TicketCopilotContent.jsx'

/** Right-side AI triage panel keyed by ticket so the draft resets between tickets. */
export default function AiCoPilotDrawer({ ticket, isOpen, onClose, onTicketUpdated, onRefresh }) {
  if (!ticket) return null
  return <SlideOver isOpen={isOpen} onClose={onClose} title="AI Co-Pilot Triage" className="border-l-4 border-violet-300">
    <TicketCopilotContent key={ticket.id} ticket={ticket} onClose={onClose} onTicketUpdated={onTicketUpdated} onRefresh={onRefresh} />
  </SlideOver>
}
