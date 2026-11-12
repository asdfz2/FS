import { expect, test } from '@playwright/test'

async function fulfillJson(route, body) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body)
  })
}

async function mockShellApi(page) {
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname.endsWith('/config/list')) {
      return fulfillJson(route, { code: 0, data: { list: [], total: 0 } })
    }
    return fulfillJson(route, { code: 0, data: { list: [], total: 0 } })
  })
}

test('rejected submission can be edited and resubmitted', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    localStorage.setItem('Token', JSON.stringify('user-token'))
    localStorage.setItem('role', JSON.stringify('用户'))
    localStorage.setItem('adminName', JSON.stringify('用户1'))
  })
  await mockShellApi(page)

  const rejected = {
    id: 501,
    contentVersion: 2,
    fabushijian: '2026-11-09',
    submitTime: '2026-11-09 14:00:00',
    meishimingcheng: '手打牛肉丸',
    meishileibie: '小吃',
    meishijieshao: '牛肉丸口感弹牙，汤底清爽，分量足够两个人分着吃。',
    shangpusuozaidi: '东门小吃街 8 号',
    tuijianzhishu: '5星',
    meishizhaopian: '',
    shangpinjiage: '22.00',
    auditStatus: 'REJECTED',
    auditReason: '请补充更清晰的实拍图片'
  }

  await page.route('**/api/meishijianshang/mine**', (route) =>
    fulfillJson(route, {
      code: 0,
      data: { list: [rejected], total: 1 }
    })
  )

  let resubmitBody
  await page.route('**/api/meishijianshang/resubmit', async (route) => {
    resubmitBody = route.request().postDataJSON()
    await fulfillJson(route, { code: 0, msg: '已重新提交审核', contentVersion: 3 })
  })

  await page.goto('/#/front/submissions')
  await expect(page.getByText('请补充更清晰的实拍图片')).toBeVisible()
  await page.getByRole('button', { name: '修改并重新提交' }).click()
  await expect(page.getByLabel('美食名称')).toHaveValue('手打牛肉丸')
  await page.screenshot({ path: testInfo.outputPath('submission-desktop.png'), fullPage: true })

  await page.getByRole('button', { name: '重新提交审核' }).click()
  await expect.poll(() => resubmitBody?.id).toBe(501)
  expect(resubmitBody.contentVersion).toBe(2)
})

test('admin reviews pending content and sees the audit timeline', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    localStorage.setItem('Token', JSON.stringify('admin-token'))
    localStorage.setItem('role', JSON.stringify('管理员'))
    localStorage.setItem('adminName', JSON.stringify('admin'))
  })
  await mockShellApi(page)

  const pending = {
    id: 601,
    contentVersion: 3,
    submitTime: '2026-11-09 15:10:00',
    meishimingcheng: '桂花酒酿圆子',
    meishileibie: '甜品',
    meishijieshao: '<p>桂花香气自然，酒酿酸甜适中，圆子软糯。</p>',
    shangpusuozaidi: '南门甜品街 6 号',
    tuijianzhishu: '5星',
    meishizhaopian: '',
    shangpinjiage: '16.00',
    yonghuming: '用户2',
    auditStatus: 'PENDING',
    auditReason: null
  }

  await page.route('**/api/meishijianshang/page**', async (route) => {
    const url = new URL(route.request().url())
    const status = url.searchParams.get('auditStatus')
    const list = !status || status === 'PENDING' ? [pending] : []
    await fulfillJson(route, {
      code: 0,
      data: { list, total: list.length }
    })
  })

  await page.route('**/api/meishijianshang/auditLogs/601', (route) =>
    fulfillJson(route, {
      code: 0,
      data: [
        {
          id: 1,
          contentId: 601,
          contentVersion: 2,
          action: 'REJECTED',
          operator: 'admin',
          reason: '图片不够清晰',
          createdAt: '2026-11-08 10:20:00'
        }
      ]
    })
  )

  let reviewBody
  await page.route('**/api/meishijianshang/review', async (route) => {
    reviewBody = route.request().postDataJSON()
    await fulfillJson(route, {
      code: 0,
      msg: '审核完成',
      auditStatus: 'APPROVED',
      contentVersion: 3
    })
  })

  await page.goto('/#/review')
  await expect(page.getByRole('heading', { name: '内容审核' })).toBeVisible()
  await expect(page.locator('.summary-card').first().locator('strong')).toHaveText('1')
  await page.getByRole('button', { name: '开始审核' }).click()
  await expect(page.getByRole('heading', { name: '桂花酒酿圆子' })).toBeVisible()
  await expect(page.getByText('图片不够清晰')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('review-desktop.png'), fullPage: true })

  await page.getByRole('button', { name: '通过并发布' }).click()
  await expect.poll(() => reviewBody?.action).toBe('APPROVE')
  expect(reviewBody.id).toBe(601)
  expect(reviewBody.contentVersion).toBe(3)
})
