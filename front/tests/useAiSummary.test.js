import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { flushPromises } from '@vue/test-utils'

vi.mock('@/utils/http', () => ({ default: { get: vi.fn() } }))
vi.mock('@/utils/sse', () => ({ streamSse: vi.fn() }))
vi.mock('@/utils/storage', () => ({
  default: { get: vi.fn(() => 'user-token'), set: vi.fn(), remove: vi.fn() },
}))

import http from '@/utils/http'
import { streamSse } from '@/utils/sse'
import storage from '@/utils/storage'
import { useAiSummary } from '@/composables/useAiSummary'

const noCache = (currentCommentCount, minComments = 3) => ({
  data: { code: 0, data: null, minComments, commentCount: currentCommentCount },
})
const cached = ({ commentCount = 4, currentCommentCount = 4, stale = false, md = '**共识**' } = {}) => ({
  data: {
    code: 0,
    data: {
      summaryText: md,
      commentCount,
      currentCommentCount,
      stale,
      generatedAt: '2026-11-13 10:00:00',
      minComments: 3,
      commentCountEnough: true,
    },
  },
})

const successStream = (url, options) => {
  options.onChunk('完整')
  options.onChunk('摘要')
  options.onDone()
  return Promise.resolve()
}

describe('useAiSummary', () => {
  let contentId

  beforeEach(() => {
    contentId = ref('22')
    vi.clearAllMocks()
    storage.get.mockImplementation(key => (key === 'Token' ? 'user-token' : ''))
    streamSse.mockImplementation(successStream)
  })

  it('shows insufficient when current comments are below the threshold', async () => {
    http.get.mockResolvedValue(noCache(2))
    const summary = useAiSummary(contentId)
    await summary.load()
    expect(summary.status.value).toBe('insufficient')
    expect(summary.meta.value.commentCountEnough).toBe(false)
  })

  it('shows idle when enough comments but no cache', async () => {
    http.get.mockResolvedValue(noCache(4))
    const summary = useAiSummary(contentId)
    await summary.load()
    expect(summary.status.value).toBe('idle')
    expect(summary.summaryMd.value).toBe('')
  })

  it('shows done for a fresh cache hit', async () => {
    http.get.mockResolvedValue(cached())
    const summary = useAiSummary(contentId)
    await summary.load()
    expect(summary.status.value).toBe('done')
    expect(summary.summaryMd.value).toBe('**共识**')
    expect(summary.meta.value.generatedAt).toBe('2026-11-13 10:00:00')
  })

  it('derives stale from comment count drift', async () => {
    http.get.mockResolvedValue(cached({ commentCount: 3, currentCommentCount: 4, stale: true }))
    const summary = useAiSummary(contentId)
    await summary.load()
    expect(summary.status.value).toBe('stale')
  })

  it('accumulates streamed chunks into done state', async () => {
    http.get
      .mockResolvedValueOnce(cached())
      .mockResolvedValue(cached({ md: '完整摘要' }))
    const summary = useAiSummary(contentId)
    await summary.load()
    summary.generate()
    await flushPromises()
    expect(summary.status.value).toBe('done')
    expect(summary.summaryMd.value).toBe('完整摘要')
    expect(summary.streamedText.value).toBe('')
  })

  it('maps 429 from the generate endpoint to the limited state', async () => {
    http.get.mockResolvedValue(cached())
    streamSse.mockImplementation((url, options) => {
      options.onError('今日 AI 额度已用完，请明天再来', 429)
      return Promise.resolve()
    })
    const summary = useAiSummary(contentId)
    await summary.load()
    summary.generate()
    await flushPromises()
    expect(summary.status.value).toBe('limited')
    expect(summary.errorMsg.value).toContain('额度')
    // 保留旧缓存继续展示
    expect(summary.summaryMd.value).toBe('**共识**')
  })

  it('recovers from error to done via retry', async () => {
    http.get.mockResolvedValue(cached())
    streamSse.mockImplementationOnce((url, options) => {
      options.onError('AI 共识暂时不可用')
      return Promise.resolve()
    })
    const summary = useAiSummary(contentId)
    await summary.load()
    summary.generate()
    await flushPromises()
    expect(summary.status.value).toBe('error')

    http.get.mockResolvedValue(cached({ md: '完整摘要' }))
    streamSse.mockImplementation(successStream)
    summary.retry()
    await flushPromises()
    expect(summary.status.value).toBe('done')
    expect(summary.summaryMd.value).toBe('完整摘要')
  })

  it('refuses to generate anonymously', async () => {
    storage.get.mockImplementation(key => (key === 'Token' ? '' : ''))
    http.get.mockResolvedValue(cached())
    const summary = useAiSummary(contentId)
    await summary.load()
    summary.generate()
    expect(summary.status.value).toBe('error')
    expect(summary.errorMsg.value).toContain('登录')
    expect(streamSse).not.toHaveBeenCalled()
  })
})
