<template>
  <main class="admin-main">
    <bread-crumbs />
    <div class="admin-router">
      <router-view />
    </div>
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
  padding: 28px 36px 56px;
  background: var(--paper);
}
.admin-router {
  margin-top: 22px;
  background: transparent;
}

@media (max-width: 860px) {
  .admin-main { padding: 20px 16px 40px; }
}
</style>
