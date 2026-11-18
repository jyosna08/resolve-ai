import { useRef, useState } from 'react'
import { createUser } from '@/api/userApi.js'
import Button from '@/components/common/Button.jsx'
import ErrorBanner from '@/components/common/ErrorBanner.jsx'
import FormField from '@/components/common/FormField.jsx'
import RoleSelector from '@/components/auth/RoleSelector.jsx'
import useSubmitGuard from '@/hooks/useSubmitGuard.js'
import { CREATABLE_ROLES, DEPARTMENTS, EMAIL_MAX_LENGTH, NAME_MAX_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, ROLES } from '@/utils/constants.js'
import { getErrorMessage } from '@/utils/errors.js'
import { validateCreateUser } from '@/utils/validators.js'

const fieldOrder = ['fullName', 'email', 'password', 'role', 'department']

function initialValues() {
  return { fullName: '', email: '', password: '', role: ROLES.AGENT, department: DEPARTMENTS.TECHNICAL }
}

/** Creates an agent or administrator from the admin team page. */
export default function CreateUserForm({ onCreated }) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const { isSubmitting, runOnce } = useSubmitGuard()
  const refs = { fullName: useRef(null), email: useRef(null), password: useRef(null), department: useRef(null), role: useRef(null) }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateCreateUser(values)
    setErrors(nextErrors)
    setApiError('')
    const first = fieldOrder.find((field) => nextErrors[field])
    if (first) {
      if (first === 'role') refs.role.current?.querySelector('[role="radio"]')?.focus()
      else refs[first].current?.focus()
      return
    }
    await runOnce(async () => {
      const payload = { fullName: values.fullName, email: values.email, password: values.password, role: values.role }
      if (values.role === ROLES.AGENT) payload.department = values.department
      try {
        const created = await createUser(payload)
        onCreated?.(created)
        setValues(initialValues())
        setErrors({})
      } catch (error) {
        if (error?.response?.status === 409) setErrors((current) => ({ ...current, email: 'An account with this email already exists.' }))
        else setApiError(getErrorMessage(error))
      }
    })
  }

  return <form onSubmit={handleSubmit} noValidate className="space-y-4">
    {apiError && <ErrorBanner message={apiError} onDismiss={() => setApiError('')} />}
    <FormField id="create-user-name" label="Full name" error={errors.fullName}><input ref={refs.fullName} autoComplete="name" maxLength={NAME_MAX_LENGTH} value={values.fullName} onChange={(event) => setValues((current) => ({ ...current, fullName: event.target.value }))} /></FormField>
    <FormField id="create-user-email" label="Email" error={errors.email}><input ref={refs.email} type="email" autoComplete="email" maxLength={EMAIL_MAX_LENGTH} value={values.email} onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))} /></FormField>
    <FormField id="create-user-password" label="Password" error={errors.password} hint={`Use ${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} characters.`}><input ref={refs.password} type="password" autoComplete="new-password" value={values.password} onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))} /></FormField>
    <div ref={refs.role}><RoleSelector value={values.role} roles={CREATABLE_ROLES} onChange={(role) => setValues((current) => ({ ...current, role, department: role === ROLES.AGENT ? (current.department || DEPARTMENTS.TECHNICAL) : '' }))} error={errors.role} /></div>
    {values.role === ROLES.AGENT && <FormField id="create-user-department" label="Department" error={errors.department}><select ref={refs.department} value={values.department} onChange={(event) => setValues((current) => ({ ...current, department: event.target.value }))}>{Object.values(DEPARTMENTS).map((department) => <option key={department} value={department}>{department.charAt(0) + department.slice(1).toLowerCase()}</option>)}</select></FormField>}
    <Button type="submit" fullWidth loading={isSubmitting}>Create account</Button>
  </form>
}
