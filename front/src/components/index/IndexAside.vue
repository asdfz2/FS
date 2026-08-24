<template>
  <aside class="admin-aside">
    <el-menu :default-active="activePath" class="admin-menu">
      <el-menu-item index="/index" @click="menuHandler('/index')">
        <el-icon><HomeFilled /></el-icon>
        <span>工作台</span>
      </el-menu-item>

      <el-menu-item
        v-for="item in menuItems"
        :key="item.path"
        :index="item.path"
        @click="menuHandler(item.path)"
      >
        {{ item.label }}
      </el-menu-item>
    </el-menu>
  </aside>
</template>

<script>
import { HomeFilled } from '@element-plus/icons-vue'
import menu from '@/utils/menu'
import storage from '@/utils/storage'

export default {
  components: { HomeFilled },
  computed: {
    activePath() {
      return this.$route.path
    },
    menuItems() {
      const role = storage.get('role')
      const roleMenu = menu.list().find(item => item.roleName === role)
      return (roleMenu?.backMenu || []).map(group => {
        const child = group.child?.[0]
        return {
          label: group.menu,
          path: child ? `/${child.tableName}` : ''
        }
      }).filter(item => item.path)
    }
  },
  methods: {
    menuHandler(path) {
      if (this.$route.path !== path) {
        this.$router.push(path)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.admin-aside {
  flex: 0 0 232px;
  min-height: calc(100vh - 64px);
  overflow-y: auto;
  background: #fff;
  border-right: 1px solid #e7ece9;
}

.admin-menu {
  padding: 10px;
  border-right: 0;

  :deep(.el-menu-item) {
    height: 44px;
    margin-bottom: 3px;
    border-radius: 6px;
    line-height: 44px;
  }

  :deep(.el-menu-item.is-active) {
    color: #008565;
    background: rgba(0, 165, 125, .10);
  }
}
</style>
