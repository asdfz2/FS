import { describe, expect, it } from 'vitest'
import { checkIdCard, isEmail, isMobile } from '@/utils/validate'

describe('validate', () => {
  it('validates common form inputs', () => {
    expect(isEmail('student@example.com')).toBe(true)
    expect(isEmail('invalid-email')).toBe(false)
    expect(isMobile('19712345693')).toBe(true)
    expect(isMobile('123456')).toBe(false)
  })

  it('checks Chinese ID card format only', () => {
    expect(checkIdCard('41010120260101001X')).toBe(true)
    expect(checkIdCard('123')).toBe(false)
  })
})
