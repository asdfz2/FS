import { reactive, ref } from 'vue'
import http from '@/utils/http'

function normalizePage(value) {
  const pageNumber = Number(value)
  return Number.isFinite(pageNumber) && pageNumber > 0 ? Math.floor(pageNumber) : 1
}

export function useFoodList({ limit = 9, withCategories = false } = {}) {
  const dataList = ref([])
  const loading = ref(true)
  const loadError = ref(false)
  const page = ref(1)
  const total = ref(0)
  const searchForm = reactive({ meishimingcheng: '', meishileibie: '' })
  const categories = ref([])
  let requestVersion = 0
  let activeController = null

  async function loadCategories() {
    if (!withCategories) return
    try {
      const { data } = await http({ url: 'meishijianshang/list?page=1&limit=1000', method: 'get' })
      if (data?.code === 0) {
        const set = new Set()
        ;(data.data.list || []).forEach(it => {
          if (it.meishileibie) set.add(String(it.meishileibie))
        })
        categories.value = Array.from(set)
      }
    } catch {}
  }

  async function getDataList(nextPage) {
    if (Number.isFinite(Number(nextPage)) && nextPage !== true) {
      page.value = normalizePage(nextPage)
    }

    const version = ++requestVersion
    activeController?.abort()
    const controller = new AbortController()
    activeController = controller
    loading.value = true
    loadError.value = false

    let url = `meishijianshang/list?page=${page.value}&limit=${limit}`
    if (searchForm.meishimingcheng) {
      url += `&meishimingcheng=${encodeURIComponent(searchForm.meishimingcheng)}`
    }
    if (searchForm.meishileibie) {
      url += `&meishileibie=${encodeURIComponent(searchForm.meishileibie)}`
    }

    try {
      const { data } = await http({ url, method: 'get', signal: controller.signal })
      if (version !== requestVersion || controller.signal.aborted) return false

      if (data?.code === 0) {
        dataList.value = data.data.list || []
        total.value = data.data.total || 0
        return true
      } else {
        loadError.value = true
        return false
      }
    } catch {
      if (version !== requestVersion || controller.signal.aborted) return false
      loadError.value = true
      return false
    } finally {
      if (version === requestVersion) {
        loading.value = false
        if (activeController === controller) activeController = null
      }
    }
  }

  function applyQueryState({ keyword = '', category = '', nextPage = 1 } = {}) {
    searchForm.meishimingcheng = String(keyword || '')
    searchForm.meishileibie = String(category || '')
    page.value = normalizePage(nextPage)
  }

  function search() {
    page.value = 1
    return getDataList()
  }

  function setCategory(cat) {
    searchForm.meishileibie = cat || ''
    return search()
  }

  function abortPending() {
    requestVersion += 1
    activeController?.abort()
    activeController = null
    loading.value = false
  }

  return {
    dataList,
    loading,
    loadError,
    page,
    limit,
    total,
    searchForm,
    categories,
    getDataList,
    search,
    setCategory,
    loadCategories,
    applyQueryState,
    abortPending
  }
}
