<template>
  <div class="front-detail">
    <div v-if="pageLoading" class="detail-container">
      <el-skeleton animated class="detail-skeleton">
        <template #template>
          <el-skeleton-item variant="h1" style="width:42%;height:32px" />
          <div style="display:flex;gap:24px;margin-top:24px">
            <el-skeleton-item variant="image" style="width:38%;height:320px" />
            <div style="flex:1">
              <el-skeleton-item variant="text" style="width:88%" />
              <el-skeleton-item variant="text" style="width:72%" />
              <el-skeleton-item variant="text" style="width:58%" />
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>

    <el-result
      v-else-if="loadError || !detailData.id"
      icon="warning"
      title="内容加载失败"
      sub-title="这条分享可能已删除，或暂时无法访问"
    >
      <template #extra>
        <el-button @click="goBack">返回列表</el-button>
        <el-button type="primary" @click="reload">重试</el-button>
      </template>
    </el-result>

    <article v-else class="detail-card">
      <header class="detail-header">
        <h1>{{ detailData.meishimingcheng }}</h1>
        <div class="tags">
          <el-tag v-if="detailData.meishileibie">{{ detailData.meishileibie }}</el-tag>
          <el-tag type="success" effect="plain">推荐 {{ detailData.tuijianzhishu || 0 }}</el-tag>
          <el-tag type="info" effect="plain">浏览 {{ detailData.clicknum || 0 }}</el-tag>
        </div>
      </header>

      <div class="detail-body">
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

        <dl class="info-panel">
          <div><dt>价格</dt><dd class="price">¥{{ formatPrice(detailData.shangpinjiage) }}</dd></div>
          <div><dt>类别</dt><dd>{{ detailData.meishileibie || '未填写' }}</dd></div>
          <div><dt>位置</dt><dd>{{ detailData.shangpusuozaidi || '未填写' }}</dd></div>
          <div><dt>发布时间</dt><dd>{{ detailData.fabushijian || '未知' }}</dd></div>
          <div><dt>分享人</dt><dd>{{ detailData.yonghuming || '匿名用户' }}</dd></div>
          <div><dt>姓名</dt><dd>{{ detailData.xingming || '未填写' }}</dd></div>
        </dl>
      </div>

      <section class="intro-section">
        <h2>美食介绍</h2>
        <div class="intro" v-html="sanitizedIntro"></div>
      </section>

      <section class="action-bar" aria-label="内容互动">
        <el-button :type="isThumb ? 'primary' : 'default'" :disabled="actionLoading || !isLogin" @click="thumbUp">
          <el-icon><CircleCheck /></el-icon>
          赞 {{ detailData.thumbsupnum || 0 }}
        </el-button>
        <el-button :type="isCrazy ? 'danger' : 'default'" :disabled="actionLoading || !isLogin" @click="crazy">
          <el-icon><CircleClose /></el-icon>
          踩 {{ detailData.crazilynum || 0 }}
        </el-button>
        <el-button :type="isCollected ? 'warning' : 'default'" :disabled="actionLoading || !isLogin" @click="collect">
          <el-icon><StarFilled v-if="isCollected" /><Star v-else /></el-icon>
          {{ isCollected ? '已收藏' : '收藏' }}
        </el-button>
        <el-button :type="isFriend ? 'success' : 'default'" :disabled="actionLoading || isFriend || !isLogin" @click="addFriend">
          <el-icon><Plus /></el-icon>
          {{ isFriend ? '已是好友' : '添加好友' }}
        </el-button>
      </section>

      <section class="comment-section">
        <h2>评论 <span>{{ commentList.length }}</span></h2>

        <div v-if="isLogin" class="comment-editor">
          <el-input
            v-model="commentContent"
            type="textarea"
            :rows="3"
            maxlength="300"
            show-word-limit
            placeholder="说说你的用餐体验..."
          />
          <div class="editor-actions">
            <el-button type="primary" :loading="commentSubmitting" @click="submitComment">发表评论</el-button>
          </div>
        </div>
        <el-alert v-else title="登录后可以评论、点赞和收藏" type="info" show-icon :closable="false">
          <template #default>
            <el-button type="primary" link @click="goLogin">立即登录</el-button>
          </template>
        </el-alert>

        <div v-if="commentList.length" class="comment-list">
          <div v-for="(item, index) in commentList" :key="item.id || index" class="comment-item">
            <div class="avatar">{{ avatarText(item) }}</div>
            <div class="comment-main">
              <div class="comment-header">
                <span class="comment-user">{{ item.nickname || item.userid || '用户' }}</span>
                <span class="comment-time">{{ item.addtime || '' }}</span>
              </div>
              <p class="comment-content">{{ item.content }}</p>
              <div v-if="item.reply" class="comment-reply">
                <strong>回复：</strong>{{ item.reply }}
              </div>
            </div>
          </div>
        </div>
        <el-empty v-else description="还没有评论，来聊两句" :image-size="90" />
      </section>
    </article>
  </div>
</template>

<script>
import { CircleCheck, CircleClose, Plus, Star, StarFilled } from '@element-plus/icons-vue'
import { resolveUploadUrl } from '@/utils/utils'
import { sanitizeHtml } from '@/utils/sanitize'

export default {
  components: { CircleCheck, CircleClose, Plus, Star, StarFilled },
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
    }
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
    getDetail() {
      this.pageLoading = true
      this.loadError = false
      return this.$http({
        url: `meishijianshang/info/${this.$route.query.id}`,
        method: 'get'
      }).then(({ data }) => {
        if (data && data.code === 0 && data.data) {
          this.detailData = data.data
        } else {
          this.loadError = true
        }
      }).catch(() => {
        this.loadError = true
      }).finally(() => {
        this.pageLoading = false
      })
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
        if (data && data.code === 0) {
          this.commentList = data.data.list || []
        }
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
          this.$message.success('点赞成功')
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
          this.$message.success('操作成功')
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
            this.$message.success('已取消收藏')
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
            this.$message.success('收藏成功')
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
        if (data && data.code === 0 && data.data.list && data.data.list.length > 0) {
          this.isFriend = true
        }
      }).catch(() => {})
    },
    addFriend() {
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
          this.$message.success('添加好友成功')
        }
      })
    },
    runAction(request) {
      if (!this.isLogin) {
        this.goLogin()
        return Promise.resolve({ data: {} })
      }
      this.actionLoading = true
      return request().finally(() => {
        this.actionLoading = false
      })
    },
    submitComment() {
      const content = this.commentContent.trim()
      if (!content) {
        this.$message.warning('请输入评论内容')
        return
      }
      this.commentSubmitting = true
      this.$http({
        url: 'discussmeishijianshang/save',
        method: 'post',
        data: {
          refid: this.$route.query.id,
          content,
          userid: this.$storage.get('userid')
        }
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.$message.success('评论成功')
          this.commentContent = ''
          this.getComment()
        }
      }).finally(() => {
        this.commentSubmitting = false
      })
    },
    goLogin() {
      this.$router.push({ path: '/login', query: { redirect: this.$route.fullPath } })
    },
    goBack() {
      this.$router.push('/front/meishijianshang')
    },
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
.front-detail {
  max-width: 1120px;
  margin: 0 auto;
  padding: 30px 24px 50px;
}

.detail-card {
  overflow: hidden;
  padding: 28px;
  background: #fff;
  border: 1px solid #e7ece9;
  border-radius: 8px;
  box-shadow: 0 8px 26px rgba(31,45,39,.06);
}

.detail-header {
  margin-bottom: 22px;

  h1 {
    margin: 0 0 12px;
    color: #263238;
    font-size: 30px;
    line-height: 1.25;
  }

  .tags { display: flex; flex-wrap: wrap; gap: 8px; }
}

.detail-body {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
  gap: 26px;
}

.detail-image {
  width: 100%;
  height: 330px;
  border-radius: 8px;
  overflow: hidden;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 330px;
  color: #9aa7a1;
  background: #eef2f0;
}

.info-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 20px;
  align-content: start;
  margin: 4px 0 0;

  div { min-width: 0; }

  dt {
    margin-bottom: 3px;
    color: #7d8983;
    font-size: 13px;
  }

  dd {
    margin: 0;
    overflow-wrap: anywhere;
    color: #37453f;
    font-size: 15px;
    font-weight: 600;
  }

  .price {
    color: #d64541;
    font-size: 23px;
  }
}

.intro-section {
  margin-top: 30px;

  h2, .comment-section h2 {
    margin: 0 0 14px;
    color: #263238;
    font-size: 19px;
  }
}

:deep(.intro) {
  min-height: 48px;
  padding: 18px;
  color: #54635d;
  line-height: 1.8;
  background: #f8faf9;
  border-radius: 8px;

  p { margin: 0 0 10px; &:last-child { margin-bottom: 0; } }
  img { max-width: 100%; height: auto; border-radius: 6px; }
}

.action-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 26px;
  padding-top: 22px;
  border-top: 1px solid #edf1ef;
}

.comment-section {
  margin-top: 30px;

  h2 span { color: #008565; }
}

.comment-editor {
  margin-bottom: 22px;

  .editor-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-top: 1px solid #edf1ef;
}

.avatar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #fff;
  background: #00a57d;
  border-radius: 50%;
  font-weight: 600;
}

.comment-main { flex: 1; min-width: 0; }

.comment-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 5px;
}

.comment-user { color: #37453f; font-weight: 600; }
.comment-time { color: #8b978f; font-size: 12px; }
.comment-content { margin: 0; color: #55645d; line-height: 1.65; overflow-wrap: anywhere; }

.comment-reply {
  margin-top: 8px;
  padding: 9px 11px;
  color: #66746e;
  background: #f5f8f6;
  border-left: 3px solid #00a57d;
  border-radius: 4px;
}

.detail-skeleton { padding: 28px; background: #fff; border-radius: 8px; }

@media (max-width: 860px) {
  .front-detail { padding: 22px 16px 38px; }
  .detail-card { padding: 20px; }
  .detail-body { grid-template-columns: minmax(0, 1fr); }
  .detail-image, :deep(.image-placeholder) { height: 240px; }
  .info-panel { grid-template-columns: minmax(0, 1fr); }
  .detail-header h1 { font-size: 24px; }
  .action-bar :deep(.el-button) { flex: 1 1 calc(50% - 10px); margin-left: 0; }
}
</style>
