<template>
  <div class="front-home">
    <section class="section">
      <header class="page-head">
        <p class="eyebrow">校园周边</p>
        <h1>发现身边的美食分享</h1>
      </header>

      <div class="search-bar">
        <el-input
          v-model="searchForm.meishimingcheng"
          class="search-input"
          placeholder="搜索美食名称"
          clearable
          @keyup.enter="search"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="search">搜索</el-button>
      </div>

      <FoodGrid
        :items="dataList"
        :loading="loading"
        :error="loadError"
        :skeleton-count="6"
        empty-text="暂时没有推荐美食"
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
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import FoodGrid from '@/components/front/FoodGrid.vue'
import { useFoodList } from '@/composables/useFoodList'

const router = useRouter()
const {
  dataList,
  loading,
  loadError,
  page,
  limit,
  total,
  searchForm,
  getDataList,
  search
} = useFoodList({ limit: 6 })

function goDetail(id) {
  router.push({ path: '/front/meishijianshang/detail', query: { id } })
}

onMounted(() => {
  getDataList()
})
</script>

<style lang="scss" scoped>
.section { max-width: 1240px; margin: 0 auto; padding: 34px 24px 46px; }
.page-head {
  margin-bottom: 22px;
  .eyebrow { margin: 0 0 4px; color: #008565; font-size: 14px; font-weight: 600; }
  h1 { margin: 0; color: #263238; font-size: 30px; letter-spacing: 0; line-height: 1.25; }
}
.search-bar {
  display: flex;
  gap: 10px;
  max-width: 560px;
  margin: 0 auto 28px;
  .search-input { flex: 1; }
}
.pagination {
  justify-content: center;
  padding: 30px 0 4px;
}

@media (max-width: 720px) {
  .section { padding: 24px 16px 36px; }
  .page-head h1 { font-size: 24px; }
  .search-bar { max-width: none; }
}
</style>
