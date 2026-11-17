import { Link } from 'react-router-dom'
import useAuth from '@/hooks/useAuth.js'
import { getHomePathForRole } from '@/utils/roleRoutes.js'

export default function NotFoundPage() {
  const { user, isAuthenticated } = useAuth()
  const home = isAuthenticated ? getHomePathForRole(user?.role) : '/login'
  return <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center"><p className="text-sm font-semibold text-brand-600">404</p><h1 className="mt-2 text-3xl font-bold">Page not found</h1><p className="mt-3 text-gray-600">The page you’re looking for doesn’t exist.</p><Link to={home} className="mt-6 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600">Back to home</Link></main>
}
