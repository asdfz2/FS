import { computed, ref, unref, watch } from 'vue'
import http from '@/utils/http'
import storage from '@/utils/storage'
import { apiBase } from '@/utils/api-base'
import { streamSse } from '@/utils/sse'

/**
 * AI 食客共识卡片状态机。
 * status: 'loading' | 'insufficient' | 'idle' | 'streaming' | 'done' | 'stale' | 'limited' | 'error'
 * （未登录不是状态：isLoggedIn=false 时按钮置灰并提示登录，缓存内容照常可见）
 *
 * 语义：
 * - insufficient：当前评论数 < minComments，按钮置灰
 * - idle：无缓存且达到门槛，展示“暂无共识，来生成第一条”
 * - done：有缓存且评论数未变化
 * - stale：有缓存但评论数变化过，提示“已过期，重新生成”
 * - limited：生成请求被 429 限流（节流或日限额）
 * - error：其余失败，可重试
 */
export function useAiSummary(contentId) {
  const status = ref('loading')
  /** 已确认的 Markdown 原文（生成完成时置位）；空串表示无摘要 */
  const summaryMd = ref('')
  /** 生成过程中的纯文本进度（流式阶段只渲染文本，不走 v-html） */
  const streamedText = ref('')
  const meta = ref({
    commentCount: null,
    currentCommentCount: 0,
    stale: false,
    generatedAt: null,
    model: null,
    minComments: 3,
    commentCountEnough: false,
  })
  const errorMsg = ref('')

  const isLoggedIn = computed(() => !!storage.get('Token'))
  const hasCache = computed(() => !!summaryMd.value)
  const contentIdValue = () => unref(contentId)

  let abortController = null

  function applyLoaded(body) {
    const data = body && body.data
    if (!data) {
      const minComments = body?.minComments ?? 3
      const currentCommentCount = body?.commentCount ?? 0
      meta.value = {
        commentCount: null,
        currentCommentCount,
        stale: false,
        generatedAt: null,
        model: null,
        minComments,
        commentCountEnough: currentCommentCount >= minComments,
      }
      summaryMd.value = ''
      if (currentCommentCount < minComments) status.value = 'insufficient'
      else status.value = 'idle'
      return
    }
    meta.value = {
      commentCount: data.commentCount ?? null,
      currentCommentCount: data.currentCommentCount ?? 0,
      stale: !!data.stale,
      generatedAt: data.generatedAt || null,
      model: data.model || null,
      minComments: data.minComments ?? 3,
      commentCountEnough: data.commentCountEnough !== false,
    }
    summaryMd.value = data.summaryText || ''
    if (!meta.value.commentCountEnough) {
      status.value = 'insufficient'
    } else if (meta.value.stale) {
      status.value = 'stale'
    } else {
      status.value = 'done'
    }
  }

  async function load({ silent = false } = {}) {
    const id = contentIdValue()
    if (id == null) return
    if (!silent) status.value = 'loading'
    errorMsg.value = ''
    try {
      const { data } = await http.get(`/ai/summary/${id}`)
      if (data && data.code === 0) {
        applyLoaded(data)
      } else {
        status.value = 'error'
        errorMsg.value = (data && data.msg) || '加载失败'
      }
    } catch {
      status.value = 'error'
      errorMsg.value = '网络错误，请稍后再试'
    }
  }

  function generate() {
    const id = contentIdValue()
    if (id == null || status.value === 'streaming') return
    if (!isLoggedIn.value) {
      status.value = 'error'
      errorMsg.value = '请先登录后再生成'
      return
    }
    abortController = new AbortController()
    streamedText.value = ''
    status.value = 'streaming'
    errorMsg.value = ''
    let accumulated = ''
    const base = apiBase ? `${apiBase}/api` : '/api'
    streamSse(`${base}/ai/summary/${id}/generate`, {
      headers: { Token: storage.get('Token'), Accept: 'text/event-stream' },
      signal: abortController.signal,
      onChunk(piece) {
        accumulated += piece
        streamedText.value = accumulated
      },
      onDone() {
        abortController = null
        if (!accumulated.trim()) {
          status.value = 'error'
          errorMsg.value = 'AI 返回为空，请稍后再试'
          return
        }
        summaryMd.value = accumulated.trim()
        streamedText.value = ''
        status.value = 'done'
        // 以服务端缓存为准同步 stale / 评论数
        load({ silent: true })
      },
      onError(msg, code) {
        abortController = null
        errorMsg.value = msg || 'AI 共识暂时不可用'
        status.value = code === 429 || /429|额度|频繁/.test(String(msg || '')) ? 'limited' : 'error'
        // 生成失败时保留旧缓存展示（不清空 summaryMd）
      },
    })
  }

  function cancel() {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    if (status.value === 'streaming') {
      status.value = summaryMd.value ? (meta.value.stale ? 'stale' : 'done') : 'idle'
      streamedText.value = ''
    }
  }

  function retry() {
    generate()
  }

  watch(
    () => unref(contentId),
    () => {
      cancel()
      load()
    },
  )

  return {
    status,
    summaryMd,
    streamedText,
    meta,
    errorMsg,
    isLoggedIn,
    hasCache,
    load,
    generate,
    cancel,
    retry,
  }
}
