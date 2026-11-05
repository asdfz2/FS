import storage from '@/utils/storage'

export function authGuard(to) {
  const requiresUser = to.matched.some((record) => record.meta.requiresUser)
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin)
  const role = storage.get('role')

  if (requiresUser && role !== '用户') {
    if (!role) return { path: '/login', query: { redirect: to.fullPath } }
    return { path: '/front' }
  }
  if (requiresAdmin && role !== '管理员') {
    return { path: '/front' }
  }
  return true
}
