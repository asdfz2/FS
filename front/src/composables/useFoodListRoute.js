import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFoodList } from '@/composables/useFoodList'

const VALID_VIEWS = new Set(['grid', 'list'])

function firstQueryValue(value) {
  return Array.isArray(value) ? value[0] : value
}

function readText(value) {
  return String(firstQueryValue(value) || '').trim()
}

function readPage(value) {
  const page = Number(firstQueryValue(value))
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
}

function readView(value) {
  const view = String(firstQueryValue(value) || '')
  return VALID_VIEWS.has(view) ? view : 'grid'
}

function queryKey({ keyword, category, page, view }) {
  return JSON.stringify([keyword, category, page, view])
}

export function useFoodListRoute({ limit = 9, withCategories = true } = {}) {
  const route = useRoute()
  const router = useRouter()
  const list = useFoodList({ limit, withCategories })
  const view = ref('grid')

  let lastFetchKey = ''
  let lastScrollKey = ''
  let stopRouteWatch = null
  let scrollRemembered = false

  function scrollKeyFor(state) {
    return `food-list-scroll:${route.name || 'food-list'}:${queryKey(state)}`
  }

  function currentRouteState() {
    return {
      keyword: readText(route.query.keyword),
      category: readText(route.query.category),
      page: readPage(route.query.page),
      view: readView(route.query.view),
    }
  }

  function buildQuery(patch = {}) {
    const state = {
      ...currentRouteState(),
      ...patch,
    }
    const keyword = readText(state.keyword)
    const category = readText(state.category)
    const page = readPage(state.page)
    const nextView = readView(state.view)
    const query = {}

    if (keyword) query.keyword = keyword
    if (category) query.category = category
    if (page > 1) query.page = String(page)
    if (nextView !== 'grid') query.view = nextView

    return query
  }

  async function navigate(patch, { replace = false } = {}) {
    const location = { path: route.path, query: buildQuery(patch) }
    if (replace) await router.replace(location)
    else await router.push(location)
  }

  async function applyRoute() {
    const state = currentRouteState()
    list.applyQueryState({
      keyword: state.keyword,
      category: state.category,
      nextPage: state.page,
    })
    view.value = state.view

    const fetchKey = queryKey(state)
    if (fetchKey === lastFetchKey) return

    lastFetchKey = fetchKey
    lastScrollKey = scrollKeyFor(state)
    await list.getDataList(state.page)
    await nextTick()

    const savedScroll = Number(sessionStorage.getItem(lastScrollKey))
    if (Number.isFinite(savedScroll) && savedScroll > 0) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => window.scrollTo(0, savedScroll))
      })
    }
  }

  function start() {
    stopRouteWatch = watch(
      () => route.query,
      () => applyRoute(),
      { deep: true }
    )
    applyRoute()
    list.loadCategories()
  }

  function rememberScroll() {
    if (lastScrollKey) {
      sessionStorage.setItem(lastScrollKey, String(Math.max(0, Math.round(window.scrollY))))
      scrollRemembered = true
    }
  }

  function submitSearch() {
    return navigate({
      keyword: list.searchForm.meishimingcheng,
      page: 1,
    })
  }

  function selectCategory(category) {
    return navigate({
      category: category || '',
      page: 1,
    })
  }

  function changePage(nextPage) {
    return navigate({ page: readPage(nextPage) })
  }

  function setView(nextView) {
    if (!VALID_VIEWS.has(nextView)) return Promise.resolve()
    return navigate({ view: nextView }, { replace: true })
  }

  function reload() {
    lastFetchKey = ''
    return applyRoute()
  }

  onBeforeUnmount(() => {
    if (!scrollRemembered) rememberScroll()
    stopRouteWatch?.()
    list.abortPending()
  })

  return {
    ...list,
    view,
    start,
    reload,
    submitSearch,
    selectCategory,
    changePage,
    setView,
    rememberScroll
  }
}
