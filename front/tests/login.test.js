import { beforeEach, describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import Login from '@/views/login.vue'

const http = vi.fn()

function createWrapper() {
  const storage = new Map()
  const replace = vi.fn()
  const message = {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  }
  const wrapper = shallowMount(Login, {
    global: {
      stubs: {
        RouterLink: true,
      },
      mocks: {
        $http: http,
        $storage: {
          get: (key) => storage.get(key) || '',
          set: (key, value) => storage.set(key, value),
          remove: (key) => storage.delete(key),
        },
        $message: message,
        $router: { replace },
        $route: { query: {} },
      },
    },
  })
  return { wrapper, storage, replace, message }
}

describe('login flow', () => {
  beforeEach(() => {
    http.mockReset()
  })

  it('stores the token and redirects after a successful admin login', async () => {
    http.mockResolvedValue({ data: { code: 0, token: 'admin-token' } })
    const { wrapper, storage, replace } = createWrapper()
    wrapper.vm.rulesForm = {
      username: 'admin',
      password: '123456',
      role: '管理员',
    }

    await wrapper.vm.login()

    expect(http).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'users/login?username=admin&password=123456',
        method: 'post',
      }),
    )
    expect(storage.get('Token')).toBe('admin-token')
    expect(storage.get('role')).toBe('管理员')
    expect(replace).toHaveBeenCalledWith({ path: '/index' })
  })

  it('does not persist credentials when the API rejects login', async () => {
    http.mockResolvedValue({ data: { code: 1, msg: '账号或密码不正确' } })
    const { wrapper, storage, replace, message } = createWrapper()
    wrapper.vm.rulesForm = {
      username: 'admin',
      password: 'bad',
      role: '管理员',
    }

    await wrapper.vm.login()

    expect(storage.has('Token')).toBe(false)
    expect(replace).not.toHaveBeenCalled()
    expect(message.error).toHaveBeenCalledWith('账号或密码不正确')
  })
})
