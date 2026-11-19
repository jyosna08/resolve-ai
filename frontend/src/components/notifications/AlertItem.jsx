import Badge from '@/components/common/Badge.jsx'
import Button from '@/components/common/Button.jsx'
import { ALERT_TYPE } from '@/utils/constants.js'
import { formatDateTime, formatRelativeTime } from '@/utils/formatters.js'
import { ALERT_TYPE_DISPLAY } from '@/utils/ticketDisplay.js'
import useSubmitGuard from '@/hooks/useSubmitGuard.js'

/** Single active alert with acknowledge and ticket navigation actions. */
export default function AlertItem({ alert, onAcknowledge, onViewTicket }) {
  const { isSubmitting, runOnce } = useSubmitGuard()
  const config = ALERT_TYPE_DISPLAY[alert.alertType] || ALERT_TYPE_DISPLAY[ALERT_TYPE.CRITICAL_ESCALATION]
  return <article className="border-b border-gray-100 px-4 py-3 last:border-0">
    <div className="flex items-start justify-between gap-2"><Badge className={config.className}>{config.label}</Badge><time title={formatDateTime(alert.createdAt)} className="shrink-0 text-xs text-gray-500">{formatRelativeTime(alert.createdAt)}</time></div>
    <h3 className="mt-2 text-sm font-semibold text-gray-900">{alert.ticketTitle}</h3><p className="mt-1 text-sm leading-5 text-gray-600">{alert.message}</p>
    <div className="mt-3 flex gap-2"><Button type="button" size="sm" variant="secondary" loading={isSubmitting} onClick={() => runOnce(() => onAcknowledge(alert.id))}>Acknowledge</Button><Button type="button" size="sm" variant="ghost" onClick={() => onViewTicket(alert.ticketId)}>View ticket</Button></div>
  </article>
}
