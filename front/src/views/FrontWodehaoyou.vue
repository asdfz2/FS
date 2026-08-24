<template>
  <div class="front-friend">
    <section class="section">
      <header class="page-head">
        <p class="eyebrow">社交</p>
        <h1>我的好友</h1>
      </header>

      <div v-if="loading" class="friend-list">
        <div v-for="item in 4" :key="item" class="friend-card">
          <el-skeleton animated :loading="true">
            <template #template>
              <el-skeleton-item variant="circle" style="width:44px;height:44px" />
              <div style="flex:1;margin-left:12px">
                <el-skeleton-item variant="h3" style="width:38%" />
                <el-skeleton-item variant="text" style="width:62%;margin-top:8px" />
              </div>
            </template>
          </el-skeleton>
        </div>
      </div>

      <el-result v-else-if="loadError" icon="warning" title="好友加载失败" sub-title="请稍后重试">
        <template #extra>
          <el-button type="primary" @click="getList">重试</el-button>
        </template>
      </el-result>

      <template v-else>
        <div v-if="dataList.length" class="friend-list">
          <article v-for="item in dataList" :key="item.id" class="friend-card">
            <div class="avatar">{{ avatarText(item.yonghuming) }}</div>
            <div class="friend-info">
              <h3>{{ item.yonghuming || '未知用户' }}</h3>
              <p>姓名：{{ item.xingming || '未填写' }}</p>
              <p>添加时间：{{ item.tianjiashijian || '未知' }}</p>
            </div>
            <el-button type="danger" plain size="small" @click="deleteFriend(item.id)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </article>
        </div>
        <el-empty v-else description="还没有好友" />
      </template>
    </section>
  </div>
</template>

<script>
import { Delete } from '@element-plus/icons-vue'

export default {
  components: { Delete },
  data() {
    return { dataList: [], loading: true, loadError: false }
  },
  mounted() {
    const token = this.$storage.get('Token')
    if (!token) {
      this.$router.push({ path: '/login', query: { redirect: '/front/wodehaoyou' } })
      return
    }
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      this.loadError = false
      return this.$http({
        url: 'wodehaoyou/list?page=1&limit=100',
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
    deleteFriend(id) {
      this.$confirm('确定删除该好友？', '提示', { type: 'warning' }).then(() => {
        return this.$http({ url: 'wodehaoyou/delete', method: 'post', data: [id] })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.$message.success('删除成功')
          this.getList()
        }
      }).catch(() => {})
    },
    avatarText(value) {
      return String(value || '友').slice(0, 1).toUpperCase()
    }
  }
}
</script>

<style lang="scss" scoped>
.section {
  max-width: 960px;
  margin: 0 auto;
  padding: 34px 24px 46px;
}

.page-head {
  margin-bottom: 22px;

  .eyebrow { margin: 0 0 4px; color: #008565; font-size: 14px; font-weight: 600; }
  h1 { margin: 0; color: #263238; font-size: 30px; }
}

.friend-list { display: grid; gap: 13px; }

.friend-card {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 15px;
  background: #fff;
  border: 1px solid #e7ece9;
  border-radius: 8px;
  box-shadow: 0 3px 12px rgba(31,45,39,.04);
}

.avatar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: #fff;
  background: #00a57d;
  border-radius: 50%;
  font-weight: 600;
}

.friend-info { flex: 1; min-width: 0;
  h3 { margin: 0 0 4px; color: #263238; font-size: 16px; }
  p { margin: 0 0 3px; color: #75827c; font-size: 13px; overflow-wrap: anywhere; }
}

@media (max-width: 580px) {
  .section { padding: 24px 16px 36px; }
  .page-head h1 { font-size: 24px; }
  .friend-card { align-items: flex-start; }
}
</style>
