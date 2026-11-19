import { describe, expect, it } from 'vitest'
import { DEPARTMENTS, ROLES } from './constants.js'
import { validateCreateUser, validateLogin, validateRegister, validateReply, validateTicketForm } from './validators.js'

const validLogin = { email: 'user@example.com', password: 'Password1' }
const validRegister = { fullName: 'Resolve User', ...validLogin }
const validCreateUser = { fullName: 'Resolve User', ...validLogin, role: ROLES.AGENT, department: DEPARTMENTS.BILLING }

describe('validators', () => {
  it('accepts valid login and registration', () => { expect(validateLogin(validLogin)).toEqual({}); expect(validateRegister(validRegister)).toEqual({}) })
  it('requires fields', () => { expect(validateLogin({})).toHaveProperty('email'); expect(validateLogin({}).password).toBeTruthy(); expect(validateRegister({})).toHaveProperty('fullName') })
  it('rejects malformed email and short or long password', () => {
    expect(validateLogin({ ...validLogin, email: 'bad' })).toHaveProperty('email')
    expect(validateLogin({ ...validLogin, password: 'short' })).toHaveProperty('password')
    expect(validateLogin({ ...validLogin, password: 'x'.repeat(101) })).toHaveProperty('password')
  })
  it('rejects overlong name while registration ignores role and department', () => {
    expect(validateRegister({ ...validRegister, fullName: 'x'.repeat(101) })).toHaveProperty('fullName')
    expect(validateRegister({ ...validRegister, role: 'UNKNOWN', department: 'UNKNOWN' })).toEqual({})
  })
  it('validates creation role and department requirements', () => {
    expect(validateCreateUser(validCreateUser)).toEqual({})
    expect(validateCreateUser({ ...validCreateUser, department: '' })).toHaveProperty('department')
    expect(validateCreateUser({ ...validCreateUser, role: ROLES.ADMIN, department: '' })).toEqual({})
    expect(validateCreateUser({ ...validCreateUser, role: ROLES.CUSTOMER })).toHaveProperty('role')
    expect(validateCreateUser({ ...validCreateUser, role: 'UNKNOWN' })).toHaveProperty('role')
    expect(validateCreateUser({ ...validCreateUser, fullName: 'x'.repeat(101) })).toHaveProperty('fullName')
    expect(validateCreateUser({ ...validCreateUser, email: 'x'.repeat(146) + '@a.co' })).toHaveProperty('email')
    expect(validateCreateUser({ ...validCreateUser, password: 'short' })).toHaveProperty('password')
    expect(validateCreateUser({ ...validCreateUser, password: 'x'.repeat(101) })).toHaveProperty('password')
  })
  it('validates trimmed reply length', () => {
    expect(validateReply('   ')).toContain('at least')
    expect(validateReply('four')).toContain('at least')
    expect(validateReply('  valid reply  ')).toBe('')
    expect(validateReply('x'.repeat(2001))).toContain('2000')
  })
  it('validates ticket title and description trimmed lengths against backend limits', () => {
    expect(validateTicketForm({ title: ' A valid issue ', description: ' A sufficiently detailed description ' })).toEqual({})
    expect(validateTicketForm({ title: 'tiny', description: 'A sufficiently detailed description' })).toHaveProperty('title')
    expect(validateTicketForm({ title: 'x'.repeat(201), description: 'A sufficiently detailed description' })).toHaveProperty('title')
    expect(validateTicketForm({ title: 'Valid title', description: 'short' })).toHaveProperty('description')
    expect(validateTicketForm({ title: 'Valid title', description: 'x'.repeat(2001) })).toHaveProperty('description')
    expect(validateTicketForm({ title: '   ', description: '   ' })).toEqual({ title: expect.any(String), description: expect.any(String) })
  })
})
