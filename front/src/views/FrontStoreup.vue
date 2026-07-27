<template>
  <div class="front-storeup">
    <div class="section">
      <h2 style="margin-bottom:20px">我的收藏</h2>
      <el-row :gutter="24">
        <el-col :span="8" v-for="(item, index) in dataList" :key="index" style="margin-bottom: 24px">
          <el-card :body-style="{ padding: '0px' }" shadow="hover" class="food-card">
            <el-image
              style="width: 100%; height: 200px"
              :src="item.picture ? item.picture.split(',')[0] : ''"
              fit="cover"
            >
              <template #error>
                <div class="img-placeholder">暂无图片</div>
              </template>
            </el-image>
            <div style="padding: 16px">
              <h3 class="food-name">{{ item.name }}</h3>
              <el-button type="primary" size="small" @click="goDetail(item.refid)" style="width:100%">查看</el-button>
              <el-button type="danger" size="small" @click="deleteStoreup(item.id)" style="width:100%;;margin-top:8px">取消收藏</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-empty v-if="dataList.length === 0" description="暂无收藏"></el-empty>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { dataList: [] }
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
    getList() {
      this.$http({
        url: 'storeup/list?page=1&limit=100',
        method: 'get'
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.dataList = data.data.list || []
        }
      })
    },
    goDetail(refid) {
      this.$router.push({ path: '/front/meishijianshang/detail', query: { id: refid } })
    },
    deleteStoreup(id) {
      this.$confirm('确定取消收藏？', '提示', { type: 'warning' }).then(() => {
        this.$http({
          url: 'storeup/delete',
          method: 'post',
          data: [id]
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.$message.success('已取消收藏')
            this.getList()
          }
        })
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.section { max-width: 1200px; margin: 0 auto; padding: 24px 20px; }
.food-card { border-radius: 8px; overflow: hidden;
  .food-name { font-size: 16px; color: #333; margin: 0 0 8px; text-align: center; }
}
.img-placeholder { height: 200px; display: flex; align-items: center; justify-content: center; background: #f0f0f0; color: #ccc; }
</style>
