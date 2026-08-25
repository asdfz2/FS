// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { sanitizeHtml } from '@/utils/sanitize'

describe('sanitizeHtml', () => {
  it('keeps basic rich text while removing scripts and event handlers', () => {
    window.alert = vi.fn()
    const input = '<p onclick="alert(1)">美食<script>alert(1)</script></p>'

    expect(sanitizeHtml(input)).toBe('<p>美食</p>')
  })

  it('returns an empty string for empty input', () => {
    expect(sanitizeHtml('')).toBe('')
    expect(sanitizeHtml(null)).toBe('')
  })
})
