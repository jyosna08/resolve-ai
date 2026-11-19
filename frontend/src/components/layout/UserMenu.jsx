import { Link, useNavigate } from 'react-router-dom'
import Badge from '@/components/common/Badge.jsx'
import Button from '@/components/common/Button.jsx'
import useAuth from '@/hooks/useAuth.js'
import { ADMIN_TEAM_PATH, ROLES } from '@/utils/constants.js'

/** Displays the signed-in user and a logout action. */
export default function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = (user?.fullName || '?').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  function handleLogout() { logout(); navigate('/login', { replace: true }) }
  return <div className="flex items-center gap-2 sm:gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700" aria-label={`${user?.fullName || 'User'} avatar`}>{initials}</div><div className="hidden min-w-0 sm:block"><p className="max-w-32 truncate text-sm font-medium text-gray-900">{user?.fullName}</p><Badge>{user?.role}</Badge></div>{user?.role === ROLES.ADMIN && <Link to={ADMIN_TEAM_PATH} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Team</Link>}<Button variant="ghost" size="sm" onClick={handleLogout}>Log out</Button></div>
}
