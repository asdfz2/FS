<template>
  <PageShell>
    <PageHead
      eyebrow="DISCOVER"
      :title="pageTitle"
      :lead="pageLead"
    >
      <template #actions>
        <div class="search-bar">
          <span class="search-icon" aria-hidden="true">
            <ui-icon name="search" :size="16" />
          </span>
          <input
            v-model="searchForm.meishimingcheng"
            class="search-input"
            type="text"
            :placeholder="searchPlaceholder"
            clearable
            @keyup.enter="search"
          />
          <button class="search-btn" @click="search">
            {{ searchLabel }}
            <ui-icon name="arrow_right" :size="14" />
          </button>
        </div>
      </template>
    </PageHead>

    <div v-if="categories.length" class="chip-row">
      <button
        class="chip"
        :class="{ 'is-active': !searchForm.meishileibie }"
        @click="setCategory('')"
      >
        全部
      </button>
      <button
        v-for="cat in categories"
        :key="cat"
        class="chip"
        :class="{ 'is-active': searchForm.meishileibie === cat }"
        @click="setCategory(cat)"
      >
        {{ cat }}
      </button>

      <div class="view-toggle" role="tablist" aria-label="视图切换">
        <button
          class="toggle-btn"
          :class="{ 'is-active': view === 'grid' }"
          @click="view = 'grid'"
          aria-label="网格"
        ><ui-icon name="layout_grid" :size="14" /></button>
        <button
          class="toggle-btn"
          :class="{ 'is-active': view === 'list' }"
          @click="view = 'list'"
          aria-label="列表"
        ><ui-icon name="layout_list" :size="14" /></button>
      </div>
    </div>

    <FoodGrid
      :items="dataList"
      :loading="loading"
      :error="loadError"
      :skeleton-count="6"
      :empty-text="empty.title"
      :view="view"
      @detail="goDetail"
      @retry="getDataList"
    />

    <el-pagination
      v-if="total > 0"
      @current-change="getDataList"
      v-model:current-page="page"
      :page-size="limit"
      layout="total, prev, pager, next, jumper"
      :total="total"
      class="pagination"
    />
  </PageShell>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHead from '@/components/ui/PageHead.vue'
import PageShell from '@/components/ui/PageShell.vue'
import UiIcon from '@/components/ui/Icon.vue'
import FoodGrid from '@/components/front/FoodGrid.vue'
import { useFoodList } from '@/composables/useFoodList'
import { c } from '@/utils/copy'

const router = useRouter()
const {
  dataList, loading, loadError, page, limit, total,
  searchForm, categories,
  getDataList, search, setCategory, loadCategories
} = useFoodList({ limit: 9, withCategories: true })

const view = ref('grid')

const pageTitle = computed(() => '发现身边的味道')
const pageLead = computed(() => '同学们最近在吃什么 — 一份持续更新的校园周边美食指南。')
const searchPlaceholder = computed(() => c('misc.search'))
const searchLabel = computed(() => c('cta.search'))
const empty = computed(() => c('empty.foodList'))

function goDetail(id) {
  router.push({ path: '/front/meishijianshang/detail', query: { id } })
}

onMounted(() => {
  getDataList()
  loadCategories()
})
</script>

<style lang="scss" scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 0;
  width: min(560px, 100%);
  border-bottom: 1px solid var(--ink);
  padding: 6px 0;
}
.search-icon { color: var(--ink-soft); display: inline-flex; }
.search-input {
  flex: 1;
  border: 0;
  background: transparent;
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--ink);
  padding: 8px 12px;
  outline: 0;
  &::placeholder { color: var(--ink-mute); }
}
.search-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 0;
  background: transparent;
  border: 0;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  cursor: pointer;
  &:hover { color: var(--accent); }
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: -8px 0 26px;
}
.chip {
  padding: 6px 14px;
  background: transparent;
  border: 1px solid var(--rule);
  border-radius: var(--r-pill);
  color: var(--ink-soft);
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: .06em;
  cursor: pointer;
  transition: color .15s ease, border-color .15s ease, background-color .15s ease;
  &:hover { color: var(--ink); border-color: var(--ink-mute); }
  &.is-active {
    color: #fff;
    background: var(--ink);
    border-color: var(--ink);
  }
}
.view-toggle {
  margin-left: auto;
  display: inline-flex;
  border: 1px solid var(--rule);
  border-radius: var(--r-1);
  overflow: hidden;
}
.toggle-btn {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border: 0;
  background: transparent;
  color: var(--ink-mute);
  cursor: pointer;
  & + .toggle-btn { border-left: 1px solid var(--rule); }
  &.is-active { color: var(--ink); background: var(--paper-2); }
  &:hover:not(.is-active) { color: var(--ink); }
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 36px 0 0;
}
</style>
