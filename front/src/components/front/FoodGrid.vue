<template>
  <div class="food-grid">
    <div v-if="loading" class="grid">
      <div v-for="item in skeletonCount" :key="item" class="food-card skeleton-card">
        <el-skeleton animated>
          <template #template>
            <el-skeleton-item variant="image" style="width:100%;height:220px" />
            <div class="card-body">
              <el-skeleton-item variant="h3" style="width:62%" />
              <el-skeleton-item variant="text" style="width:100%" />
              <el-skeleton-item variant="text" style="width:48%" />
            </div>
          </template>
        </el-skeleton>
      </div>
    </div>

    <el-result
      v-else-if="error"
      icon="warning"
      title="内容加载失败"
      sub-title="请检查网络或后端服务后重试"
    >
      <template #extra>
        <el-button type="primary" @click="$emit('retry')">
          <el-icon><RefreshRight /></el-icon>
          重试
        </el-button>
      </template>
    </el-result>

    <template v-else>
      <div v-if="items.length" class="grid">
        <article v-for="item in items" :key="item.id" class="food-card">
          <button class="image-button" type="button" @click="$emit('detail', item.id)">
            <el-image
              class="food-image"
              :src="resolveUploadUrl(item.meishizhaopian ? item.meishizhaopian.split(',')[0] : '')"
              fit="cover"
              lazy
            >
              <template #error>
                <div class="image-placeholder">暂无图片</div>
              </template>
            </el-image>
          </button>

          <div class="card-body">
            <h3 class="food-name">{{ item.meishimingcheng }}</h3>
            <p class="food-desc">{{ item.meishijieshao || '这家店还没有填写介绍。' }}</p>
            <div class="food-meta">
              <span class="price">¥{{ formatPrice(item.shangpinjiage) }}</span>
              <span class="count">{{ item.clicknum || 0 }} 次浏览</span>
            </div>
            <el-button class="detail-button" type="primary" plain @click="$emit('detail', item.id)">
              查看详情
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </article>
      </div>

      <el-empty v-else :description="emptyText" />
    </template>
  </div>
</template>

<script>
import { ArrowRight, RefreshRight } from '@element-plus/icons-vue'
import { resolveUploadUrl } from '@/utils/utils'

export default {
  name: 'FoodGrid',
  components: { ArrowRight, RefreshRight },
  props: {
    items: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    error: { type: Boolean, default: false },
    skeletonCount: { type: Number, default: 6 },
    emptyText: { type: String, default: '暂无美食数据' }
  },
  emits: ['detail', 'retry'],
  methods: {
    resolveUploadUrl,
    formatPrice(value) {
      const price = Number(value || 0)
      return Number.isFinite(price) ? price.toFixed(2) : '0.00'
    }
  }
}
</script>

<style lang="scss" scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.food-card,
.skeleton-card {
  overflow: hidden;
  background: #fff;
  border: 1px solid #e7ece9;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(31,45,39,.05);
  transition: transform .2s ease, box-shadow .2s ease;
}

.food-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(31,45,39,.09);
}

.image-button {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  cursor: pointer;
  background: transparent;
}

.food-image {
  display: block;
  width: 100%;
  height: 220px;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 220px;
  color: #9aa7a1;
  background: #eef2f0;
}

.card-body {
  padding: 16px;
}

.food-name {
  display: -webkit-box;
  overflow: hidden;
  margin: 0 0 7px;
  color: #263238;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.food-desc {
  display: -webkit-box;
  overflow: hidden;
  min-height: 42px;
  margin: 0 0 14px;
  color: #75827c;
  font-size: 14px;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.food-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.price {
  color: #d64541;
  font-size: 19px;
  font-weight: 700;
}

.count {
  color: #8b978f;
  font-size: 12px;
}

.detail-button {
  width: 100%;
}

@media (max-width: 900px) {
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 580px) {
  .grid { grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .food-image,
  .image-placeholder { height: 200px; }
}
</style>
