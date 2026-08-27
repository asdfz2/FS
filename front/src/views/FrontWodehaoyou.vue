<template>
  <PageShell>
    <PageHead
      eyebrow="FRIENDS"
      title="我的吃货圈"
      lead="在这里一起找好吃的人。"
    />

    <div v-if="loading" class="grid">
      <div v-for="i in 4" :key="i" class="card card--skeleton">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-line" style="width: 60%"></div>
        <div class="skeleton-line" style="width: 40%"></div>
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
          <div class="card-head">
            <div class="avatar">{{ avatarText(item.yonghuming) }}</div>
            <div class="card-id">
              <h3 class="card-name">{{ item.yonghuming || '未知用户' }}</h3>
              <p class="card-sub">{{ item.xingming || '未填写姓名' }}</p>
            </div>
          </div>
          <div class="card-body">
            <p class="card-meta">
              <span class="meta-label">加入时间</span>
              <span class="meta-value">{{ formatRelative(item.tianjiashijian) || '未知' }}</span>
            </p>
          </div>
          <div class="card-actions">
            <button class="btn-text btn-text--danger" @click="deleteFriend(item.id)">
              移除
            </button>
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
import { formatRelative } from '@/utils/formatRelative'
import { c } from '@/utils/copy'

export default {
  components: { PageHead, PageShell, EmptyState, UiIcon },
  data() { return { dataList: [], loading: true, loadError: false } },
  computed: {
    empty() { return c('empty.friends') },
    errorTitle() { return c('error.load').split(' — ')[0] },
    errorSub()  { return c('error.load').split(' — ')[1] }
  },
  mounted() {
    if (!this.$storage.get('Token')) {
      this.$router.push({ path: '/login', query: { redirect: '/front/wodehaoyou' } })
      return
    }
    this.getList()
  },
  methods: {
    formatRelative,
    getList() {
      this.loading = true
      this.loadError = false
      return this.$http({ url: 'wodehaoyou/list?page=1&limit=100', method: 'get' })
        .then(({ data }) => {
          if (data && data.code === 0) this.dataList = data.data.list || []
          else this.loadError = true
        })
        .catch(() => { this.loadError = true })
        .finally(() => { this.loading = false })
    },
    deleteFriend(id) {
      this.$confirm('确定移除该好友？', '提示', { type: 'warning' }).then(() => {
        return this.$http({ url: 'wodehaoyou/delete', method: 'post', data: [id] })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.$message.success('已移除')
          this.getList()
        }
      }).catch(() => {})
    },
    avatarText(value) { return String(value || '友').slice(0, 1).toUpperCase() }
  }
}
</script>

<style lang="scss" scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}
.card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px 24px;
  background: #fff;
  border: 0;
  border-radius: var(--r-2);
  box-shadow: var(--shadow-1);
  transition: box-shadow .2s ease, transform .2s ease;
  &:hover { box-shadow: var(--shadow-2); transform: translateY(-2px); }
}
.card-head { display: flex; align-items: center; gap: 14px; }
.avatar {
  flex: 0 0 56px; width: 56px; height: 56px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: var(--ink);
  color: var(--accent);
  font-family: var(--font-display);
  font-weight: 700; font-size: 22px;
  letter-spacing: -.02em;
}
.card-id { flex: 1; min-width: 0; }
.card-name {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 20px; font-weight: 600;
  letter-spacing: -.005em;
}
.card-sub { margin: 2px 0 0; color: var(--ink-soft); font-size: 13px; }

.card-body { padding: 0; }
.card-meta {
  margin: 0;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid var(--rule);
  .meta-label {
    font-family: var(--font-display);
    font-size: 11px; letter-spacing: .14em; text-transform: uppercase;
    color: var(--ink-mute);
  }
  .meta-value { color: var(--ink); font-size: 13px; }
}

.card-actions { display: flex; justify-content: flex-end; }
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
.skeleton-avatar {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--paper-3);
  background-image: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite linear;
}
.skeleton-line {
  height: 12px; border-radius: 4px;
  background: var(--paper-3);
  background-image: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite linear;
  & + .skeleton-line { margin-top: 8px; }
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 720px) { .grid { grid-template-columns: minmax(0, 1fr); } }
</style>
