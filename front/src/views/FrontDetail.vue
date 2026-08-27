<template>
  <PageShell>
    <div v-if="pageLoading" class="detail-loading">
      <div class="loading-title"></div>
      <div class="loading-grid">
        <div class="loading-image"></div>
        <div class="loading-side">
          <div class="line" style="width:90%"></div>
          <div class="line" style="width:72%"></div>
          <div class="line" style="width:48%"></div>
        </div>
      </div>
    </div>

    <el-result
      v-else-if="loadError || !detailData.id"
      icon="warning"
      :title="notFoundTitle"
      :sub-title="notFoundSub"
    >
      <template #extra>
        <button class="btn-text" @click="goBack">返回列表</button>
        <button class="btn-primary" @click="reload">重试</button>
      </template>
    </el-result>

    <article v-else class="detail-article">
      <header class="detail-header">
        <p class="eyebrow">
          <span class="dot" aria-hidden="true"></span>
          DETAIL · {{ detailData.meishileibie || '美食' }}
        </p>
        <h1 class="detail-title">{{ detailData.meishimingcheng }}</h1>
        <p class="detail-meta">
          <span>{{ detailData.yonghuming || '匿名' }}</span>
          <span class="dot" aria-hidden="true">·</span>
          <span>{{ formatRelative(detailData.fabushijian) || '未知时间' }}</span>
          <span class="dot" aria-hidden="true">·</span>
          <span>{{ detailData.clicknum || 0 }} 次浏览</span>
        </p>
      </header>

      <div class="detail-body">
        <div class="detail-image-wrap">
          <el-image
            class="detail-image"
            :src="firstImage"
            fit="cover"
            :preview-src-list="[firstImage]"
            preview-teleported
          >
            <template #error>
              <div class="image-placeholder">暂无图片</div>
            </template>
          </el-image>
        </div>

        <aside class="detail-side">
          <p class="price-eyebrow">PRICE</p>
          <p class="price-value">¥{{ formatPrice(detailData.shangpinjiage) }}</p>

          <dl class="info-list">
            <div><dt>类别</dt><dd>{{ detailData.meishileibie || '未填写' }}</dd></div>
            <div><dt>位置</dt><dd>{{ detailData.shangpusuozaidi || '未填写' }}</dd></div>
            <div><dt>发布</dt><dd>{{ detailData.fabushijian || '未知' }}</dd></div>
            <div><dt>分享人</dt><dd>{{ detailData.yonghuming || '匿名' }}</dd></div>
          </dl>

          <div class="side-actions">
            <button
              class="round-btn"
              :class="{ 'is-active': isThumb }"
              :disabled="actionLoading || !isLogin"
              @click="thumbUp"
              aria-label="点赞"
            >
              <ui-icon name="thumb_up" :size="18" />
              <span class="badge">{{ detailData.thumbsupnum || 0 }}</span>
            </button>
            <button
              class="round-btn"
              :class="{ 'is-active-d': isCrazy }"
              :disabled="actionLoading || !isLogin"
              @click="crazy"
              aria-label="踩"
            >
              <ui-icon name="thumb_down" :size="18" />
              <span class="badge">{{ detailData.crazilynum || 0 }}</span>
            </button>
            <button
              class="round-btn"
              :class="{ 'is-active': isCollected }"
              :disabled="actionLoading || !isLogin"
              @click="collect"
              aria-label="收藏"
            >
              <ui-icon :name="isCollected ? 'star_filled' : 'star'" :size="18" />
            </button>
            <button
              class="round-btn"
              :class="{ 'is-active': isFriend }"
              :disabled="actionLoading || isFriend || !isLogin"
              @click="addFriend"
              aria-label="加好友"
            >
              <ui-icon name="plus" :size="18" />
            </button>
            <button
              class="link-btn"
              :class="{ 'is-disabled': !isLogin }"
              @click="isLogin ? addFriend() : goLogin()"
            >
              {{ isFriend ? '已是好友' : isLogin ? '加入吃货圈' : '登录后互动' }}
            </button>
          </div>
        </aside>
      </div>

      <section class="intro-section">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span>关于这家</p>
        <div class="intro" v-html="sanitizedIntro"></div>
      </section>

      <section class="comment-section">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span>评论区 · {{ commentList.length }}</p>

        <div v-if="isLogin" class="comment-editor">
          <textarea
            v-model="commentContent"
            class="comment-input"
            :rows="3"
            maxlength="300"
            placeholder="说说你的用餐体验..."
          ></textarea>
          <div class="editor-actions">
            <span class="char-count">{{ commentContent.length }} / 300</span>
            <button class="btn-primary" :disabled="commentSubmitting" @click="submitComment">
              {{ commentSubmitting ? '发送中…' : '发出去' }}
            </button>
          </div>
        </div>
        <div v-else class="comment-locked">
          <span>{{ toastLogin }}</span>
          <button class="link-btn" @click="goLogin">立即登录</button>
        </div>

        <ul v-if="commentList.length" class="comment-list">
          <li v-for="(item, index) in commentList" :key="item.id || index" class="comment-item">
            <div class="avatar">{{ avatarText(item) }}</div>
            <div class="comment-main">
              <div class="comment-header">
                <span class="comment-user">{{ item.nickname || item.userid || '匿名用户' }}</span>
                <span class="comment-time">{{ formatRelative(item.addtime) || '' }}</span>
              </div>
              <p class="comment-content">{{ item.content }}</p>
              <div v-if="item.reply" class="comment-reply">
                <strong>回复 ·</strong>{{ item.reply }}
              </div>
            </div>
          </li>
        </ul>
        <p v-else class="comment-empty">还没有评论 — 来聊两句。</p>
      </section>
    </article>
  </PageShell>
</template>

<script>
import PageShell from '@/components/ui/PageShell.vue'
import UiIcon from '@/components/ui/Icon.vue'
import { resolveUploadUrl } from '@/utils/utils'
import { sanitizeHtml } from '@/utils/sanitize'
import { formatRelative } from '@/utils/formatRelative'
import { c } from '@/utils/copy'

export default {
  components: { PageShell, UiIcon },
  data() {
    return {
      detailData: {},
      pageLoading: true,
      loadError: false,
      isLogin: false,
      isThumb: false,
      isCrazy: false,
      isCollected: false,
      isFriend: false,
      actionLoading: false,
      commentContent: '',
      commentSubmitting: false,
      commentList: [],
      collectId: null
    }
  },
  computed: {
    sanitizedIntro() {
      return sanitizeHtml(this.detailData.meishijieshao) || '<p>暂无介绍</p>'
    },
    firstImage() {
      const picture = this.detailData.meishizhaopian
      return resolveUploadUrl(picture ? picture.split(',')[0] : '')
    },
    notFoundTitle() { return '内容走丢了' },
    notFoundSub()  { return c('error.notFound') },
    toastLogin()   { return c('toast.loginToAct') }
  },
  mounted() {
    this.isLogin = !!this.$storage.get('Token')
    if (this.$route.query.id) {
      this.getDetail()
      this.getComment()
      if (this.isLogin) {
        this.checkCollect()
        this.checkFriend()
      }
    } else {
      this.pageLoading = false
    }
  },
  methods: {
    formatRelative,
    getDetail() {
      this.pageLoading = true
      this.loadError = false
      return this.$http({
        url: `meishijianshang/info/${this.$route.query.id}`,
        method: 'get'
      }).then(({ data }) => {
        if (data && data.code === 0 && data.data) this.detailData = data.data
        else this.loadError = true
      }).catch(() => { this.loadError = true })
        .finally(() => { this.pageLoading = false })
    },
    reload() {
      if (!this.$route.query.id) return
      this.getDetail()
      this.getComment()
    },
    getComment() {
      return this.$http({
        url: `discussmeishijianshang/list?page=1&limit=100&refid=${this.$route.query.id}`,
        method: 'get'
      }).then(({ data }) => {
        if (data && data.code === 0) this.commentList = data.data.list || []
      }).catch(() => {})
    },
    checkCollect() {
      return this.$http({
        url: `storeup/list?page=1&limit=1&refid=${this.$route.query.id}&tablename=meishijianshang`,
        method: 'get'
      }).then(({ data }) => {
        if (data && data.code === 0 && data.data.list && data.data.list.length > 0) {
          this.isCollected = true
          this.collectId = data.data.list[0].id
        }
      }).catch(() => {})
    },
    thumbUp() {
      this.runAction(() => this.$http({
        url: `meishijianshang/thumbsup/${this.$route.query.id}?type=1`,
        method: 'get'
      })).then(({ data }) => {
        if (data && data.code === 0 && !this.isThumb) {
          this.isThumb = true
          this.detailData.thumbsupnum = (this.detailData.thumbsupnum || 0) + 1
          this.$message.success(c('toast.thumbOk'))
        }
      })
    },
    crazy() {
      this.runAction(() => this.$http({
        url: `meishijianshang/thumbsup/${this.$route.query.id}?type=2`,
        method: 'get'
      })).then(({ data }) => {
        if (data && data.code === 0 && !this.isCrazy) {
          this.isCrazy = true
          this.detailData.crazilynum = (this.detailData.crazilynum || 0) + 1
        }
      })
    },
    collect() {
      if (this.isCollected) {
        this.runAction(() => this.$http({
          url: 'storeup/delete',
          method: 'post',
          data: [this.collectId]
        })).then(({ data }) => {
          if (data && data.code === 0) {
            this.isCollected = false
            this.collectId = null
            this.$message.success(c('toast.uncollectOk'))
          }
        })
      } else {
        this.runAction(() => this.$http({
          url: 'storeup/save',
          method: 'post',
          data: {
            refid: this.$route.query.id,
            tablename: 'meishijianshang',
            name: this.detailData.meishimingcheng,
            picture: this.detailData.meishizhaopian,
            userid: this.$storage.get('userid')
          }
        })).then(({ data }) => {
          if (data && data.code === 0) {
            this.isCollected = true
            this.collectId = data.data
            this.$message.success(c('toast.collectOk'))
          }
        })
      }
    },
    checkFriend() {
      const yonghuming = this.$storage.get('adminName')
      if (!yonghuming) return Promise.resolve()
      return this.$http({
        url: `wodehaoyou/list?page=1&limit=1&yonghuming=${encodeURIComponent(yonghuming)}`,
        method: 'get'
      }).then(({ data }) => {
        if (data && data.code === 0 && data.data.list && data.data.list.length > 0) this.isFriend = true
      }).catch(() => {})
    },
    addFriend() {
      if (!this.isLogin) return this.goLogin()
      this.runAction(() => this.$http({
        url: 'wodehaoyou/save',
        method: 'post',
        data: {
          yonghuming: this.$storage.get('adminName'),
          xingming: this.$storage.get('adminName'),
          tianjiashijian: new Date().toISOString().slice(0, 19).replace('T', ' '),
          userid: this.$storage.get('userid')
        }
      })).then(({ data }) => {
        if (data && data.code === 0) {
          this.isFriend = true
          this.$message.success(c('toast.friendOk'))
        }
      })
    },
    runAction(request) {
      this.actionLoading = true
      return request().finally(() => { this.actionLoading = false })
    },
    submitComment() {
      const content = this.commentContent.trim()
      if (!content) return this.$message.warning(c('toast.commentEmpty'))
      this.commentSubmitting = true
      this.$http({
        url: 'discussmeishijianshang/save',
        method: 'post',
        data: { refid: this.$route.query.id, content, userid: this.$storage.get('userid') }
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.$message.success('评论成功')
          this.commentContent = ''
          this.getComment()
        }
      }).finally(() => { this.commentSubmitting = false })
    },
    goLogin() { this.$router.push({ path: '/login', query: { redirect: this.$route.fullPath } }) },
    goBack() { this.$router.push('/front/meishijianshang') },
    avatarText(item) {
      const name = item.nickname || item.userid || '用'
      return String(name).slice(0, 1).toUpperCase()
    },
    formatPrice(value) {
      const price = Number(value || 0)
      return Number.isFinite(price) ? price.toFixed(2) : '0.00'
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-article { display: flex; flex-direction: column; gap: 40px; }
.eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  margin: 0 0 14px;
  font-family: var(--font-display);
  font-size: 11px; font-weight: 600;
  letter-spacing: .18em; text-transform: uppercase;
  color: var(--accent);
  .dot { width: 6px; height: 6px; border-radius: 999px; background: var(--accent); }
}
.detail-header {
  padding-bottom: 24px;
  border-bottom: 1px solid var(--rule);
  .detail-title {
    margin: 0 0 14px;
    color: var(--ink);
    font-family: var(--font-display);
    font-weight: 600;
    font-size: clamp(34px, 5vw, 56px);
    line-height: 1.05;
    letter-spacing: -.02em;
    font-variation-settings: "opsz" 144;
  }
  .detail-meta {
    margin: 0;
    display: inline-flex; align-items: center; gap: 8px;
    color: var(--ink-mute); font-size: 13px;
    .dot { color: var(--rule); }
  }
}

.detail-body {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: 36px;
  align-items: start;
}
.detail-image-wrap {
  border-radius: var(--r-2);
  overflow: hidden;
  background: var(--paper-2);
  box-shadow: var(--shadow-1);
  aspect-ratio: 4 / 3;
}
.detail-image { width: 100%; height: 100%; }
.image-placeholder {
  display: flex; align-items: center; justify-content: center;
  width: 100%; height: 100%;
  color: var(--ink-mute);
  background: var(--paper-2);
  font-family: var(--font-display);
  font-size: 13px; letter-spacing: .14em; text-transform: uppercase;
}

.detail-side { padding: 8px 0; }
.price-eyebrow {
  margin: 0 0 8px;
  font-family: var(--font-display);
  font-size: 11px; font-weight: 600;
  letter-spacing: .18em; text-transform: uppercase;
  color: var(--ink-mute);
}
.price-value {
  margin: 0 0 22px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 48px;
  color: var(--accent);
  letter-spacing: -.02em;
  font-variation-settings: "opsz" 96;
}
.info-list {
  margin: 0 0 28px; padding: 0;
  display: flex; flex-direction: column;
  border-top: 1px solid var(--rule);
  div {
    display: flex; justify-content: space-between; align-items: baseline;
    padding: 12px 0;
    border-bottom: 1px solid var(--rule);
  }
  dt {
    color: var(--ink-mute);
    font-family: var(--font-display);
    font-size: 11px; letter-spacing: .14em; text-transform: uppercase;
  }
  dd {
    margin: 0;
    color: var(--ink);
    font-size: 14px; font-weight: 500;
  }
}

.side-actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.round-btn {
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  background: #fff;
  border: 1px solid var(--rule);
  border-radius: 50%;
  color: var(--ink-soft);
  cursor: pointer;
  transition: all .15s ease;
  position: relative;
  // 角标只命中 .badge，避免被 ui-icon 内部 span 误伤
  .badge {
    position: absolute;
    top: -6px; right: -6px;
    min-width: 20px; height: 20px;
    padding: 0 6px;
    display: flex; align-items: center; justify-content: center;
    background: var(--ink);
    color: #fbf7f0;
    border-radius: 999px;
    font-family: var(--font-display);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }
  &:hover:not(:disabled) { color: var(--ink); border-color: var(--ink); }
  &.is-active   { color: var(--accent); border-color: var(--accent); }
  &.is-active-d { color: var(--ink-mute); border-color: var(--ink-mute); }
  &:disabled { opacity: .45; cursor: not-allowed; }
}
.link-btn {
  margin-left: 4px;
  padding: 4px 0;
  background: transparent;
  border: 0;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 12px; font-weight: 600;
  letter-spacing: .14em; text-transform: uppercase;
  border-bottom: 1px solid var(--ink);
  cursor: pointer;
  &:hover { color: var(--accent); border-bottom-color: var(--accent); }
  &.is-disabled { color: var(--ink-mute); border-bottom-color: var(--rule); cursor: pointer; }
}

.intro-section { display: flex; flex-direction: column; gap: 4px; }
.intro {
  font-family: var(--font-body);
  font-size: 17px;
  line-height: 1.85;
  color: var(--ink);
  max-width: 70ch;
  :deep(p) { margin: 0 0 18px; &:last-child { margin-bottom: 0; } }
  :deep(p:first-child::first-letter) {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 3.6em;
    float: left;
    line-height: 1;
    margin: 0.04em 0.08em 0 0;
    color: var(--accent);
    font-variation-settings: "opsz" 144;
  }
  :deep(img) { max-width: 100%; height: auto; border-radius: var(--r-1); margin: 8px 0; }
}

.comment-section { display: flex; flex-direction: column; gap: 6px; padding-top: 24px; border-top: 1px solid var(--rule); }
.comment-editor { margin: 8px 0 24px; }
.comment-input {
  width: 100%;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid var(--rule);
  border-radius: var(--r-1);
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.6;
  color: var(--ink);
  outline: 0;
  resize: vertical;
  transition: border-color .15s ease;
  &:focus { border-color: var(--ink); }
}
.editor-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  margin-top: 10px;
}
.char-count {
  color: var(--ink-mute);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 22px;
  background: var(--accent);
  color: #fff;
  border: 0; border-radius: var(--r-1);
  font-family: var(--font-display);
  font-size: 12px; font-weight: 600;
  letter-spacing: .14em; text-transform: uppercase;
  cursor: pointer;
  transition: background-color .15s ease, transform .12s ease;
  &:hover { background: var(--accent-2); }
  &:active { transform: translateY(1px); }
  &:disabled { opacity: .55; cursor: not-allowed; }
}
.btn-text {
  padding: 8px 18px;
  background: transparent; border: 0;
  color: var(--ink-soft);
  font-family: var(--font-display);
  font-size: 12px; font-weight: 600;
  letter-spacing: .14em; text-transform: uppercase;
  border-bottom: 1px solid var(--rule);
  cursor: pointer;
  &:hover { color: var(--ink); border-bottom-color: var(--ink); }
}
.comment-locked {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 18px;
  background: var(--paper-2);
  border: 1px dashed var(--rule);
  border-radius: var(--r-1);
  color: var(--ink-soft);
  font-size: 14px;
  margin: 8px 0 24px;
}
.comment-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 18px; }
.comment-item { display: flex; gap: 14px; }
.avatar {
  flex: 0 0 40px; width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: var(--paper-2);
  color: var(--ink-soft);
  font-family: var(--font-display);
  font-weight: 700; font-size: 15px;
}
.comment-main { flex: 1; min-width: 0; }
.comment-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
.comment-user { color: var(--ink); font-weight: 600; font-size: 14px; }
.comment-time { color: var(--ink-mute); font-size: 12px; }
.comment-content {
  margin: 0; padding: 12px 16px;
  background: var(--paper-2);
  border-radius: var(--r-2);
  color: var(--ink); font-size: 14px; line-height: 1.7;
  overflow-wrap: anywhere;
}
.comment-reply {
  margin-top: 8px; padding: 8px 12px;
  background: #fff;
  border-left: 2px solid var(--accent);
  border-radius: 0 var(--r-1) var(--r-1) 0;
  color: var(--ink-soft); font-size: 13px;
  strong { color: var(--accent); margin-right: 4px; font-weight: 600; }
}
.comment-empty {
  margin: 12px 0 0;
  color: var(--ink-mute);
  font-family: var(--font-display);
  font-size: 16px;
  font-style: italic;
}

// —— Loading skeleton ——
.detail-loading {
  display: flex; flex-direction: column; gap: 24px;
  .loading-title {
    height: 56px; width: 60%;
    background: var(--paper-3);
    border-radius: var(--r-1);
    background-image: linear-gradient(90deg, transparent, rgba(255,255,255,.5), transparent);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite linear;
  }
  .loading-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; }
  .loading-image {
    aspect-ratio: 4/3;
    background: var(--paper-3);
    border-radius: var(--r-2);
    background-image: linear-gradient(90deg, transparent, rgba(255,255,255,.5), transparent);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite linear;
  }
  .loading-side { display: flex; flex-direction: column; gap: 12px; padding-top: 12px; }
  .loading-side .line {
    height: 14px;
    background: var(--paper-3);
    border-radius: 4px;
    background-image: linear-gradient(90deg, transparent, rgba(255,255,255,.5), transparent);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite linear;
  }
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 880px) {
  .detail-body { grid-template-columns: minmax(0, 1fr); }
  .detail-image-wrap { aspect-ratio: 4 / 3; }
  .loading-grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
