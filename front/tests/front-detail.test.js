import { beforeEach, describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import FrontDetail from '@/views/FrontDetail.vue'

const http = vi.fn()

function mountDetail() {
  const message = {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  }
  const wrapper = shallowMount(FrontDetail, {
    global: {
      mocks: {
        $http: http,
        $storage: {
          get: (key) => (key === 'Token' ? 'user-token' : '用户1'),
        },
        $message: message,
        $route: { query: {} },
        $router: { push: vi.fn() },
      },
    },
  })
  return { wrapper, message }
}

describe('food interactions', () => {
  beforeEach(() => {
    http.mockReset()
    http.mockResolvedValue({ data: { code: 0, data: { list: [] } } })
  })

  it('submits comments without a client-controlled user id', async () => {
    const { wrapper } = mountDetail()
    wrapper.vm.$route.query.id = '22'
    wrapper.vm.commentContent = '味道很好'

    wrapper.vm.submitComment()
    await Promise.resolve()

    expect(http).toHaveBeenCalledWith({
      url: 'discussmeishijianshang/save',
      method: 'post',
      data: { refid: '22', content: '味道很好' },
    })
  })

  it('submits collection ownership through the authenticated session', async () => {
    const { wrapper } = mountDetail()
    wrapper.vm.$route.query.id = '22'
    wrapper.vm.detailData = {
      id: 22,
      meishimingcheng: '牛肉面',
      meishizhaopian: '/api/upload/food.jpg',
    }

    await wrapper.vm.collect()

    expect(http).toHaveBeenCalledWith({
      url: 'storeup/save',
      method: 'post',
      data: {
        refid: '22',
        tablename: 'meishijianshang',
        name: '牛肉面',
        picture: '/api/upload/food.jpg',
      },
    })
    expect(wrapper.vm.isCollected).toBe(true)
    expect(wrapper.vm.actionLoading).toBe(false)
  })

  it('rolls back the optimistic collection state when saving fails', async () => {
    const { wrapper, message } = mountDetail()
    wrapper.vm.$route.query.id = '22'
    wrapper.vm.detailData = {
      id: 22,
      meishimingcheng: '牛肉面',
      meishizhaopian: '/api/upload/food.jpg',
    }
    http.mockRejectedValueOnce(new Error('网络异常'))

    const saved = await wrapper.vm.collect()

    expect(saved).toBe(false)
    expect(wrapper.vm.isCollected).toBe(false)
    expect(wrapper.vm.actionLoading).toBe(false)
    expect(message.error).toHaveBeenCalledWith('网络异常')
  })

  it('adds the food author instead of the current user', async () => {
    const { wrapper } = mountDetail()
    wrapper.vm.$route.query.id = '22'
    wrapper.vm.detailData = {
      id: 22,
      yonghuming: '用户2',
      xingming: '周砚礼',
    }

    await wrapper.vm.addFriend()

    expect(http).toHaveBeenCalledWith({
      url: 'wodehaoyou/save',
      method: 'post',
      data: expect.objectContaining({
        yonghuming: '用户2',
        xingming: '周砚礼',
      }),
    })
  })

  it('rejects adding the current user as a friend', async () => {
    const { wrapper, message } = mountDetail()
    wrapper.vm.$route.query.id = '22'
    wrapper.vm.detailData = {
      id: 22,
      yonghuming: '用户1',
      xingming: '用户1',
    }

    await wrapper.vm.addFriend()

    expect(http).not.toHaveBeenCalled()
    expect(message.warning).toHaveBeenCalledWith('不能添加自己为好友')
  })
})
