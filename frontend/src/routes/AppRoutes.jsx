import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout.jsx'
import LoginPage from '@/pages/LoginPage.jsx'
import RegisterPage from '@/pages/RegisterPage.jsx'
import DashboardPage from '@/pages/DashboardPage.jsx'
import MyTicketsPage from '@/pages/MyTicketsPage.jsx'
import NotFoundPage from '@/pages/NotFoundPage.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import PublicOnlyRoute from './PublicOnlyRoute.jsx'
import useAuth from '@/hooks/useAuth.js'
import { ROLES } from '@/utils/constants.js'
import { getHomePathForRole } from '@/utils/roleRoutes.js'

function HomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={getHomePathForRole(user?.role)} replace />
}

export default function AppRoutes() {
  return <Routes>
    <Route element={<PublicOnlyRoute />}><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /></Route>
    <Route element={<ProtectedRoute />}><Route element={<AppLayout />}>
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={[ROLES.AGENT, ROLES.ADMIN]}><DashboardPage /></ProtectedRoute>} />
      <Route path="/my-tickets" element={<ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}><MyTicketsPage /></ProtectedRoute>} />
    </Route></Route>
    <Route path="/" element={<HomeRedirect />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
}
