import { DEPARTMENTS, EMAIL_MAX_LENGTH, NAME_MAX_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, ROLES } from './constants.js'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const roleValues = Object.values(ROLES)
const departmentValues = Object.values(DEPARTMENTS)

export function validateLogin({ email = '', password = '' } = {}) {
  const errors = {}
  if (!email.trim()) errors.email = 'Email is required.'
  else if (email.length > EMAIL_MAX_LENGTH) errors.email = `Email must be ${EMAIL_MAX_LENGTH} characters or fewer.`
  else if (!emailPattern.test(email.trim())) errors.email = 'Enter a valid email address.'
  if (!password) errors.password = 'Password is required.'
  else if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) errors.password = `Password must be ${PASSWORD_MIN_LENGTH}–${PASSWORD_MAX_LENGTH} characters.`
  return errors
}

export function validateRegister({ fullName = '', email = '', password = '', role = '', department = '' } = {}) {
  const errors = {}
  if (!fullName.trim()) errors.fullName = 'Full name is required.'
  else if (fullName.trim().length > NAME_MAX_LENGTH) errors.fullName = `Name must be ${NAME_MAX_LENGTH} characters or fewer.`
  if (!email.trim()) errors.email = 'Email is required.'
  else if (email.length > EMAIL_MAX_LENGTH) errors.email = `Email must be ${EMAIL_MAX_LENGTH} characters or fewer.`
  else if (!emailPattern.test(email.trim())) errors.email = 'Enter a valid email address.'
  if (!password) errors.password = 'Password is required.'
  else if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) errors.password = `Password must be ${PASSWORD_MIN_LENGTH}–${PASSWORD_MAX_LENGTH} characters.`
  if (!roleValues.includes(role)) errors.role = 'Choose a valid role.'
  if (role === ROLES.AGENT && !departmentValues.includes(department)) errors.department = 'Choose a department.'
  return errors
}
