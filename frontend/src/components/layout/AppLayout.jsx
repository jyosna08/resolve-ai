import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'

/** Shared authenticated page layout and state passed to nested screens. */
export default function AppLayout() {
  const [search, setSearch] = useState('')
  const [submitIssueOpen, setSubmitIssueOpen] = useState(false)
  function openSubmitIssue() { setSubmitIssueOpen(true) }
  return <div className="min-h-screen"><Navbar search={search} setSearch={setSearch} openSubmitIssue={openSubmitIssue} /><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><Outlet context={{ search, setSearch, openSubmitIssue }} /></main>{submitIssueOpen && null}</div>
}
