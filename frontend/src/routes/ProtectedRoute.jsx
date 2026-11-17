import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '@/hooks/useAuth.js'
import { getHomePathForRole } from '@/utils/roleRoutes.js'

/** Restricts nested routes to authenticated users with one of the allowed roles. */
export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  if (allowedRoles.length && !allowedRoles.includes(user?.role)) return <Navigate to={getHomePathForRole(user?.role)} replace />
  return children || <Outlet />
}
