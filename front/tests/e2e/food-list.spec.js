import { expect, test } from '@playwright/test'

const foods = [
  {
    id: 21,
    meishimingcheng: '牛肉面',
    meishileibie: '小吃',
    meishijieshao: '汤清味浓，适合课间来一碗。',
    meishizhaopian: '/api/upload/food-1.jpg',
    clicknum: 128,
    yonghuming: '用户2',
    shangpinjiage: 18
  },
  {
    id: 22,
    meishimingcheng: '桂花糕',
    meishileibie: '甜品',
    meishijieshao: '入口松软，桂花香气明显。',
    meishizhaopian: '/api/upload/food-2.jpg',
    clicknum: 96,
    yonghuming: '用户3',
    shangpinjiage: 12
  }
]

async function fulfillJson(route, body) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body)
  })
}

async function mockApi(page) {
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname

    if (path.endsWith('/meishijianshang/list')) {
      const limit = Number(url.searchParams.get('limit'))
      if (limit >= 1000) {
        return fulfillJson(route, {
          code: 0,
          data: { list: foods, total: foods.length }
        })
      }

      const keyword = url.searchParams.get('meishimingcheng') || ''
      const category = url.searchParams.get('meishileibie') || ''
      const pageNumber = Number(url.searchParams.get('page')) || 1
      const filtered = foods.filter((food) => {
        const matchesKeyword = !keyword || food.meishimingcheng.includes(keyword)
        const matchesCategory = !category || food.meishileibie === category
        return matchesKeyword && matchesCategory
      })
      const pageFoods = pageNumber === 2 ? [foods[1]] : filtered

      return fulfillJson(route, {
        code: 0,
        data: { list: pageFoods, total: 24 }
      })
    }

    if (path.endsWith('/config/list')) {
      return fulfillJson(route, {
        code: 0,
        data: { list: [{ name: '今日甄选', value: '/api/upload/banner.jpg' }] }
      })
    }

    if (path.endsWith('/yonghu/list')) {
      return fulfillJson(route, { code: 0, data: { list: [], total: 8 } })
    }

    if (path.endsWith('/meishijianshang/info/21')) {
      return fulfillJson(route, {
        code: 0,
        data: {
          ...foods[0],
          fabushijian: '2026-11-09 10:00:00',
          shangpusuozaidi: '宿舍楼下'
        }
      })
    }

    if (path.endsWith('/discussmeishijianshang/list')) {
      return fulfillJson(route, { code: 0, data: { list: [], total: 0 } })
    }

    if (path.endsWith('/storeup/list') || path.endsWith('/wodehaoyou/list')) {
      return fulfillJson(route, { code: 0, data: { list: [], total: 0 } })
    }

    return fulfillJson(route, { code: 0, data: { list: [], total: 0 } })
  })
}

function hashQuery(url) {
  const hash = new URL(url).hash
  const query = hash.split('?')[1] || ''
  return new URLSearchParams(query)
}

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test('restores list filters and view from the URL', async ({ page }) => {
  await page.goto('/#/front/meishijianshang?keyword=%E9%9D%A2&category=%E5%B0%8F%E5%90%83&page=2&view=list')

  await expect(page.locator('.search-input')).toHaveValue('面')
  await expect(page.locator('.chip.is-active')).toHaveText('小吃')
  await expect(page.locator('.food-card--list')).toContainText('桂花糕')
  await expect(page.locator('.search-input')).toBeVisible()
  await expect(page.locator('.food-card--list')).toBeVisible()
})

test('syncs search, pagination and view changes to the URL', async ({ page }) => {
  await page.goto('/#/front/meishijianshang')

  await page.locator('.search-input').fill('牛肉')
  await page.getByRole('button', { name: '搜索' }).click()
  await expect.poll(() => hashQuery(page.url()).get('keyword')).toBe('牛肉')
  await expect(page.locator('.food-name').first()).toHaveText('牛肉面')

  await page.getByLabel('列表').click()
  await expect.poll(() => hashQuery(page.url()).get('view')).toBe('list')

  await page.locator('.el-pager li').filter({ hasText: '2' }).click()
  await expect.poll(() => hashQuery(page.url()).get('page')).toBe('2')
})

test('ignores an older search response that resolves late', async ({ page }) => {
  await page.route('**/api/meishijianshang/list**', async (route) => {
    const url = new URL(route.request().url())
    if (url.searchParams.get('limit') === '1000') return route.fallback()
    const keyword = url.searchParams.get('meishimingcheng')

    if (keyword === '旧') {
      await new Promise((resolve) => setTimeout(resolve, 700))
      return fulfillJson(route, {
        code: 0,
        data: {
          list: [{ ...foods[0], id: 91, meishimingcheng: '旧结果' }],
          total: 1
        }
      })
    }

    if (keyword === '新') {
      return fulfillJson(route, {
        code: 0,
        data: {
          list: [{ ...foods[1], id: 92, meishimingcheng: '新结果' }],
          total: 1
        }
      })
    }

    return route.fallback()
  })

  await page.goto('/#/front/meishijianshang')
  const oldRequest = page.waitForRequest((request) => {
    const url = new URL(request.url())
    return url.pathname.endsWith('/meishijianshang/list') &&
      url.searchParams.get('meishimingcheng') === '旧'
  })

  await page.locator('.search-input').fill('旧')
  await page.getByRole('button', { name: '搜索' }).click()
  await oldRequest

  await page.locator('.search-input').fill('新')
  await page.getByRole('button', { name: '搜索' }).click()

  await expect(page.locator('.food-name')).toHaveText('新结果')
  await page.waitForTimeout(900)
  await expect(page.locator('.food-name')).toHaveText('新结果')
})

test('rolls back collection state when the save request fails', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('Token', JSON.stringify('demo-token'))
    localStorage.setItem('role', JSON.stringify('用户'))
    localStorage.setItem('adminName', JSON.stringify('用户1'))
  })
  await page.route('**/api/meishijianshang/info/22', (route) =>
    fulfillJson(route, {
      code: 0,
      data: {
        ...foods[0],
        id: 22,
        yonghuming: '用户2',
        fabushijian: '2026-11-09 10:00:00'
      }
    })
  )

  let releaseSave
  let markSaveStarted
  const saveStarted = new Promise((resolve) => {
    markSaveStarted = resolve
  })
  const saveResponse = new Promise((resolve) => {
    releaseSave = resolve
  })

  await page.route('**/api/storeup/save', async (route) => {
    markSaveStarted()
    await saveResponse
    await fulfillJson(route, { code: 500, msg: '模拟收藏失败' })
  })

  await page.goto('/#/front/meishijianshang/detail?id=22')
  const collectButton = page.getByLabel('收藏')
  await expect(collectButton).toBeVisible()

  await collectButton.click()
  await saveStarted
  await expect(collectButton).toHaveAttribute('aria-pressed', 'true')

  releaseSave()
  await expect(collectButton).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByText('模拟收藏失败')).toBeVisible()
})

test('restores the list scroll position after returning from detail', async ({ page }) => {
  const longList = Array.from({ length: 12 }, (_, index) => ({
    ...foods[index % foods.length],
    id: 100 + index,
    meishimingcheng: `校园美食 ${index + 1}`
  }))

  await page.route('**/api/meishijianshang/list**', async (route) => {
    const url = new URL(route.request().url())
    if (url.searchParams.get('limit') === '1000') return route.fallback()
    await fulfillJson(route, {
      code: 0,
      data: { list: longList, total: longList.length }
    })
  })

  await page.goto('/#/front/meishijianshang?view=list')
  await expect(page.locator('.food-card')).toHaveCount(12)
  await page.evaluate(() => window.scrollTo(0, 900))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(600)

  await page.locator('.image-button').nth(8).click()
  await expect.poll(() => new URL(page.url()).hash).toContain('/detail')
  await page.goBack()

  await expect.poll(() => hashQuery(page.url()).get('view')).toBe('list')
  await expect(page.locator('.food-card')).toHaveCount(12)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(600)
})

test('redirects anonymous users away from protected pages', async ({ page }) => {
  await page.goto('/#/front/storeup')
  await expect.poll(() => new URL(page.url()).hash).toContain('/login')
})

test('keeps the mobile list free of horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#/front/meishijianshang')
  await expect(page.locator('.food-card').first()).toBeVisible()

  const layout = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    offenders: Array.from(document.querySelectorAll('body *'))
      .map((element) => {
        const rect = element.getBoundingClientRect()
        return {
          tag: element.tagName,
          className: String(element.className || '').slice(0, 80),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        }
      })
      .filter((item) => item.right > window.innerWidth + 1 || item.width > window.innerWidth + 1)
      .slice(0, 12)
  }))
  expect(layout.scrollWidth, JSON.stringify(layout.offenders)).toBeLessThanOrEqual(layout.clientWidth + 1)
})
