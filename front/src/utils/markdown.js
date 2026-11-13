import { marked } from 'marked'
import { sanitizeHtml } from '@/utils/sanitize'

marked.setOptions({ breaks: true })

/**
 * AI 输出是不可信内容：固定顺序 marked(md) → DOMPurify.sanitize → 才可以 v-html。
 * 顺序不可反、不可省略 sanitize（见 tests/ai-summary-markdown.test.js 的顺序锁死断言）。
 */
export function renderMarkdown(md) {
  const rawHtml = marked.parse(String(md || ''), { async: false })
  return sanitizeHtml(rawHtml)
}
