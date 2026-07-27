<template>
  <div class="front-friend">
    <div class="section">
      <h2 style="margin-bottom:20px">我的好友</h2>
      <el-table :data="dataList" stripe style="width:100%" v-loading="loading">
        <el-table-column prop="yonghuming" label="用户名"></el-table-column>
        <el-table-column prop="xingming" label="姓名"></el-table-column>
        <el-table-column prop="tianjiashijian" label="添加时间"></el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button type="danger" size="small" @click="deleteFriend(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && dataList.length === 0" description="暂无好友"></el-empty>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { dataList: [], loading: false }
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
      this.$http({
        url: 'wodehaoyou/list?page=1&limit=100',
        method: 'get'
      }).then(({ data }) => {
        this.loading = false
        if (data && data.code === 0) {
          this.dataList = data.data.list || []
        }
      }).catch(() => { this.loading = false })
    },
    deleteFriend(id) {
      this.$confirm('确定删除该好友？', '提示', { type: 'warning' }).then(() => {
        this.$http({
          url: 'wodehaoyou/delete',
          method: 'post',
          data: [id]
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.$message.success('删除成功')
            this.getList()
          }
        })
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.section { max-width: 1000px; margin: 0 auto; padding: 24px 20px; background: #fff; border-radius: 8px; }
</style>