import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/common/Button.jsx'
import ErrorBanner from '@/components/common/ErrorBanner.jsx'
import FormField from '@/components/common/FormField.jsx'
import useAuth from '@/hooks/useAuth.js'
import useSubmitGuard from '@/hooks/useSubmitGuard.js'
import { ROLES } from '@/utils/constants.js'
import { getErrorMessage } from '@/utils/errors.js'
import { getHomePathForRole } from '@/utils/roleRoutes.js'
import { validateRegister } from '@/utils/validators.js'

/** Validates registration details and signs in the new account. */
export default function RegisterForm() {
  const [values, setValues] = useState({ fullName: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const { isSubmitting, runOnce } = useSubmitGuard()
  const refs = { fullName: useRef(null), email: useRef(null), password: useRef(null) }
  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateRegister(values)
    setErrors(nextErrors); setApiError('')
    const first = ['fullName', 'email', 'password'].find((field) => nextErrors[field])
    if (first) { refs[first]?.current?.focus(); return }
    await runOnce(async () => {
      try { await register(values); navigate(getHomePathForRole(ROLES.CUSTOMER), { replace: true }) }
      catch (error) {
        if (error?.response?.status === 409) setErrors((current) => ({ ...current, email: 'An account with this email already exists.' }))
        else setApiError(getErrorMessage(error))
      }
    })
  }

  return <form onSubmit={handleSubmit} noValidate className="space-y-4">
    {apiError && <ErrorBanner message={apiError} onDismiss={() => setApiError('')} />}
    <FormField id="register-name" label="Full name" error={errors.fullName}><input ref={refs.fullName} autoComplete="name" maxLength={100} value={values.fullName} onChange={(event) => setValues({ ...values, fullName: event.target.value })} /></FormField>
    <FormField id="register-email" label="Email" error={errors.email}><input ref={refs.email} type="email" autoComplete="email" maxLength={150} value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} /></FormField>
    <FormField id="register-password" label="Password" error={errors.password} hint="Use 8 to 100 characters."><input ref={refs.password} type="password" autoComplete="new-password" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} /></FormField>
    <Button type="submit" fullWidth loading={isSubmitting}>Create account</Button>
  </form>
}
