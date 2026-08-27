// 轻量相对时间工具 —— 不引入 dayjs。
// 输入可以是 Date、时间字符串或数字时间戳；返回 "刚刚 / 3 分钟前 / 2 小时前 / 5 天前 / 2025-12-01"。

export function formatRelative(input, now = Date.now()) {
  if (!input && input !== 0) return ''
  const d = input instanceof Date ? input : new Date(String(input).replace(/-/g, '/'))
  const t = d.getTime()
  if (Number.isNaN(t)) return String(input)

  const diff = Math.max(0, now - t)
  const sec = Math.floor(diff / 1000)
  if (sec < 30) return '刚刚'
  if (sec < 60) return `${sec} 秒前`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} 分钟前`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} 小时前`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day} 天前`
  if (day < 30) return `${Math.floor(day / 7)} 周前`

  // 超过一个月 —— 用 yyyy-mm-dd
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export default { formatRelative }
