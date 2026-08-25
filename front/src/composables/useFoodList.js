import { reactive, ref } from 'vue'
import http from '@/utils/http'

export function useFoodList({ limit = 9 } = {}) {
  const dataList = ref([])
  const loading = ref(true)
  const loadError = ref(false)
  const page = ref(1)
  const total = ref(0)
  const searchForm = reactive({ meishimingcheng: '' })

  async function getDataList(nextPage) {
    if (Number.isFinite(Number(nextPage)) && nextPage !== true) {
      page.value = Number(nextPage)
    }

    loading.value = true
    loadError.value = false
    let url = `meishijianshang/list?page=${page.value}&limit=${limit}`
    if (searchForm.meishimingcheng) {
      url += `&meishimingcheng=${encodeURIComponent(searchForm.meishimingcheng)}`
    }

    try {
      const { data } = await http({ url, method: 'get' })
      if (data?.code === 0) {
        dataList.value = data.data.list || []
        total.value = data.data.total || 0
      } else {
        loadError.value = true
      }
    } catch {
      loadError.value = true
    } finally {
      loading.value = false
    }
  }

  function search() {
    page.value = 1
    return getDataList()
  }

  return {
    dataList,
    loading,
    loadError,
    page,
    total,
    searchForm,
    getDataList,
    search
  }
}
