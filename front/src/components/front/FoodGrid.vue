<template>
  <div class="food-grid">
    <div v-if="loading" class="grid">
      <div v-for="item in skeletonCount" :key="item" class="food-card food-card--skeleton">
        <div class="skeleton-image"></div>
        <div class="card-body">
          <div class="skeleton-line" style="width:30%"></div>
          <div class="skeleton-line" style="width:78%"></div>
          <div class="skeleton-line" style="width:50%"></div>
        </div>
      </div>
    </div>

    <el-result
      v-else-if="error"
      icon="warning"
      :title="errorTitle"
      :sub-title="errorSub"
    >
      <template #extra>
        <button class="btn-text" @click="$emit('retry')">
          <ui-icon name="refresh" :size="14" />
          {{ retryText }}
        </button>
      </template>
    </el-result>

    <template v-else>
      <div v-if="items.length" class="grid">
        <article
          v-for="item in items"
          :key="item.id"
          class="food-card"
          :class="{ 'food-card--list': view === 'list' }"
        >
          <button class="image-button" type="button" @click="$emit('detail', item.id)">
            <div class="image-wrap">
              <el-image
                class="food-image"
                :src="firstImage(item)"
                fit="cover"
                lazy
              >
                <template #error>
                  <div class="image-placeholder">暂无图片</div>
                </template>
              </el-image>
              <span v-if="item.meishileibie" class="image-tag">{{ item.meishileibie }}</span>
              <span class="image-arrow" aria-hidden="true">↗</span>
            </div>
          </button>

          <div class="card-body">
            <h3 class="food-name">{{ item.meishimingcheng }}</h3>
            <p class="food-desc">{{ item.meishijieshao || '这家店还没有填写介绍。' }}</p>
            <div class="food-meta">
              <div class="meta-left">
                <span class="count">{{ item.clicknum || 0 }} 次浏览</span>
                <span class="dot" aria-hidden="true">·</span>
                <span class="author">{{ item.yonghuming || '匿名' }}</span>
              </div>
              <span class="price">¥{{ formatPrice(item.shangpinjiage) }}</span>
            </div>
          </div>
        </article>
      </div>

      <el-empty v-else :description="emptyText" :image-size="80" />
    </template>
  </div>
</template>

<script>
import { resolveUploadUrl } from '@/utils/utils'
import UiIcon from '@/components/ui/Icon.vue'
import { c } from '@/utils/copy'

export default {
  name: 'FoodGrid',
  components: { UiIcon },
  props: {
    items: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    error: { type: Boolean, default: false },
    skeletonCount: { type: Number, default: 6 },
    emptyText: { type: String, default: c('empty.foodList').title },
    view: { type: String, default: 'grid' }
  },
  emits: ['detail', 'retry'],
  computed: {
    errorTitle() { return c('error.load').split(' — ')[0] },
    errorSub()  { return c('error.load').split(' — ')[1] || c('error.network') },
    retryText() { return c('cta.retry') }
  },
  methods: {
    resolveUploadUrl,
    firstImage(item) {
      const pic = item.meishizhaopian ? item.meishizhaopian.split(',')[0] : ''
      return resolveUploadUrl(pic)
    },
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
  gap: 28px;
}

.food-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 0;
  border-radius: var(--r-2);
  overflow: hidden;
  box-shadow: var(--shadow-1);
  transition: box-shadow .2s ease, transform .2s ease;
  &:hover {
    box-shadow: var(--shadow-2);
    transform: translateY(-2px);
    .food-image { transform: scale(1.04); }
    .image-arrow { opacity: 1; transform: translate(0, 0); }
  }
}
.food-card--list {
  flex-direction: row;
  align-items: stretch;
  .image-button { flex: 0 0 38%; max-width: 38%; }
  .card-body { flex: 1; min-width: 0; padding: 22px 26px; }
}

.image-button {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
}
.image-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  background: var(--paper-2);
  overflow: hidden;
}
.food-image { display: block; width: 100%; height: 100%; transition: transform .35s ease; }

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--ink-mute);
  background: var(--paper-2);
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: .14em;
  text-transform: uppercase;
}
.image-tag {
  position: absolute;
  top: 14px; left: 14px;
  padding: 4px 10px;
  background: rgba(251, 247, 240, .92);
  color: var(--ink);
  border-radius: var(--r-pill);
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  backdrop-filter: blur(6px);
}
.image-arrow {
  position: absolute;
  top: 14px; right: 14px;
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  background: var(--accent);
  color: #fff;
  border-radius: 50%;
  font-family: var(--font-display);
  font-size: 16px;
  opacity: 0;
  transform: translate(-4px, 4px);
  transition: opacity .2s ease, transform .2s ease;
}

.card-body {
  padding: 18px 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.food-name {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -.005em;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}
.food-desc {
  display: -webkit-box;
  overflow: hidden;
  min-height: 38px;
  margin: 0;
  color: var(--ink-soft);
  font-size: 14px;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.food-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
  padding-top: 12px;
  border-top: 1px solid var(--rule);
}
.meta-left {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--ink-mute);
  font-size: 12px;
  .dot { color: var(--rule); }
}
.count { font-variant-numeric: tabular-nums; }
.author { color: var(--ink-soft); }
.price {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 20px;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
  letter-spacing: -.01em;
}

// —— Skeleton ——
.food-card--skeleton { box-shadow: none; pointer-events: none; }
.skeleton-image {
  aspect-ratio: 4 / 3;
  background: var(--paper-3);
  background-image: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite linear;
}
.skeleton-line {
  height: 12px;
  background: var(--paper-3);
  border-radius: 4px;
  background-image: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite linear;
}
.skeleton-line + .skeleton-line { margin-top: 8px; }
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.btn-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
  background: transparent;
  border: 0;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  border-bottom: 1px solid var(--ink);
  cursor: pointer;
  &:hover { color: var(--accent); border-bottom-color: var(--accent); }
}

@media (max-width: 980px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 620px) {
  .grid { grid-template-columns: minmax(0, 1fr); gap: 20px; }
  .food-card--list { flex-direction: column; .image-button { flex: 0 0 auto; max-width: none; } }
}
</style>
