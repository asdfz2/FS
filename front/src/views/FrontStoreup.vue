<template>
  <PageShell>
    <PageHead
      eyebrow="COLLECTIONS"
      title="我的收藏"
      lead="收下的店 — 之后想去再点开。"
    />

    <div v-if="loading" class="grid">
      <div v-for="i in 6" :key="i" class="card card--skeleton">
        <div class="skeleton-image"></div>
        <div class="card-body">
          <div class="line" style="width: 80%"></div>
          <div class="line" style="width: 40%"></div>
        </div>
      </div>
    </div>

    <el-result
      v-else-if="loadError"
      icon="warning"
      :title="errorTitle"
      :sub-title="errorSub"
    >
      <template #extra>
        <button class="btn-text" @click="getList">重试</button>
      </template>
    </el-result>

    <template v-else>
      <div v-if="dataList.length" class="grid">
        <article v-for="item in dataList" :key="item.id" class="card">
          <div class="card-image">
            <el-image
              :src="resolveUploadUrl(item.picture ? item.picture.split(',')[0] : '')"
              fit="cover"
              lazy
            >
              <template #error>
                <div class="image-placeholder">暂无图片</div>
              </template>
            </el-image>
            <span class="card-pinned" aria-hidden="true">
              <ui-icon name="bookmark" :size="14" />
            </span>
          </div>
          <div class="card-body">
            <h3 class="card-name">{{ item.name }}</h3>
            <p class="card-time">
              <span class="muted">收于</span>
              <span>{{ formatRelative(item.addtime) || '刚刚' }}</span>
            </p>
            <div class="card-actions">
              <button class="btn-text" @click="goDetail(item.refid)">
                去看看 <ui-icon name="arrow_right" :size="14" />
              </button>
              <button class="btn-text btn-text--danger" @click="deleteStoreup(item.id)">
                取消
              </button>
            </div>
          </div>
        </article>
      </div>
      <EmptyState
        v-else
        :eyebrow="empty.eyebrow"
        :title="empty.title"
        :message="empty.message"
      >
        <template #action>
          <button class="btn-text" @click="$router.push('/front/meishijianshang')">
            去发现 <ui-icon name="arrow_right" :size="14" />
          </button>
        </template>
      </EmptyState>
    </template>
  </PageShell>
</template>

<script>
import PageHead from '@/components/ui/PageHead.vue'
import PageShell from '@/components/ui/PageShell.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import UiIcon from '@/components/ui/Icon.vue'
import { resolveUploadUrl } from '@/utils/utils'
import { formatRelative } from '@/utils/formatRelative'
import { c } from '@/utils/copy'

export default {
  components: { PageHead, PageShell, EmptyState, UiIcon },
  data() {
    return { dataList: [], loading: true, loadError: false }
  },
  computed: {
    empty() { return c('empty.storeup') },
    errorTitle() { return c('error.load').split(' — ')[0] },
    errorSub()  { return c('error.load').split(' — ')[1] }
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
    formatRelative,
    getList() {
      this.loading = true
      this.loadError = false
      return this.$http({ url: 'storeup/list?page=1&limit=100', method: 'get' })
        .then(({ data }) => {
          if (data && data.code === 0) this.dataList = data.data.list || []
          else this.loadError = true
        })
        .catch(() => { this.loadError = true })
        .finally(() => { this.loading = false })
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
.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}
.card {
  position: relative;
  display: flex; flex-direction: column;
  background: #fff;
  border: 0; border-radius: var(--r-2);
  overflow: hidden;
  box-shadow: var(--shadow-1);
  transition: box-shadow .2s ease, transform .2s ease;
  &:hover { box-shadow: var(--shadow-2); transform: translateY(-2px); }
}
.card-image {
  position: relative;
  aspect-ratio: 4 / 3;
  background: var(--paper-2);
  .el-image { width: 100%; height: 100%; }
}
.image-placeholder {
  display: flex; align-items: center; justify-content: center;
  width: 100%; height: 100%;
  color: var(--ink-mute);
  background: var(--paper-2);
  font-family: var(--font-display);
  font-size: 13px; letter-spacing: .14em; text-transform: uppercase;
}
.card-pinned {
  position: absolute; top: 12px; right: 12px;
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  background: var(--accent);
  color: #fff;
  border-radius: 50%;
}
.card-body { padding: 16px 20px 18px; display: flex; flex-direction: column; gap: 6px; }
.card-name {
  display: -webkit-box; overflow: hidden;
  margin: 0;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 17px; font-weight: 600;
  line-height: 1.3;
  -webkit-box-orient: vertical; -webkit-line-clamp: 1;
}
.card-time { margin: 0; display: inline-flex; gap: 6px; font-size: 12px; color: var(--ink); .muted { color: var(--ink-mute); } }
.card-actions { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid var(--rule); }
.btn-text {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 0;
  background: transparent; border: 0;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 12px; font-weight: 600;
  letter-spacing: .12em; text-transform: uppercase;
  border-bottom: 1px solid var(--ink);
  cursor: pointer;
  &:hover { color: var(--accent); border-bottom-color: var(--accent); }
  &--danger { color: var(--ink-mute); border-bottom-color: var(--rule); &:hover { color: var(--err); border-bottom-color: var(--err); } }
}

.card--skeleton { box-shadow: none; pointer-events: none; }
.skeleton-image {
  aspect-ratio: 4/3;
  background: var(--paper-3);
  background-image: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite linear;
}
.line {
  height: 12px; border-radius: 4px;
  background: var(--paper-3);
  background-image: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite linear;
  & + .line { margin-top: 8px; }
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 900px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 580px) { .grid { grid-template-columns: minmax(0, 1fr); } }
</style>
