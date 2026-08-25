<template>
  <div class="front-storeup">
    <section class="section">
      <header class="page-head">
        <p class="eyebrow">个人空间</p>
        <h1>我的收藏</h1>
      </header>

      <div v-if="loading" class="grid">
        <div v-for="item in 6" :key="item" class="food-card">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="image" style="width:100%;height:190px" />
              <div style="padding:16px">
                <el-skeleton-item variant="h3" style="width:58%" />
              </div>
            </template>
          </el-skeleton>
        </div>
      </div>

      <el-result v-else-if="loadError" icon="warning" title="收藏加载失败" sub-title="请稍后重试">
        <template #extra>
          <el-button type="primary" @click="getList">重试</el-button>
        </template>
      </el-result>

      <template v-else>
        <div v-if="dataList.length" class="grid">
          <article v-for="item in dataList" :key="item.id" class="food-card">
            <el-image
              class="food-image"
              :src="resolveUploadUrl(item.picture ? item.picture.split(',')[0] : '')"
              fit="cover"
              lazy
            >
              <template #error>
                <div class="image-placeholder">暂无图片</div>
              </template>
            </el-image>
            <div class="card-body">
              <h3>{{ item.name }}</h3>
              <div class="actions">
                <el-button type="primary" plain @click="goDetail(item.refid)">
<el-icon><ViewIcon /></el-icon>
                  查看
                </el-button>
                <el-button type="danger" plain @click="deleteStoreup(item.id)">
                  <el-icon><Delete /></el-icon>
                  取消
                </el-button>
              </div>
            </div>
          </article>
        </div>
        <el-empty v-else description="还没有收藏内容" />
      </template>
    </section>
  </div>
</template>

<script>
import { Delete, View as ViewIcon } from '@element-plus/icons-vue'
import { resolveUploadUrl } from '@/utils/utils'

export default {
  components: { Delete, ViewIcon },
  data() {
    return { dataList: [], loading: true, loadError: false }
  },
  mounted() {
    const token = this.$storage.get('Token')
    if (!token) {
      this.$router.push({ path: '/login', query: { redirect: '/front/storeup' } })
      return
    }
    this.getList()
  },
  methods: {
    resolveUploadUrl,
    getList() {
      this.loading = true
      this.loadError = false
      return this.$http({
        url: 'storeup/list?page=1&limit=100',
        method: 'get'
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.dataList = data.data.list || []
        } else {
          this.loadError = true
        }
      }).catch(() => {
        this.loadError = true
      }).finally(() => {
        this.loading = false
      })
    },
    goDetail(refid) {
      this.$router.push({ path: '/front/meishijianshang/detail', query: { id: refid } })
    },
    deleteStoreup(id) {
      this.$confirm('确定取消收藏？', '提示', { type: 'warning' }).then(() => {
        return this.$http({ url: 'storeup/delete', method: 'post', data: [id] })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.$message.success('已取消收藏')
          this.getList()
        }
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.section {
  max-width: 1240px;
  margin: 0 auto;
  padding: 34px 24px 46px;
}

.page-head {
  margin-bottom: 24px;

  .eyebrow { margin: 0 0 4px; color: #008565; font-size: 14px; font-weight: 600; }
  h1 { margin: 0; color: #263238; font-size: 30px; }
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.food-card {
  overflow: hidden;
  background: #fff;
  border: 1px solid #e7ece9;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(31,45,39,.05);
}

.food-image { display: block; width: 100%; height: 190px; }
.image-placeholder { display: flex; align-items: center; justify-content: center; height: 190px; color: #9aa7a1; background: #eef2f0; }
.card-body { padding: 15px; }
.card-body h3 { display: -webkit-box; overflow: hidden; margin: 0 0 13px; color: #263238; font-size: 17px; -webkit-box-orient: vertical; -webkit-line-clamp: 1; }
.actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
.actions :deep(.el-button) { width: 100%; margin-left: 0; }

@media (max-width: 900px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 580px) {
  .section { padding: 24px 16px 36px; }
  .grid { grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .page-head h1 { font-size: 24px; }
}
</style>
