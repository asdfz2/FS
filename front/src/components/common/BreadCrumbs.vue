<template>
  <nav class="admin-breadcrumb" aria-label="后台导航">
    <button type="button" :class="{ current: items.length === 1 }" @click="go('/index')">
      后台
    </button>
    <template v-for="item in items" :key="item.label">
      <span class="separator">/</span>
      <button type="button" :class="{ current: item.current }" @click="item.path && go(item.path)">
        {{ item.label }}
      </button>
    </template>
  </nav>
</template>

<script>
export default {
  name: 'BreadCrumbs',
  computed: {
    items() {
      if (this.$route.path === '/index') {
        return [{ label: '工作台', current: true }]
      }
      return [{
        label: this.$route.meta?.menu || this.$route.name || '页面',
        path: this.$route.path,
        current: true
      }]
    }
  },
  methods: {
    go(path) {
      if (this.$route.path !== path) this.$router.push(path)
    }
  }
}
</script>

<style lang="scss" scoped>
.admin-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 14px;
  color: #67756f;
  background: #fff;
  border: 1px solid #e7ece9;
  border-radius: 6px;
  font-size: 13px;

  button {
    padding: 0;
    border: 0;
    color: inherit;
    background: transparent;
    cursor: pointer;

    &:hover:not(.current) { color: #008565; }
    &.current { color: #263238; font-weight: 600; cursor: default; }
  }

  .separator { color: #b7c2bc; }
}
</style>
