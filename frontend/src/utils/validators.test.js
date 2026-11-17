import { describe, expect, it } from 'vitest'
import { DEPARTMENTS, ROLES } from './constants.js'
import { validateLogin, validateRegister } from './validators.js'

const validLogin = { email: 'user@example.com', password: 'Password1' }
const validRegister = { fullName: 'Resolve User', ...validLogin, role: ROLES.CUSTOMER, department: '' }

describe('validators', () => {
  it('accepts valid login and registration', () => { expect(validateLogin(validLogin)).toEqual({}); expect(validateRegister(validRegister)).toEqual({}) })
  it('requires fields', () => { expect(validateLogin({})).toHaveProperty('email'); expect(validateLogin({}).password).toBeTruthy(); expect(validateRegister({})).toHaveProperty('fullName') })
  it('rejects malformed email and short or long password', () => {
    expect(validateLogin({ ...validLogin, email: 'bad' })).toHaveProperty('email')
    expect(validateLogin({ ...validLogin, password: 'short' })).toHaveProperty('password')
    expect(validateLogin({ ...validLogin, password: 'x'.repeat(101) })).toHaveProperty('password')
  })
  it('rejects overlong name and unknown role', () => {
    expect(validateRegister({ ...validRegister, fullName: 'x'.repeat(101) })).toHaveProperty('fullName')
    expect(validateRegister({ ...validRegister, role: 'UNKNOWN' })).toHaveProperty('role')
  })
  it('requires department only for agents', () => {
    expect(validateRegister({ ...validRegister, role: ROLES.AGENT })).toHaveProperty('department')
    expect(validateRegister({ ...validRegister, role: ROLES.AGENT, department: DEPARTMENTS.TECHNICAL })).not.toHaveProperty('department')
    expect(validateRegister(validRegister)).not.toHaveProperty('department')
  })
})
