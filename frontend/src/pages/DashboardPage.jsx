import { useCallback, useEffect, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import ErrorBanner from '@/components/common/ErrorBanner.jsx'
import AiCoPilotDrawer from '@/components/copilot/AiCoPilotDrawer.jsx'
import KanbanBoard from '@/components/dashboard/KanbanBoard.jsx'
import KpiSummaryBar from '@/components/dashboard/KpiSummaryBar.jsx'
import { REFRESH_INTERVAL_MS } from '@/utils/constants.js'
import useDashboardStats from '@/hooks/useDashboardStats.js'
import usePolling from '@/hooks/usePolling.js'
import useTickets from '@/hooks/useTickets.js'

export default function DashboardPage() {
  const { search, openSubmitIssue, ticketsVersion = 0 } = useOutletContext()
  const [searchParams, setSearchParams] = useSearchParams()
  const { tickets, isLoading: ticketsLoading, error: ticketsError, refresh: refreshTickets, replaceTicket } = useTickets(search, ticketsVersion)
  const { stats, isLoading: statsLoading, error: statsError, refresh: refreshStats } = useDashboardStats()
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [errorDismissed, setErrorDismissed] = useState(false)

  usePolling(refreshTickets, REFRESH_INTERVAL_MS)
  usePolling(refreshStats, REFRESH_INTERVAL_MS)

  useEffect(() => {
    setSelectedTicket((selected) => {
      if (!selected) return selected
      return tickets.find((ticket) => ticket.id === selected.id) || selected
    })
  }, [tickets])
  useEffect(() => {
    const ticketId = searchParams.get('ticket')
    if (!ticketId || ticketsLoading) return
    const ticket = tickets.find((item) => String(item.id) === ticketId)
    if (!ticket) return
    setSelectedTicket(ticket)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('ticket')
    setSearchParams(nextParams, { replace: true })
  }, [tickets, ticketsLoading, searchParams, setSearchParams])
  useEffect(() => { setErrorDismissed(false) }, [ticketsError, statsError])

  const handleTicketUpdated = useCallback((updatedTicket) => {
    replaceTicket(updatedTicket)
    setSelectedTicket(updatedTicket)
    refreshStats()
  }, [replaceTicket, refreshStats])
  const refreshAll = useCallback(() => { refreshTickets(); refreshStats(); setErrorDismissed(false) }, [refreshTickets, refreshStats])
  const errorMessage = ticketsError || statsError

  return <div className="space-y-6">
    <header><p className="text-sm font-medium text-brand-600">Agent workspace</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1></header>
    <KpiSummaryBar stats={stats} isLoading={statsLoading} />
    {errorMessage && !errorDismissed && <ErrorBanner message={errorMessage} onDismiss={() => setErrorDismissed(true)} onRetry={refreshAll} />}
    <KanbanBoard tickets={tickets} isLoading={ticketsLoading} selectedTicketId={selectedTicket?.id} onSelectTicket={setSelectedTicket} onAddTicket={() => openSubmitIssue?.()} />
    <AiCoPilotDrawer ticket={selectedTicket} isOpen={Boolean(selectedTicket)} onClose={() => setSelectedTicket(null)} onTicketUpdated={handleTicketUpdated} onRefresh={refreshAll} />
  </div>
}
