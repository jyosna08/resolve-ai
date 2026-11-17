import { useEffect, useMemo, useState } from 'react'
import { Inbox } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import Button from '@/components/common/Button.jsx'
import EmptyState from '@/components/common/EmptyState.jsx'
import ErrorBanner from '@/components/common/ErrorBanner.jsx'
import Skeleton from '@/components/common/Skeleton.jsx'
import CustomerTicketCard from '@/components/customer/CustomerTicketCard.jsx'
import CustomerTicketDrawer from '@/components/customer/CustomerTicketDrawer.jsx'
import StatusTabs from '@/components/customer/StatusTabs.jsx'
import usePolling from '@/hooks/usePolling.js'
import useTickets from '@/hooks/useTickets.js'
import { CUSTOMER_STATUS_TABS, REFRESH_INTERVAL_MS } from '@/utils/constants.js'
import { sortTicketsNewestFirst } from '@/utils/ticketSorting.js'

export default function MyTicketsPage() {
  const { openSubmitIssue, ticketsVersion = 0 } = useOutletContext()
  const { tickets, isLoading, error, refresh } = useTickets('', ticketsVersion)
  const [activeTab, setActiveTab] = useState(CUSTOMER_STATUS_TABS[0].key)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [errorDismissed, setErrorDismissed] = useState(false)
  usePolling(refresh, REFRESH_INTERVAL_MS)
  useEffect(() => { setErrorDismissed(false) }, [error])
  useEffect(() => {
    setSelectedTicket((current) => current ? tickets.find((ticket) => ticket.id === current.id) || current : null)
  }, [tickets])

  const counts = useMemo(() => Object.fromEntries(CUSTOMER_STATUS_TABS.map((tab) => [tab.key, tab.status ? tickets.filter((ticket) => ticket.status === tab.status).length : tickets.length])), [tickets])
  const visibleTickets = useMemo(() => sortTicketsNewestFirst(tickets.filter((ticket) => {
    const tab = CUSTOMER_STATUS_TABS.find((item) => item.key === activeTab)
    return !tab?.status || ticket.status === tab.status
  })), [tickets, activeTab])

  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-brand-600">Customer portal</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">My tickets</h1><p className="mt-1 text-sm text-gray-500">Track your submitted issues and team updates.</p></div><Button onClick={openSubmitIssue}>Submit Issue</Button></header>
    {error && !errorDismissed && <ErrorBanner message={error} onDismiss={() => setErrorDismissed(true)} onRetry={refresh} />}
    <StatusTabs value={activeTab} onChange={setActiveTab} counts={counts} />
    {isLoading ? <div id="customer-ticket-list" role="tabpanel" aria-labelledby={`customer-tab-${activeTab}`} className="grid gap-3 sm:grid-cols-2">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-28 rounded-xl" />)}</div> : tickets.length === 0 ? <EmptyState icon={Inbox} title="No tickets yet" message="When you submit an issue, you can follow its progress here." action={<Button onClick={openSubmitIssue}>Submit your first issue</Button>} /> : visibleTickets.length === 0 ? <EmptyState icon={Inbox} title="No tickets in this tab" message="Choose another status tab to see your tickets." className="py-9" /> : <div id="customer-ticket-list" role="tabpanel" aria-labelledby={`customer-tab-${activeTab}`} className="grid gap-3 sm:grid-cols-2">{visibleTickets.map((ticket) => <CustomerTicketCard key={ticket.id} ticket={ticket} onSelect={setSelectedTicket} />)}</div>}
    <CustomerTicketDrawer ticket={selectedTicket} isOpen={Boolean(selectedTicket)} onClose={() => setSelectedTicket(null)} />
  </div>
}
