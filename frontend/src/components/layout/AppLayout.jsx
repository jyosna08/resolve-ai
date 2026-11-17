import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import NoticeBanner from '@/components/common/NoticeBanner.jsx'
import SubmitIssueModal from '@/components/tickets/SubmitIssueModal.jsx'
import { CATEGORY, ROLES } from '@/utils/constants.js'
import { CATEGORY_LABELS } from '@/utils/ticketDisplay.js'
import useAuth from '@/hooks/useAuth.js'
import Navbar from './Navbar.jsx'

/** Shared authenticated page layout and state passed to nested screens. */
export default function AppLayout() {
  const [search, setSearch] = useState('')
  const [submitIssueOpen, setSubmitIssueOpen] = useState(false)
  const [ticketsVersion, setTicketsVersion] = useState(0)
  const [notice, setNotice] = useState(null)
  const { user } = useAuth()
  function openSubmitIssue() { setSubmitIssueOpen(true) }
  function handleCreated(ticket) {
    setTicketsVersion((version) => version + 1)
    if (user?.role === ROLES.CUSTOMER) setNotice(`Ticket #${ticket.id} submitted. Our team will review it shortly.`)
    else {
      const category = CATEGORY_LABELS[ticket.category] || CATEGORY_LABELS[CATEGORY.GENERAL]
      setNotice(`Ticket #${ticket.id} submitted. AI set priority ${ticket.priority} in ${category}.`)
    }
    setSubmitIssueOpen(false)
  }
  return <div className="min-h-screen"><Navbar search={search} setSearch={setSearch} openSubmitIssue={openSubmitIssue} /><main className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">{notice && <NoticeBanner message={notice} onDismiss={() => setNotice(null)} />}<Outlet context={{ search, setSearch, openSubmitIssue, ticketsVersion }} /></main><SubmitIssueModal isOpen={submitIssueOpen} onClose={() => setSubmitIssueOpen(false)} onCreated={handleCreated} /></div>
}
