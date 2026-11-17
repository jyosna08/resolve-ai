import { BellRing, CheckCircle2, CircleDot, Clock } from 'lucide-react'
import KpiCard from './KpiCard.jsx'

/** Four headline ticket metrics in the approved dashboard order. */
export default function KpiSummaryBar({ stats, isLoading }) {
  const cards = [
    { label: 'Total Open', value: stats?.totalOpen, icon: CircleDot, tone: 'blue' },
    { label: 'Critical Alerts', value: stats?.criticalAlerts, icon: BellRing, tone: 'red', highlighted: true },
    { label: 'Resolved Today', value: stats?.resolvedToday, icon: CheckCircle2, tone: 'green' },
    { label: 'SLA Warnings', value: stats?.slaWarnings, icon: Clock, tone: 'amber' },
  ]
  return <section aria-label="Ticket summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map((card) => <KpiCard key={card.label} {...card} isLoading={isLoading} />)}</section>
}
