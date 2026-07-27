<template>
  <div class="front-detail">
    <div class="detail-container" v-if="detailData.id">
      <el-card class="detail-card">
        <div class="detail-header">
          <h2>{{ detailData.meishimingcheng }}</h2>
          <div class="tags">
            <el-tag>{{ detailData.meishileibie }}</el-tag>
            <el-tag type="warning">推荐指数：{{ detailData.tuijianzhishu }}</el-tag>
            <el-tag type="info">点击：{{ detailData.clicknum }}</el-tag>
          </div>
        </div>
        <el-row :gutter="24">
          <el-col :span="10">
            <el-image
              style="width:100%;height:300px;border-radius:8px"
              :src="detailData.meishizhaopian ? detailData.meishizhaopian.split(',')[0] : ''"
              fit="cover"
            />
          </el-col>
          <el-col :span="14">
            <div class="info-item"><label>美食名称：</label><span>{{ detailData.meishimingcheng }}</span></div>
            <div class="info-item"><label>美食类别：</label><span>{{ detailData.meishileibie }}</span></div>
            <div class="info-item"><label>价格：</label><span class="price">¥{{ detailData.shangpinjiage || '0.00' }}</span></div>
            <div class="info-item"><label>推荐指数：</label><span>{{ detailData.tuijianzhishu }}</span></div>
            <div class="info-item"><label>商铺所在地：</label><span>{{ detailData.shangpusuozaidi }}</span></div>
            <div class="info-item"><label>发布时间：</label><span>{{ detailData.fabushijian }}</span></div>
            <div class="info-item"><label>用户名：</label><span>{{ detailData.yonghuming }}</span></div>
            <div class="info-item"><label>姓名：</label><span>{{ detailData.xingming }}</span></div>
          </el-col>
        </el-row>
        <el-divider>美食介绍</el-divider>
        <div class="intro" v-html="detailData.meishijieshao"></div>

        <!-- 点赞/踩 -->
        <el-divider></el-divider>
        <div class="action-bar">
          <el-button :type="isThumb ? 'primary' : 'default'" @click="thumbUp" :disabled="!isLogin">
            <i class="el-icon-thumb"></i> 赞 {{ detailData.thumbsupnum || 0 }}
          </el-button>
          <el-button :type="isCrazy ? 'primary' : 'default'" @click="crazy" :disabled="!isLogin">
            <i class="el-icon-s-release"></i> 踩 {{ detailData.crazilynum || 0 }}
          </el-button>
          <el-button :type="isCollected ? 'warning' : 'default'" @click="collect" :disabled="!isLogin">
            <i class="el-icon-star-on"></i> {{ isCollected ? '已收藏' : '收藏' }}
          </el-button>
          <el-button :type="isFriend ? 'success' : 'default'" @click="addFriend" :disabled="!isLogin">
            <i class="el-icon-plus"></i> {{ isFriend ? '已添加' : '添加好友' }}
          </el-button>
        </div>

        <!-- 评论 -->
        <el-divider>评论 ({{ commentList.length }})</el-divider>
        <div class="comment-input" v-if="isLogin">
          <el-input
            type="textarea"
            :rows="3"
            v-model="commentContent"
            placeholder="说点什么..."
          />
          <el-button type="primary" @click="submitComment" style="margin-top:8px">发表评论</el-button>
        </div>
        <div v-else class="comment-login-tip">
          请 <el-button type="text" @click="goLogin">登录</el-button> 后发表评论
        </div>
        <div class="comment-list" v-if="commentList.length > 0">
          <div class="comment-item" v-for="(item, index) in commentList" :key="index">
            <div class="comment-header">
              <span class="comment-user">{{ item.nickname || item.userid }}</span>
              <span class="comment-time">{{ item.addtime }}</span>
            </div>
            <div class="comment-content">{{ item.content }}</div>
            <div class="comment-reply" v-if="item.reply">
              <span class="reply-label">回复：</span>{{ item.reply }}
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无评论"></el-empty>

        <div style="text-align:center;margin-top:16px">
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      detailData: {},
      isLogin: false,
      isThumb: false,
      isCrazy: false,
      isCollected: false,
      isFriend: false,
      commentContent: '',
      commentList: [],
      collectId: null,
    }
  },
  mounted() {
    const token = this.$storage.get('Token')
    this.isLogin = !!token
    if (this.$route.query.id) {
      this.getDetail(this.$route.query.id)
      this.getComment()
      if (this.isLogin) {
        this.checkCollect()
        this.checkFriend()
      }
    }
  },
  methods: {
    getDetail(id) {
      this.$http({
        url: 'meishijianshang/info/' + id,
        method: 'get'
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.detailData = data.data
        }
      })
    },
    getComment() {
      this.$http({
        url: 'discussmeishijianshang/list?page=1&limit=100&refid=' + this.$route.query.id,
        method: 'get'
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.commentList = data.data.list || []
        }
      })
    },
    checkCollect() {
      this.$http({
        url: 'storeup/list?page=1&limit=1&refid=' + this.$route.query.id + '&tablename=meishijianshang',
        method: 'get'
      }).then(({ data }) => {
        if (data && data.code === 0 && data.data.list && data.data.list.length > 0) {
          this.isCollected = true
          this.collectId = data.data.list[0].id
        }
      })
    },
    thumbUp() {
      if (!this.isLogin) return this.goLogin()
      this.$http({
        url: 'meishijianshang/thumbsup/' + this.$route.query.id + '?type=1',
        method: 'get'
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.isThumb = true
          this.detailData.thumbsupnum = (this.detailData.thumbsupnum || 0) + 1
          this.$message.success('点赞成功')
        }
      })
    },
    crazy() {
      if (!this.isLogin) return this.goLogin()
      this.$http({
        url: 'meishijianshang/thumbsup/' + this.$route.query.id + '?type=2',
        method: 'get'
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.isCrazy = true
          this.detailData.crazilynum = (this.detailData.crazilynum || 0) + 1
          this.$message.success('操作成功')
        }
      })
    },
    collect() {
      if (!this.isLogin) return this.goLogin()
      if (this.isCollected) {
        this.$http({
          url: 'storeup/delete',
          method: 'post',
          data: [this.collectId]
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.isCollected = false
            this.collectId = null
            this.$message.success('取消收藏')
          }
        })
      } else {
        this.$http({
          url: 'storeup/save',
          method: 'post',
          data: {
            refid: this.$route.query.id,
            tablename: 'meishijianshang',
            name: this.detailData.meishimingcheng,
            picture: this.detailData.meishizhaopian,
            userid: this.$storage.get('userid')
          }
        }).then(({ data }) => {
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
      if (!yonghuming) return
      this.$http({
        url: 'wodehaoyou/list?page=1&limit=1&yonghuming=' + yonghuming,
        method: 'get'
      }).then(({ data }) => {
        if (data && data.code === 0 && data.data.list && data.data.list.length > 0) {
          this.isFriend = true
        }
      })
    },
    addFriend() {
      if (!this.isLogin) return this.goLogin()
      this.$http({
        url: 'wodehaoyou/save',
        method: 'post',
        data: {
          yonghuming: this.$storage.get('adminName'),
          xingming: this.$storage.get('adminName'),
          tianjiashijian: new Date().toISOString().slice(0, 19).replace('T', ' '),
          userid: this.$storage.get('userid')
        }
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.isFriend = true
          this.$message.success('添加好友成功')
        }
      })
    },
    submitComment() {
      if (!this.commentContent.trim()) {
        this.$message.warning('请输入评论内容')
        return
      }
      this.$http({
        url: 'discussmeishijianshang/save',
        method: 'post',
        data: {
          refid: this.$route.query.id,
          content: this.commentContent,
          userid: this.$storage.get('userid')
        }
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.$message.success('评论成功')
          this.commentContent = ''
          this.getComment()
        }
      })
    },
    goLogin() {
      this.$router.push({ path: '/login', query: { redirect: this.$route.fullPath } })
    },
    goBack() {
      this.$router.push('/front/meishijianshang')
    }
  }
}
</script>

<style lang="scss" scoped>
.front-detail { max-width: 1000px; margin: 0 auto; padding: 24px 20px; }
.detail-header { margin-bottom: 20px;
  h2 { font-size: 24px; color: #333; margin-bottom: 12px; }
  .tags { display: flex; gap: 8px; }
}
.info-item { margin-bottom: 12px; font-size: 15px;
  label { color: #666; display: inline-block; width: 100px; text-align: right; margin-right: 8px; }
  .price { color: #f56c6c; font-size: 20px; font-weight: bold; }
}
.intro { padding: 0 20px; line-height: 1.8; color: #555; font-size: 15px; }
.action-bar { display: flex; gap: 12px; justify-content: center; padding: 8px 0; }
.comment-input { margin-bottom: 16px; }
.comment-login-tip { text-align: center; padding: 16px; color: #999; }
.comment-item { border-bottom: 1px solid #f0f0f0; padding: 12px 0;
  .comment-header { display: flex; justify-content: space-between; margin-bottom: 6px;
    .comment-user { font-weight: bold; color: #333; }
    .comment-time { font-size: 12px; color: #999; }
  }
  .comment-content { color: #555; line-height: 1.5; }
  .comment-reply { margin-top: 6px; padding: 8px; background: #f9f9f9; border-radius: 4px; color: #666;
    .reply-label { color: #00c292; font-weight: bold; }
  }
}
</style>