import { describe, expect, it, vi } from 'vitest'
import { createSseParser, dispatchSseFrame, streamSse } from '@/utils/sse'

const contentFrame = piece =>
  `data: ${JSON.stringify({ choices: [{ delta: { content: piece }, index: 0 }] })}`

describe('createSseParser', () => {
  it('parses a complete frame', () => {
    const parser = createSseParser()
    expect(parser.push(`${contentFrame('你好')}\n\n`)).toHaveLength(1)
  })

  it('keeps partial frames until the rest arrives (cross-chunk)', () => {
    const parser = createSseParser()
    expect(parser.push('data: {"choices":[{"delta":{"con')).toEqual([])
    expect(parser.push('tent":"你"},"index":0}]}\n')).toEqual([])
    const frames = parser.push('\n')
    expect(frames).toHaveLength(1)
    expect(frames[0]).toContain('你')
  })

  it('splits multiple frames arriving in one chunk', () => {
    const parser = createSseParser()
    const frames = parser.push(`${contentFrame('一')}\n\n${contentFrame('二')}\n\n`)
    expect(frames).toHaveLength(2)
  })

  it('flush returns the trailing buffer and resets', () => {
    const parser = createSseParser()
    parser.push('data: [DONE]')
    expect(parser.flush()).toEqual(['data: [DONE]'])
    expect(parser.flush()).toEqual([])
  })
})

describe('dispatchSseFrame', () => {
  it('extracts delta content from OpenAI-compatible frames', () => {
    const onChunk = vi.fn()
    const keep = dispatchSseFrame(contentFrame('片段'), { onChunk })
    expect(keep).toBe(true)
    expect(onChunk).toHaveBeenCalledWith('片段')
  })

  it('treats [DONE] as end-of-stream', () => {
    const onDone = vi.fn()
    const keep = dispatchSseFrame('data: [DONE]', { onChunk: vi.fn(), onDone })
    expect(keep).toBe(false)
    expect(onDone).toHaveBeenCalledOnce()
  })

  it('reports error frames with their code', () => {
    const onError = vi.fn()
    const frame = `data: ${JSON.stringify({ error: '今日 AI 额度已用完，请明天再来', code: 429 })}`
    const keep = dispatchSseFrame(frame, { onError })
    expect(keep).toBe(false)
    expect(onError).toHaveBeenCalledWith('今日 AI 额度已用完，请明天再来', 429)
  })

  it('fails on malformed JSON instead of swallowing it', () => {
    const onError = vi.fn()
    const keep = dispatchSseFrame('data: {not json', { onError })
    expect(keep).toBe(false)
    expect(onError).toHaveBeenCalledOnce()
  })

  it('ignores non-data lines and frames without content', () => {
    const onChunk = vi.fn()
    expect(dispatchSseFrame(': keep-alive', { onChunk })).toBe(true)
    const noContent = `data: ${JSON.stringify({ choices: [{ delta: { role: 'assistant' }, index: 0 }] })}`
    expect(dispatchSseFrame(noContent, { onChunk })).toBe(true)
    expect(onChunk).not.toHaveBeenCalled()
  })
})

describe('streamSse', () => {
  it('surfaces R.error JSON bodies as errors with code', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json;charset=UTF-8' },
      json: async () => ({ code: 429, msg: '同一内容 10 分钟内只能生成一次，请稍后再试' }),
    })
    const onError = vi.fn()
    await streamSse('/api/ai/summary/22/generate', { onError })
    expect(onError).toHaveBeenCalledWith('同一内容 10 分钟内只能生成一次，请稍后再试', 429)
  })

  it('streams content frames to onChunk and finishes on [DONE]', async () => {
    const encoder = new TextEncoder()
    const chunks = [contentFrame('不'), contentFrame('错'), 'data: [DONE]']
    let i = 0
    const reader = {
      read: vi.fn(async () => {
        if (i >= chunks.length) return { done: true, value: undefined }
        return { done: false, value: encoder.encode(`${chunks[i++]}\n\n`) }
      }),
    }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'text/event-stream;charset=UTF-8' },
      body: { getReader: () => reader },
    })
    const pieces = []
    const done = vi.fn()
    const onError = vi.fn()
    await streamSse('/api/ai/summary/22/generate', {
      onChunk: piece => pieces.push(piece),
      onDone: done,
      onError,
    })
    expect(pieces.join('')).toBe('不错')
    expect(done).toHaveBeenCalledOnce()
    expect(onError).not.toHaveBeenCalled()
  })
})
