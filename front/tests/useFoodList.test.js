import { beforeEach, describe, expect, it, vi } from 'vitest'

const httpMock = vi.hoisted(() => vi.fn())

vi.mock('@/utils/http', () => ({
  default: httpMock
}))

import { useFoodList } from '@/composables/useFoodList'

describe('useFoodList', () => {
  beforeEach(() => {
    httpMock.mockReset()
    httpMock.mockResolvedValue({
      data: {
        code: 0,
        data: {
          list: [{ id: 1, meishimingcheng: '牛肉面' }],
          total: 1
        }
      }
    })
  })

  it('loads the first page and exposes normalized state', async () => {
    const foodList = useFoodList({ limit: 6 })

    await foodList.getDataList()

    expect(httpMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'meishijianshang/list?page=1&limit=6',
        method: 'get'
      })
    )
    expect(foodList.dataList.value).toHaveLength(1)
    expect(foodList.total.value).toBe(1)
    expect(foodList.loading.value).toBe(false)
    expect(foodList.loadError.value).toBe(false)
  })

  it('marks the request as failed when the API response is invalid', async () => {
    httpMock.mockResolvedValue({ data: { code: 500 } })
    const foodList = useFoodList()

    await foodList.getDataList()

    expect(foodList.loadError.value).toBe(true)
  })
})
