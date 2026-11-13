// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '@/utils/markdown'

describe('renderMarkdown (marked → DOMPurify → v-html 顺序锁死)', () => {
  it('renders markdown formatting', () => {
    expect(renderMarkdown('**综合评价**：不错')).toContain('<strong>综合评价</strong>')
    expect(renderMarkdown('- 分量足\n- 上菜快')).toContain('<li>分量足</li>')
  })

  it('strips injected <script> that marked passes through from raw HTML', () => {
    const html = renderMarkdown('正常文字<script>window.alert(1)</script>')
    expect(html).not.toContain('<script>')
    expect(html).toContain('正常文字')
  })

  it('strips inline event handlers (onerror/onclick) from raw HTML', () => {
    const html = renderMarkdown('<img src="x" onerror="window.alert(1)">')
    expect(html).not.toContain('onerror')

    const html2 = renderMarkdown('<a href="https://example.com" onclick="window.alert(1)">链接</a>')
    expect(html2).not.toContain('onclick')
  })

  it('strips javascript: URLs', () => {
    const html = renderMarkdown('<a href="javascript:window.alert(1)">点我</a>')
    expect(html).not.toContain('javascript:')
  })

  it('returns an empty string for empty input', () => {
    expect(renderMarkdown('')).toBe('')
    expect(renderMarkdown(null)).toBe('')
  })
})
