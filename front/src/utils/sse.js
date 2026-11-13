/**
 * 手写 SSE 客户端（零依赖）：fetch POST + ReadableStream，按 \n\n 分帧解析 `data:` 行。
 * 帧协议（由后端 AiSummaryController 产出）：
 *   - OpenAI 兼容的增量帧：data: {"choices":[{"delta":{"content":"片段"},"index":0},...}
 *   - 错误帧：data: {"error":"..."}
 *   - 结束帧：data: [DONE]
 * 后端约定：鉴权/限流等失败返回 application/json 的 R.error（HTTP 200 + body.code），
 * 成功请求才返回 text/event-stream —— 因此 onError 带 code，限流态可单独识别。
 * 浏览器 → POST 携带 Token 头；AbortController 可取消。
 */

/**
 * 增量分帧器：喂入文本，输出完整的前 n 个 SSE 帧（不含结尾的空行）。
 */
export function createSseParser() {
  let buffer = ''
  return {
    /** @returns {string[]} 完整帧列表 */
    push(text) {
      buffer += text
      const frames = []
      let idx
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        frames.push(buffer.slice(0, idx))
        buffer = buffer.slice(idx + 2)
      }
      return frames
    },
    /** 流结束时取出残余缓冲（如果有），之后复位 */
    flush() {
      const tail = buffer.trim()
      buffer = ''
      return tail ? [tail] : []
    },
  }
}

/**
 * 解析单个 SSE 帧并分发给 handlers。
 * @returns {boolean} true = 继续；false = 流已结束或失败（调用方应停止读取）
 */
export function dispatchSseFrame(frame, { onChunk, onDone, onError } = {}) {
  const lines = String(frame).split('\n')
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line.startsWith('data:')) continue
    const payload = line.slice('data:'.length).trim()
    if (!payload) continue
    if (payload === '[DONE]') {
      onDone?.()
      return false
    }
    let data
    try {
      data = JSON.parse(payload)
    } catch {
      onError?.('收到无法解析的数据帧')
      return false
    }
    if (data && typeof data.error === 'string' && data.error) {
      onError?.(data.error, data.code)
      return false
    }
    const piece = data?.choices?.[0]?.delta?.content
    if (typeof piece === 'string' && piece) {
      onChunk?.(piece)
    }
  }
  return true
}

/**
 * 发起 SSE 流式请求。
 * @param {string} url 完整 URL 或 /api 相对路径
 * @param {{ headers?: Record<string,string>, signal?: AbortSignal,
 *           onChunk?: (text: string) => void, onDone?: () => void, onError?: (msg: string, code?: number) => void }} options
 * @returns {Promise<void>}
 */
export async function streamSse(url, { headers = {}, signal, onChunk, onDone, onError } = {}) {
  let response
  try {
    response = await fetch(url, { method: 'POST', headers, signal })
  } catch (err) {
    if (err && err.name === 'AbortError') return
    onError?.('网络错误，请稍后再试')
    return
  }

  // 成功分支才是 text/event-stream；其余一律按 R.error 处理（HTTP 200 + body.code 或非 2xx）
  const contentType = response.headers.get('content-type') || ''
  if (!response.ok || !contentType.includes('text/event-stream') || !response.body) {
    try {
      const body = await response.json()
      onError?.(body?.msg || `请求失败（${response.status}）`, body?.code)
    } catch {
      onError?.(`请求失败（${response.status}）`)
    }
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  const parser = createSseParser()
  let finished = false
  const doneOnce = () => {
    if (!finished) {
      finished = true
      onDone?.()
    }
  }
  const failOnce = msg => {
    if (!finished) {
      finished = true
      onError?.(msg)
    }
  }

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      for (const frame of parser.push(decoder.decode(value, { stream: true }))) {
        if (!dispatchSseFrame(frame, { onChunk, onDone: doneOnce, onError: failOnce })) return
      }
    }
    for (const frame of parser.flush()) {
      if (!dispatchSseFrame(frame, { onChunk, onDone: doneOnce, onError: failOnce })) return
    }
    // 连接被干净地关闭但没有 [DONE]：按正常收尾处理，内容是否为空由调用方判断
    doneOnce()
  } catch (err) {
    if (err && err.name === 'AbortError') return
    failOnce('读取流失败，请稍后再试')
  }
}
