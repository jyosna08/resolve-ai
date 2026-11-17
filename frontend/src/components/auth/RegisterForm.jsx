import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/common/Button.jsx'
import ErrorBanner from '@/components/common/ErrorBanner.jsx'
import FormField from '@/components/common/FormField.jsx'
import RoleSelector from './RoleSelector.jsx'
import useAuth from '@/hooks/useAuth.js'
import { DEPARTMENTS, ROLES } from '@/utils/constants.js'
import { getErrorMessage } from '@/utils/errors.js'
import { getHomePathForRole } from '@/utils/roleRoutes.js'
import { validateRegister } from '@/utils/validators.js'

/** Validates registration details and signs in the new account. */
export default function RegisterForm() {
  const [values, setValues] = useState({ fullName: '', email: '', password: '', role: ROLES.CUSTOMER, department: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const refs = { fullName: useRef(null), email: useRef(null), password: useRef(null) }
  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateRegister(values)
    setErrors(nextErrors); setApiError('')
    const first = ['fullName', 'email', 'password'].find((field) => nextErrors[field])
    if (first || nextErrors.department || nextErrors.role) { refs[first || 'fullName']?.current?.focus(); return }
    const payload = { ...values, department: values.role === ROLES.AGENT ? values.department : undefined }
    setLoading(true)
    try { await register(payload); navigate(getHomePathForRole(values.role), { replace: true }) }
    catch (error) {
      if (error?.response?.status === 409) setErrors((current) => ({ ...current, email: 'An account with this email already exists.' }))
      else setApiError(getErrorMessage(error))
    } finally { setLoading(false) }
  }

  return <form onSubmit={handleSubmit} noValidate className="space-y-4">
    {apiError && <ErrorBanner message={apiError} onDismiss={() => setApiError('')} />}
    <FormField id="register-name" label="Full name" error={errors.fullName}><input ref={refs.fullName} autoComplete="name" maxLength={100} value={values.fullName} onChange={(event) => setValues({ ...values, fullName: event.target.value })} /></FormField>
    <FormField id="register-email" label="Email" error={errors.email}><input ref={refs.email} type="email" autoComplete="email" maxLength={150} value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} /></FormField>
    <FormField id="register-password" label="Password" error={errors.password} hint="Use 8 to 100 characters."><input ref={refs.password} type="password" autoComplete="new-password" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} /></FormField>
    <RoleSelector value={values.role} onChange={(role) => setValues({ ...values, role, department: role === ROLES.AGENT ? values.department : '' })} error={errors.role} />
    {values.role === ROLES.AGENT && <FormField id="register-department" label="Department" error={errors.department}><select value={values.department} onChange={(event) => setValues({ ...values, department: event.target.value })}><option value="">Select a department</option>{Object.values(DEPARTMENTS).map((department) => <option key={department} value={department}>{department.charAt(0) + department.slice(1).toLowerCase()}</option>)}</select></FormField>}
    <Button type="submit" fullWidth loading={loading}>Create account</Button>
  </form>
}
