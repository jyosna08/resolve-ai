import { Bell } from 'lucide-react'
import Button from '@/components/common/Button.jsx'
import EmptyState from '@/components/common/EmptyState.jsx'
import Skeleton from '@/components/common/Skeleton.jsx'
import AlertItem from './AlertItem.jsx'

/** Notification dropdown contents for loading, empty, alert, and error states. */
export default function AlertList({ alerts, isLoading, error, onRetry, onAcknowledge, onViewTicket }) {
  if (isLoading) return <div aria-label="Loading alerts" className="space-y-3 p-4">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-28 rounded-lg" />)}</div>
  return <div className="max-h-[min(70vh,32rem)] overflow-y-auto">
    {error && <div role="alert" className="flex items-center justify-between gap-3 border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800"><p>{error}</p><Button type="button" size="sm" variant="secondary" onClick={onRetry}>Retry</Button></div>}
    {alerts.length ? alerts.map((alert) => <AlertItem key={alert.id} alert={alert} onAcknowledge={onAcknowledge} onViewTicket={onViewTicket} />) : <EmptyState icon={Bell} title="No active alerts" message="You’re all caught up." className="rounded-none border-0 px-4 py-8" />}
  </div>
}
