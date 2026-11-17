import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '@/components/common/Button.jsx'
import ErrorBanner from '@/components/common/ErrorBanner.jsx'
import FormField from '@/components/common/FormField.jsx'
import useAuth from '@/hooks/useAuth.js'
import { getErrorMessage } from '@/utils/errors.js'
import { validateLogin } from '@/utils/validators.js'
import { getHomePathForRole } from '@/utils/roleRoutes.js'
import { ROLES } from '@/utils/constants.js'

/** Validates credentials and signs the user in. */
export default function LoginForm() {
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateLogin(values)
    setErrors(nextErrors); setApiError('')
    if (Object.keys(nextErrors).length) { (nextErrors.email ? emailRef : passwordRef).current?.focus(); return }
    setLoading(true)
    try {
      const session = await login(values.email, values.password)
      const desired = location.state?.from?.pathname
      const allowed = desired === '/dashboard' && [ROLES.AGENT, ROLES.ADMIN].includes(session.role) || desired === '/my-tickets' && session.role === ROLES.CUSTOMER
      navigate(allowed ? desired : getHomePathForRole(session.role), { replace: true })
    } catch (error) {
      setApiError(error?.response?.status === 401 ? 'Invalid email or password.' : getErrorMessage(error))
    } finally { setLoading(false) }
  }

  return <form onSubmit={handleSubmit} noValidate className="space-y-4">
    {apiError && <ErrorBanner message={apiError} onDismiss={() => setApiError('')} />}
    <FormField id="login-email" label="Email" error={errors.email}><input ref={emailRef} type="email" autoComplete="email" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} /></FormField>
    <FormField id="login-password" label="Password" error={errors.password}><input ref={passwordRef} type="password" autoComplete="current-password" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} /></FormField>
    <Button type="submit" fullWidth loading={loading}>Log in</Button>
  </form>
}
