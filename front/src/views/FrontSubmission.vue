<template>
  <PageShell>
    <PageHead
      eyebrow="CONTRIBUTOR"
      title="投稿中心"
      lead="分享校园周边的新发现。提交后由管理员审核，通过后进入公开列表。"
    >
      <template #actions>
        <div class="submission-stats" aria-label="投稿统计">
          <span><strong>{{ counts.pending }}</strong> 待审核</span>
          <span><strong>{{ counts.approved }}</strong> 已通过</span>
          <span><strong>{{ counts.rejected }}</strong> 需修改</span>
        </div>
      </template>
    </PageHead>

    <div class="submission-layout">
      <section class="editor-panel" aria-labelledby="editor-title">
        <div class="panel-heading">
          <div>
            <p class="panel-eyebrow">{{ editingId ? 'REVISION' : 'NEW POST' }}</p>
            <h2 id="editor-title">{{ editingId ? '修改并重新提交' : '分享一家店' }}</h2>
          </div>
          <button v-if="editingId" class="text-button" type="button" @click="resetForm">
            取消修改
          </button>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="submission-form"
        >
          <div class="form-grid">
            <el-form-item label="美食名称" prop="meishimingcheng">
              <el-input v-model="form.meishimingcheng" maxlength="50" show-word-limit />
            </el-form-item>
            <el-form-item label="类别" prop="meishileibie">
              <el-input v-model="form.meishileibie" placeholder="例如：地方小吃" />
            </el-form-item>
            <el-form-item label="推荐指数" prop="tuijianzhishu">
              <el-select v-model="form.tuijianzhishu" class="full-width">
                <el-option v-for="item in recommendations" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
            <el-form-item label="参考价格" prop="shangpinjiage">
              <el-input v-model="form.shangpinjiage" placeholder="例如：18.00" />
            </el-form-item>
          </div>

          <el-form-item label="商铺位置" prop="shangpusuozaidi">
            <el-input v-model="form.shangpusuozaidi" maxlength="100" />
          </el-form-item>

          <el-form-item label="推荐理由" prop="meishijieshao">
            <el-input
              v-model="form.meishijieshao"
              type="textarea"
              :rows="7"
              maxlength="1000"
              show-word-limit
              placeholder="写清口味、分量、价格和适合场景，不少于 20 字。"
            />
          </el-form-item>

          <el-form-item label="实拍图片">
            <file-upload
              action="upload"
              tip="最多 3 张，支持 JPG、PNG、WebP"
              :limit="3"
              :multiple="true"
              :file-urls="form.meishizhaopian"
              @change="handleImages"
            />
          </el-form-item>

          <div class="form-actions">
            <button class="primary-button" type="button" :disabled="submitting" @click="submit">
              {{ submitting ? '提交中…' : editingId ? '重新提交审核' : '提交审核' }}
            </button>
            <span class="submit-note">提交后可继续补充，审核过程中暂不能再次修改。</span>
          </div>
        </el-form>
      </section>

      <aside class="history-panel" aria-labelledby="history-title">
        <div class="panel-heading">
          <div>
            <p class="panel-eyebrow">HISTORY</p>
            <h2 id="history-title">我的投稿</h2>
          </div>
          <button class="icon-button" type="button" aria-label="刷新投稿" @click="loadMine">↻</button>
        </div>

        <div v-if="listLoading" class="history-loading">正在加载投稿记录…</div>
        <div v-else-if="!mine.length" class="history-empty">
          <p>还没有投稿。</p>
          <span>从左侧表单提交第一条校园美食记录。</span>
        </div>
        <div v-else class="history-list">
          <article v-for="item in mine" :key="item.id" class="history-item">
            <div class="history-top">
              <span class="status-pill" :class="`is-${item.auditStatus?.toLowerCase()}`">
                {{ statusLabel(item.auditStatus) }}
              </span>
              <span class="version">v{{ item.contentVersion || 1 }}</span>
            </div>
            <h3>{{ item.meishimingcheng }}</h3>
            <p class="history-meta">
              {{ item.meishileibie || '未分类' }} · {{ item.submitTime || item.fabushijian || '刚提交' }}
            </p>
            <p v-if="item.auditStatus === 'REJECTED'" class="reject-reason">
              审核意见：{{ item.auditReason || '未填写原因' }}
            </p>
            <button
              v-if="item.auditStatus === 'REJECTED'"
              class="text-button"
              type="button"
              @click="editRejected(item)"
            >
              修改并重新提交
            </button>
          </article>
        </div>
      </aside>
    </div>
  </PageShell>
</template>

<script>
import PageHead from '@/components/ui/PageHead.vue'
import PageShell from '@/components/ui/PageShell.vue'

const emptyForm = () => ({
  id: null,
  contentVersion: null,
  fabushijian: new Date().toISOString().slice(0, 10),
  meishimingcheng: '',
  meishileibie: '',
  meishijieshao: '',
  shangpusuozaidi: '',
  tuijianzhishu: '4星',
  meishizhaopian: '',
  shangpinjiage: '',
})

export default {
  components: { PageHead, PageShell },
  data() {
    return {
      recommendations: ['1星', '2星', '3星', '4星', '5星'],
      form: emptyForm(),
      mine: [],
      listLoading: true,
      submitting: false,
      editingId: null,
      rules: {
        meishimingcheng: [{ required: true, message: '请填写美食名称', trigger: 'blur' }],
        meishileibie: [{ required: true, message: '请填写美食类别', trigger: 'blur' }],
        shangpusuozaidi: [{ required: true, message: '请填写商铺位置', trigger: 'blur' }],
        meishijieshao: [
          { required: true, message: '请填写推荐理由', trigger: 'blur' },
          { min: 20, message: '推荐理由至少 20 个字', trigger: 'blur' },
        ],
      },
    }
  },
  computed: {
    counts() {
      return this.mine.reduce(
        (result, item) => {
          if (item.auditStatus === 'PENDING') result.pending += 1
          if (item.auditStatus === 'APPROVED') result.approved += 1
          if (item.auditStatus === 'REJECTED') result.rejected += 1
          return result
        },
        { pending: 0, approved: 0, rejected: 0 }
      )
    },
  },
  mounted() {
    this.loadMine()
  },
  methods: {
    statusLabel(status) {
      return {
        PENDING: '待审核',
        APPROVED: '已通过',
        REJECTED: '需修改',
      }[status] || '未知状态'
    },
    handleImages(value) {
      this.form.meishizhaopian = value
    },
    async loadMine() {
      this.listLoading = true
      try {
        const { data } = await this.$http({
          url: 'meishijianshang/mine?page=1&limit=100',
          method: 'get',
        })
        if (data?.code === 0) this.mine = data.data?.list || []
      } catch {
        this.$message.error('投稿记录加载失败')
      } finally {
        this.listLoading = false
      }
    },
    editRejected(item) {
      this.editingId = item.id
      this.form = {
        ...emptyForm(),
        ...item,
        id: item.id,
        contentVersion: item.contentVersion,
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    resetForm() {
      this.editingId = null
      this.form = emptyForm()
      this.$refs.formRef?.clearValidate()
    },
    submit() {
      this.$refs.formRef?.validate(async (valid) => {
        if (!valid || this.submitting) return
        this.submitting = true
        try {
          const { data } = await this.$http({
            url: this.editingId ? 'meishijianshang/resubmit' : 'meishijianshang/add',
            method: 'post',
            data: this.form,
          })
          if (data?.code !== 0) {
            this.$message.error(data?.msg || '提交失败')
            return
          }
          this.$message.success(this.editingId ? '已重新提交审核' : '投稿已提交审核')
          this.resetForm()
          await this.loadMine()
        } catch {
          this.$message.error('提交失败，请检查网络后重试')
        } finally {
          this.submitting = false
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.submission-stats {
  display: flex;
  gap: 18px;
  color: var(--ink-mute);
  font-size: 13px;
  strong {
    color: var(--ink);
    font-family: var(--font-display);
    font-size: 22px;
    margin-right: 4px;
  }
}

.submission-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(320px, .7fr);
  gap: 32px;
  align-items: start;
}

.editor-panel,
.history-panel {
  padding: 28px;
  background: #fff;
  border: 1px solid var(--rule);
  border-radius: var(--r-2);
}

.history-panel {
  position: sticky;
  top: 96px;
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
  h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 26px;
    color: var(--ink);
  }
}
.panel-eyebrow {
  margin: 0 0 6px;
  color: var(--accent);
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .18em;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 18px;
}
.full-width { width: 100%; }
.form-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 8px;
}
.primary-button {
  min-width: 150px;
  padding: 12px 24px;
  border: 0;
  border-radius: var(--r-1);
  background: var(--accent);
  color: #fff;
  font-family: var(--font-display);
  font-weight: 600;
  cursor: pointer;
  &:disabled { opacity: .55; cursor: not-allowed; }
}
.text-button,
.icon-button {
  border: 0;
  background: transparent;
  color: var(--ink-soft);
  text-decoration: underline;
  cursor: pointer;
}
.icon-button {
  width: 34px;
  height: 34px;
  border: 1px solid var(--rule);
  border-radius: 50%;
  text-decoration: none;
  font-size: 18px;
}
.submit-note {
  color: var(--ink-mute);
  font-size: 12px;
  line-height: 1.5;
}
.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 560px;
  overflow: auto;
  padding-right: 4px;
}
.history-item {
  padding: 16px;
  border: 1px solid var(--rule);
  border-radius: var(--r-1);
  background: var(--paper);
  h3 { margin: 10px 0 6px; font-size: 17px; }
}
.history-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.status-pill {
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--paper-2);
  color: var(--ink-soft);
  font-size: 11px;
  &.is-pending { color: var(--warn-deep); background: #fff2d8; }
  &.is-approved { color: var(--ok); background: #e2f3e8; }
  &.is-rejected { color: var(--err); background: #f9e4e2; }
}
.version,
.history-meta {
  color: var(--ink-mute);
  font-size: 12px;
}
.history-meta { margin: 0 0 10px; }
.reject-reason {
  margin: 10px 0;
  padding: 10px 12px;
  border-left: 2px solid var(--err);
  background: #fff7f6;
  color: var(--ink-soft);
  font-size: 13px;
  line-height: 1.6;
}
.history-loading,
.history-empty {
  padding: 40px 10px;
  color: var(--ink-mute);
  text-align: center;
  p { margin: 0 0 8px; color: var(--ink-soft); }
  span { font-size: 13px; }
}

@media (max-width: 980px) {
  .submission-layout { grid-template-columns: minmax(0, 1fr); }
  .history-panel { position: static; }
}
@media (max-width: 620px) {
  .editor-panel,
  .history-panel { padding: 20px; }
  .form-grid { grid-template-columns: minmax(0, 1fr); }
  .form-actions { align-items: flex-start; flex-direction: column; }
  .submission-stats { gap: 10px; }
}
</style>
