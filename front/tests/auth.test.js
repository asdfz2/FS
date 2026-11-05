import { beforeEach, describe, expect, it } from 'vitest'
import { authGuard } from '@/router/guards'
import { isAuth } from '@/utils/utils'

function route(meta = {}, fullPath = '/') {
  return {
    fullPath,
    matched: [{ meta }],
  }
}

describe('authGuard', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirects anonymous users from protected user pages to login', () => {
    expect(authGuard(route({ requiresUser: true }, '/front/storeup'))).toEqual({
      path: '/login',
      query: { redirect: '/front/storeup' },
    })
  })

  it('allows only administrators into the admin shell', () => {
    localStorage.setItem('role', JSON.stringify('用户'))
    expect(authGuard(route({ requiresAdmin: true }, '/index'))).toEqual({ path: '/front' })

    localStorage.setItem('role', JSON.stringify('管理员'))
    expect(authGuard(route({ requiresAdmin: true }, '/index'))).toBe(true)
  })
})

describe('isAuth', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('does not grant administrator permissions without a role', () => {
    expect(isAuth('meishijianshang', '删除')).toBe(false)
  })

  it('checks permissions against the current role menu', () => {
    localStorage.setItem('role', JSON.stringify('管理员'))
    expect(isAuth('meishijianshang', '删除')).toBe(true)
  })
})
