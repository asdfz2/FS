<template>
  <div class="front-home">
    <div class="section">
      <div class="search-bar">
        <el-input v-model="searchForm.meishimingcheng" placeholder="请输入美食名称" clearable style="width:300px" @keyup.enter="search" />
        <el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
      </div>

      <el-row :gutter="24">
        <el-col :span="8" v-for="(item, index) in dataList" :key="index" style="margin-bottom: 24px">
          <el-card :body-style="{ padding: '0px' }" shadow="hover" class="food-card">
            <el-image
              style="width: 100%; height: 220px"
              :src="item.meishizhaopian ? item.meishizhaopian.split(',')[0] : ''"
              fit="cover"
            >
              <template #error>
                <div class="img-placeholder">暂无图片</div>
              </template>
            </el-image>
            <div style="padding: 16px">
              <h3 class="food-name">{{ item.meishimingcheng }}</h3>
              <p class="food-desc">{{ item.meishijieshao ? item.meishijieshao.substring(0, 80) : '' }}</p>
              <div class="food-meta">
                <span class="price">¥{{ item.shangpinjiage || '0.00' }}</span>
                <span class="count">点击：{{ item.clicknum || 0 }}</span>
              </div>
              <el-button type="primary" size="small" @click="goDetail(item.id)" style="margin-top: 8px;width:100%">查看详情</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-empty v-if="dataList.length === 0" description="暂无美食数据"></el-empty>
      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        @current-change="getDataList"
        :current-page.sync="page"
        :page-size="limit"
        layout="total, prev, pager, next, jumper"
        :total="total"
        style="text-align:center;padding:20px 0"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dataList: [],
      page: 1,
      limit: 6,
      total: 0,
      searchForm: { meishimingcheng: '' }
    }
  },
  mounted() { this.getDataList() },
  methods: {
    getDataList() {
      let url = 'meishijianshang/list?page=' + this.page + '&limit=' + this.limit
      if (this.searchForm.meishimingcheng) {
        url += '&meishimingcheng=' + this.searchForm.meishimingcheng
      }
      this.$http({ url, method: 'get' }).then(({ data }) => {
        if (data && data.code === 0) {
          this.dataList = data.data.list
          this.total = data.data.total
        }
      })
    },
    search() {
      this.page = 1
      this.getDataList()
    },
    goDetail(id) {
      this.$router.push({ path: '/front/meishijianshang/detail', query: { id } })
    }
  }
}
</script>

<style lang="scss" scoped>
.section { max-width: 1200px; margin: 0 auto; padding: 24px 20px; }
.search-bar {
  text-align: center; margin-bottom: 24px; display: flex;
  justify-content: center; gap: 8px;
}
.food-card {
  border-radius: 8px; overflow: hidden; transition: transform 0.2s;
  &:hover { transform: translateY(-4px); }
  .food-name { font-size: 18px; color: #333; margin: 0 0 8px; }
  .food-desc { font-size: 14px; color: #999; line-height: 1.5; margin: 0 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .food-meta { display: flex; justify-content: space-between; align-items: center;
    .price { color: #f56c6c; font-size: 18px; font-weight: bold; }
    .count { color: #999; font-size: 12px; }
  }
}
.img-placeholder { height: 220px; display: flex; align-items: center; justify-content: center; background: #f0f0f0; color: #ccc; }
</style>
