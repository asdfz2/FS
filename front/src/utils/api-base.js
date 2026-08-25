const configuredBase = import.meta.env.VITE_API_BASE_URL || ''

export const apiBase = configuredBase.replace(/\/+$/, '')

export function resolveApiUrl(path) {
  if (/^[a-z][a-z\d+\-.]*:/i.test(path)) return path
  return `${apiBase}${path.startsWith('/') ? path : `/${path}`}`
}
