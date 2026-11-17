import { useState } from 'react'
import Button from '@/components/common/Button.jsx'
import Logo from '@/components/common/Logo.jsx'
import useAuth from '@/hooks/useAuth.js'
import { ROLES } from '@/utils/constants.js'
import NotificationBell from '@/components/notifications/NotificationBell.jsx'
import NavbarSearch from './NavbarSearch.jsx'
import UserMenu from './UserMenu.jsx'

/** Responsive workspace navigation with role-specific search and alerts. */
export default function Navbar({ search, setSearch, openSubmitIssue }) {
  const { user } = useAuth()
  const [query, setQuery] = useState(search)
  const canSearch = user?.role === ROLES.AGENT || user?.role === ROLES.ADMIN
  return <header className="border-b border-gray-200 bg-white"><nav aria-label="Main navigation" className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
    <div className="flex w-full items-center justify-between sm:w-auto"><Logo /><div className="sm:hidden"><UserMenu /></div></div>
    {canSearch && <div className="order-3 w-full sm:order-none sm:mx-4 sm:flex sm:flex-1 sm:justify-center"><NavbarSearch value={query} onChange={(value) => { setQuery(value); setSearch(value) }} /></div>}
    <div className="flex w-full items-center justify-end gap-2 sm:w-auto"><Button onClick={openSubmitIssue} size="sm">Submit Issue</Button>{canSearch && <NotificationBell />}<div className="hidden sm:block"><UserMenu /></div></div>
  </nav></header>
}
