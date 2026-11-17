import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '@/hooks/useAuth.js'
import { getHomePathForRole } from '@/utils/roleRoutes.js'

/** Redirects authenticated users away from login and registration. */
export default function PublicOnlyRoute({ children }) {
  const { isAuthenticated, user } = useAuth()
  if (isAuthenticated) return <Navigate to={getHomePathForRole(user?.role)} replace />
  return children || <Outlet />
}
