<template>
  <div class="admin-shell">
    <index-header />
    <div class="admin-body">
      <index-aside />
      <index-main />
    </div>
  </div>
</template>

<script>
import IndexAside from '@/components/index/IndexAside'
import IndexHeader from '@/components/index/IndexHeader'
import IndexMain from '@/components/index/IndexMain'

export default {
  components: { IndexAside, IndexHeader, IndexMain }
}
</script>

<style lang="scss" scoped>
.admin-shell {
  min-height: 100vh;
  padding-top: 64px;
  background: var(--paper);
}
.admin-body {
  display: flex;
  align-items: flex-start;
  min-height: calc(100vh - 64px);
}
</style>
