import { expect, test } from '@playwright/test'

async function fulfillJson(route, body) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

const food = {
  id: 22,
  meishimingcheng: '厚切金枪鱼刺身',
  meishileibie: '日式料理',
  meishijieshao: '厚切鱼腩油脂丰润，配现磨山葵。',
  shangpusuozaidi: '南湖大学城文苑路88号',
  fabushijian: '2026-08-23',
  addtime: '2026-08-23 03:17:36',
  tuijianzhishu: '5星',
  meishizhaopian: '/api/upload/food.jpg',
  shangpinjiage: '58.00',
  yonghuming: '用户2',
  xingming: '周砚礼',
  thumbsupnum: 86,
  crazilynum: 7,
  clicknum: 1267,
}

const comments = [
  { id: 61, nickname: '林晚秋', content: '鱼片厚度很实在，入口冰凉鲜甜。', addtime: '2026-11-01 12:30:00' },
  { id: 1380000000196, nickname: '周砚礼', content: '刺身新鲜，价格算合理。', addtime: '2026-11-02 19:00:00' },
]

function sseBody(pieces) {
  return (
    pieces
      .map(
        piece =>
          `data: ${JSON.stringify({ choices: [{ delta: { content: piece }, index: 0 }] })}\n\n`,
      )
      .join('') + 'data: [DONE]\n\n'
  )
}

async function mockDetailApi(page, { getSummary, onGenerate } = {}) {
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url())
    const path = url.pathname

    if (path.endsWith('/meishijianshang/info/22')) {
      return fulfillJson(route, { code: 0, data: food })
    }
    if (path.endsWith('/config/list')) {
      return fulfillJson(route, { code: 0, data: { list: [] } })
    }
    if (path.endsWith('/discussmeishijianshang/list')) {
      return fulfillJson(route, { code: 0, data: { list: comments, total: comments.length } })
    }
    if (path.endsWith('/storeup/list') || path.endsWith('/wodehaoyou/list')) {
      return fulfillJson(route, { code: 0, data: { list: [], total: 0 } })
    }
    if (path.endsWith('/ai/summary/22')) {
      const body = typeof getSummary === 'function' ? getSummary(route.request()) : getSummary
      return fulfillJson(route, body)
    }
    if (path.endsWith('/ai/summary/22/generate')) {
      const result = await onGenerate(route.request())
      return route.fulfill({ status: 200, ...result })
    }
    return fulfillJson(route, { code: 0, data: { list: [], total: 0 } })
  })
}

const cachedBody = (overrides = {}) => ({
  code: 0,
  data: {
    summaryText: '**综合评价**：刺身很新鲜，值得一试。\n\n**优点**：肉质厚实。\n\n**缺点**：周末人多。\n\n**适合谁**：喜欢日料的朋友。\n\n（由 AI 生成，仅供参考）',
    commentCount: 4,
    currentCommentCount: 4,
    stale: false,
    generatedAt: '2026-11-13 10:00:00',
    minComments: 3,
    commentCountEnough: true,
    ...overrides,
  },
})

const noCacheBody = { code: 0, data: null, minComments: 3, commentCount: 4 }

test('renders cached AI summary for logged-in users', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('Token', JSON.stringify('user-token'))
    localStorage.setItem('role', JSON.stringify('用户'))
    localStorage.setItem('adminName', JSON.stringify('用户1'))
  })
  await mockDetailApi(page, { getSummary: cachedBody() })

  await page.goto('/#/front/meishijianshang/detail?id=22')
  const card = page.locator('.ai-summary-card')
  await expect(card.getByText('AI 食客共识')).toBeVisible()
  await expect(card.getByText('值得一试')).toBeVisible()
  await expect(card.getByText('基于生成时的 4 条评论')).toBeVisible()
  await expect(card.getByRole('button', { name: '重新生成' })).toBeVisible()
})

test('streams generation and renders markdown result', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('Token', JSON.stringify('user-token'))
    localStorage.setItem('role', JSON.stringify('用户'))
    localStorage.setItem('adminName', JSON.stringify('用户1'))
  })
  let generated = false
  const newMd = '**综合评价**：现切现卖，鲜度不错。\n\n**优点**：芥末足够新鲜。\n\n**缺点**：价格偏高。\n\n**适合谁**：约会与饭后小聚。\n\n（由 AI 生成，仅供参考）'
  await mockDetailApi(page, {
    getSummary: () => (generated ? cachedBody({ summaryText: newMd }) : noCacheBody),
    onGenerate: async () => {
      generated = true
      return {
        contentType: 'text/event-stream',
        body: sseBody(['**综合评价**：现切现卖，鲜度不错。\n\n', '**优点**：芥末足够新鲜。\n\n**缺点**：价格偏高。\n\n**适合谁**：约会与饭后小聚。\n\n（由 AI 生成，仅供参考）']),
      }
    },
  })

  await page.goto('/#/front/meishijianshang/detail?id=22')
  const card = page.locator('.ai-summary-card')
  await card.getByRole('button', { name: '生成共识' }).click()
  await expect(card.getByText('现切现卖')).toBeVisible()
  await expect(card.getByText('基于生成时的 4 条评论')).toBeVisible()
})

test('stale cache shows the expired hint', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('Token', JSON.stringify('user-token'))
    localStorage.setItem('role', JSON.stringify('用户'))
    localStorage.setItem('adminName', JSON.stringify('用户1'))
  })
  await mockDetailApi(page, {
    getSummary: cachedBody({ commentCount: 3, currentCommentCount: 4, stale: true }),
  })

  await page.goto('/#/front/meishijianshang/detail?id=22')
  const card = page.locator('.ai-summary-card')
  await expect(card.getByText('可能已过期')).toBeVisible()
  await expect(card.getByRole('button', { name: '重新生成' })).toBeVisible()
})

test('anonymous users see the cached card but cannot generate', async ({ page }) => {
  await mockDetailApi(page, { getSummary: cachedBody() })

  await page.goto('/#/front/meishijianshang/detail?id=22')
  const card = page.locator('.ai-summary-card')
  await expect(card.getByText('AI 食客共识')).toBeVisible()
  await expect(card.getByText('值得一试')).toBeVisible()
  await expect(card.getByRole('button', { name: '登录后可生成' })).toBeVisible()
  await expect(card.getByRole('button', { name: '生成共识' })).toHaveCount(0)
  await expect(card.getByRole('button', { name: '重新生成' })).toHaveCount(0)
})

test('daily limit copy is shown when the server rejects with 429', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('Token', JSON.stringify('user-token'))
    localStorage.setItem('role', JSON.stringify('用户'))
    localStorage.setItem('adminName', JSON.stringify('用户1'))
  })
  await mockDetailApi(page, {
    getSummary: noCacheBody,
    onGenerate: async () => ({
      contentType: 'text/event-stream',
      body: 'data: {"error":"今日 AI 额度已用完，请明天再来","code":429}\n\n',
    }),
  })

  await page.goto('/#/front/meishijianshang/detail?id=22')
  const card = page.locator('.ai-summary-card')
  await card.getByRole('button', { name: '生成共识' }).click()
  await expect(card.getByText('今日 AI 额度已用完，请明天再来')).toBeVisible()
})
