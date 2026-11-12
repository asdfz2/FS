<template>
  <section class="review-center">
    <header class="review-heading">
      <div>
        <p class="eyebrow">MODERATION</p>
        <h1>内容审核</h1>
        <p class="lead">核对投稿内容、通过或驳回，并保留每次审核记录。</p>
      </div>
      <button class="refresh-button" type="button" :disabled="loading" @click="loadAll">
        {{ loading ? '刷新中…' : '刷新数据' }}
      </button>
    </header>

    <div class="summary-grid">
      <article v-for="item in summaryCards" :key="item.value" class="summary-card">
        <span>{{ item.label }}</span>
        <strong>{{ summaryLoading ? '—' : (summary[item.value] || 0) }}</strong>
      </article>
    </div>

    <section class="review-panel">
      <div class="toolbar">
        <div class="status-tabs" role="tablist" aria-label="审核状态">
          <button
            v-for="tab in statusTabs"
            :key="tab.value"
            type="button"
            role="tab"
            :aria-selected="activeStatus === tab.value"
            :class="{ 'is-active': activeStatus === tab.value }"
            @click="changeStatus(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="search-box">
          <input v-model="keyword" type="search" placeholder="搜索美食名称" @keyup.enter="loadRecords" />
          <button type="button" @click="loadRecords">搜索</button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="records"
        row-key="id"
        class="review-table"
        empty-text="当前筛选条件下没有投稿"
      >
        <el-table-column prop="meishimingcheng" label="内容" min-width="180">
          <template #default="{ row }">
            <div class="content-cell">
              <strong>{{ row.meishimingcheng }}</strong>
              <span>{{ row.meishileibie || '未分类' }} · {{ row.shangpusuozaidi || '未填写位置' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="yonghuming" label="投稿人" width="120" />
        <el-table-column prop="contentVersion" label="版本" width="80">
          <template #default="{ row }">v{{ row.contentVersion || 1 }}</template>
        </el-table-column>
        <el-table-column prop="submitTime" label="提交时间" min-width="170" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <span class="status-tag" :class="`is-${row.auditStatus?.toLowerCase()}`">
              {{ statusLabel(row.auditStatus) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <button class="row-button" type="button" @click="openReview(row)">
              {{ row.auditStatus === 'PENDING' ? '开始审核' : '查看详情' }}
            </button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-drawer
      v-model="drawerVisible"
      title="投稿审核详情"
      size="620px"
      destroy-on-close
      @closed="selected = null"
    >
      <div v-if="selected" class="review-drawer">
        <div class="drawer-title">
          <div>
            <p class="drawer-eyebrow">{{ selected.meishileibie || '未分类' }}</p>
            <h2>{{ selected.meishimingcheng }}</h2>
          </div>
          <span class="status-tag" :class="`is-${selected.auditStatus?.toLowerCase()}`">
            {{ statusLabel(selected.auditStatus) }}
          </span>
        </div>

        <dl class="meta-grid">
          <div><dt>投稿人</dt><dd>{{ selected.yonghuming || '未知' }}</dd></div>
          <div><dt>版本</dt><dd>v{{ selected.contentVersion || 1 }}</dd></div>
          <div><dt>价格</dt><dd>¥{{ selected.shangpinjiage || '未填写' }}</dd></div>
          <div><dt>推荐指数</dt><dd>{{ selected.tuijianzhishu || '未填写' }}</dd></div>
          <div><dt>位置</dt><dd>{{ selected.shangpusuozaidi || '未填写' }}</dd></div>
          <div><dt>提交时间</dt><dd>{{ selected.submitTime || '未知' }}</dd></div>
        </dl>

        <section class="content-section">
          <h3>内容预览</h3>
          <div class="preview-images">
            <el-image
              v-for="image in selectedImages"
              :key="image"
              :src="image"
              fit="cover"
              :preview-src-list="selectedImages"
            />
          </div>
          <div class="rich-preview" v-html="sanitizedDescription"></div>
        </section>

        <section class="content-section">
          <h3>审核记录</h3>
          <div v-if="logsLoading" class="muted">正在加载审核记录…</div>
          <ol v-else-if="auditLogs.length" class="audit-timeline">
            <li v-for="log in auditLogs" :key="log.id">
              <span class="timeline-dot" aria-hidden="true"></span>
              <div>
                <strong>{{ statusLabel(log.action) }}</strong>
                <p>{{ log.operator }} · {{ log.createdAt }} · v{{ log.contentVersion }}</p>
                <blockquote v-if="log.reason">{{ log.reason }}</blockquote>
              </div>
            </li>
          </ol>
          <p v-else class="muted">尚无审核记录。</p>
        </section>

        <section v-if="selected.auditStatus === 'PENDING'" class="review-actions">
          <label for="review-reason">审核意见</label>
          <textarea
            id="review-reason"
            v-model="reviewReason"
            rows="4"
            maxlength="500"
            placeholder="通过时可留空；驳回时必须说明可执行的修改建议。"
          ></textarea>
          <div class="action-row">
            <button class="approve-button" type="button" :disabled="reviewing" @click="review('APPROVE')">
              通过并发布
            </button>
            <button class="reject-button" type="button" :disabled="reviewing" @click="review('REJECT')">
              驳回并退回修改
            </button>
          </div>
        </section>
      </div>
    </el-drawer>
  </section>
</template>

<script>
import { resolveUploadUrl } from '@/utils/utils'
import { sanitizeHtml } from '@/utils/sanitize'

const statusTabs = [
  { value: 'PENDING', label: '待审核' },
  { value: 'APPROVED', label: '已通过' },
  { value: 'REJECTED', label: '已驳回' },
  { value: 'ALL', label: '全部' },
]

export default {
  data() {
    return {
      statusTabs,
      activeStatus: 'PENDING',
      keyword: '',
      records: [],
      summary: { PENDING: 0, APPROVED: 0, REJECTED: 0 },
      summaryLoading: true,
      loading: false,
      selected: null,
      drawerVisible: false,
      auditLogs: [],
      logsLoading: false,
      reviewReason: '',
      reviewing: false,
    }
  },
  computed: {
    summaryCards() {
      return statusTabs.slice(0, 3)
    },
    selectedImages() {
      return String(this.selected?.meishizhaopian || '')
        .split(',')
        .filter(Boolean)
        .map(resolveUploadUrl)
    },
    sanitizedDescription() {
      return sanitizeHtml(this.selected?.meishijieshao) || '<p>暂无内容介绍。</p>'
    },
  },
  mounted() {
    this.loadAll()
  },
  methods: {
    statusLabel(status) {
      return {
        PENDING: '待审核',
        APPROVED: '已通过',
        REJECTED: '已驳回',
      }[status] || status || '未知'
    },
    buildPageUrl(status, limit = 100) {
      const params = new URLSearchParams({ page: '1', limit: String(limit) })
      if (status && status !== 'ALL') params.set('auditStatus', status)
      if (this.keyword.trim()) params.set('meishimingcheng', this.keyword.trim())
      return `meishijianshang/page?${params.toString()}`
    },
    async loadAll() {
      await Promise.all([this.loadRecords(), this.loadSummary()])
    },
    async loadSummary() {
      this.summaryLoading = true
      const statuses = ['PENDING', 'APPROVED', 'REJECTED']
      try {
        const results = await Promise.all(
          statuses.map(async (status) => {
            const { data } = await this.$http({
              url: this.buildPageUrl(status, 1),
              method: 'get',
            })
            return [status, data?.data?.total || 0]
          })
        )
        this.summary = Object.fromEntries(results)
      } catch {
        this.$message.error('审核统计加载失败')
      } finally {
        this.summaryLoading = false
      }
    },
    async loadRecords() {
      this.loading = true
      try {
        const { data } = await this.$http({
          url: this.buildPageUrl(this.activeStatus),
          method: 'get',
        })
        if (data?.code === 0) this.records = data.data?.list || []
      } catch {
        this.$message.error('审核列表加载失败')
      } finally {
        this.loading = false
      }
    },
    changeStatus(status) {
      this.activeStatus = status
      this.loadRecords()
    },
    async openReview(row) {
      this.selected = { ...row }
      this.reviewReason = ''
      this.drawerVisible = true
      await this.loadLogs(row.id)
    },
    async loadLogs(id) {
      this.logsLoading = true
      try {
        const { data } = await this.$http({
          url: `meishijianshang/auditLogs/${id}`,
          method: 'get',
        })
        this.auditLogs = data?.data || []
      } catch {
        this.auditLogs = []
      } finally {
        this.logsLoading = false
      }
    },
    async review(action) {
      if (action === 'REJECT' && !this.reviewReason.trim()) {
        this.$message.warning('驳回时必须填写审核意见')
        return
      }
      this.reviewing = true
      try {
        const { data } = await this.$http({
          url: 'meishijianshang/review',
          method: 'post',
          data: {
            id: this.selected.id,
            contentVersion: this.selected.contentVersion,
            action,
            reason: this.reviewReason,
          },
        })
        if (data?.code !== 0) {
          this.$message.error(data?.msg || '审核失败')
          if (data?.code === 409) await this.loadAll()
          return
        }
        this.$message.success(action === 'APPROVE' ? '已通过并发布' : '已驳回并退回修改')
        this.drawerVisible = false
        await this.loadAll()
      } catch {
        this.$message.error('审核请求失败，请重试')
      } finally {
        this.reviewing = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.review-center { color: var(--ink); }
.review-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  h1 {
    margin: 4px 0 8px;
    font-family: var(--font-display);
    font-size: 34px;
  }
}
.eyebrow,
.drawer-eyebrow {
  margin: 0;
  color: var(--accent);
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .18em;
}
.lead { margin: 0; color: var(--ink-mute); }
.refresh-button,
.row-button {
  padding: 9px 15px;
  border: 1px solid var(--rule);
  border-radius: var(--r-1);
  background: #fff;
  color: var(--ink);
  cursor: pointer;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin: 26px 0;
}
.summary-card {
  padding: 18px 20px;
  border: 1px solid var(--rule);
  border-radius: var(--r-2);
  background: #fff;
  span { color: var(--ink-mute); font-size: 12px; }
  strong {
    display: block;
    margin-top: 6px;
    font-family: var(--font-display);
    font-size: 30px;
  }
}
.review-panel {
  padding: 20px;
  border: 1px solid var(--rule);
  border-radius: var(--r-2);
  background: #fff;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}
.status-tabs {
  display: flex;
  gap: 4px;
  button {
    padding: 8px 14px;
    border: 1px solid var(--rule);
    background: transparent;
    color: var(--ink-soft);
    cursor: pointer;
    &.is-active { background: var(--ink); border-color: var(--ink); color: #fff; }
  }
}
.search-box {
  display: flex;
  border-bottom: 1px solid var(--ink);
  input { width: 220px; border: 0; padding: 8px; outline: 0; background: transparent; }
  button { border: 0; background: transparent; font-weight: 600; cursor: pointer; }
}
.content-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  span { color: var(--ink-mute); font-size: 12px; }
}
.status-tag {
  display: inline-flex;
  padding: 4px 9px;
  border-radius: 999px;
  background: var(--paper-2);
  font-size: 11px;
  &.is-pending { color: var(--warn-deep); background: #fff2d8; }
  &.is-approved { color: var(--ok); background: #e2f3e8; }
  &.is-rejected { color: var(--err); background: #f9e4e2; }
}
.review-drawer { display: flex; flex-direction: column; gap: 24px; }
.drawer-title {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  h2 { margin: 4px 0 0; font-family: var(--font-display); font-size: 28px; }
}
.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  background: var(--rule);
  border: 1px solid var(--rule);
  div { padding: 14px; background: var(--paper); }
  dt { color: var(--ink-mute); font-size: 11px; }
  dd { margin: 5px 0 0; color: var(--ink); font-size: 14px; }
}
.content-section {
  h3 { margin: 0 0 12px; font-size: 17px; }
}
.preview-images {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 16px;
  :deep(.el-image) { aspect-ratio: 4 / 3; border-radius: var(--r-1); }
}
.rich-preview {
  color: var(--ink-soft);
  line-height: 1.8;
  :deep(img) { max-width: 100%; height: auto; }
}
.audit-timeline {
  display: flex;
  flex-direction: column;
  gap: 14px;
  list-style: none;
  margin: 0;
  padding: 0;
  li { display: flex; gap: 12px; }
  p { margin: 4px 0; color: var(--ink-mute); font-size: 12px; }
  blockquote { margin: 8px 0 0; padding: 10px 12px; background: var(--paper); border-left: 2px solid var(--accent); }
}
.timeline-dot {
  flex: 0 0 9px;
  width: 9px;
  height: 9px;
  margin-top: 6px;
  border-radius: 50%;
  background: var(--accent);
}
.review-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid var(--rule);
  label { font-weight: 600; }
  textarea {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid var(--rule);
    border-radius: var(--r-1);
    resize: vertical;
    font-family: var(--font-body);
  }
}
.action-row { display: flex; gap: 10px; }
.approve-button,
.reject-button {
  padding: 10px 16px;
  border: 0;
  border-radius: var(--r-1);
  color: #fff;
  cursor: pointer;
}
.approve-button { background: var(--ok); }
.reject-button { background: var(--err); }
.muted { color: var(--ink-mute); font-size: 13px; }

@media (max-width: 860px) {
  .review-heading,
  .toolbar { align-items: flex-start; flex-direction: column; }
  .summary-grid { grid-template-columns: minmax(0, 1fr); }
  .search-box { width: 100%; input { flex: 1; width: auto; } }
}
</style>
