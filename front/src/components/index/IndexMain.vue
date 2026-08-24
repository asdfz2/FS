<template>
  <main class="admin-main">
    <bread-crumbs />
    <router-view class="router-view" />
  </main>
</template>

<script>
export default {
  name: 'IndexMain'
}
</script>

<style lang="scss" scoped>
.admin-main {
  flex: 1;
  min-width: 0;
  padding: 22px 26px 34px;
  background: #f4f7f5;
}

.router-view {
  margin-top: 18px;
  background: transparent;
}
</style>
