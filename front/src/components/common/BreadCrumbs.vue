<template>
  <nav class="admin-breadcrumb" aria-label="后台导航">
    <button type="button" :class="{ current: items.length === 1 }" @click="go('/index')">
      WORKBENCH
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
  flex-wrap: wrap;
  gap: 8px;
  min-height: 38px;
  padding: 0 14px;
  color: var(--ink-mute);
  background: transparent;
  border: 0;
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: .18em;
  text-transform: uppercase;

  button {
    padding: 0;
    border: 0;
    color: inherit;
    background: transparent;
    cursor: pointer;
    font: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    transition: color .15s ease;

    &:hover:not(.current) { color: var(--accent); }
    &.current { color: var(--ink); font-weight: 600; cursor: default; }
  }
  .separator { color: var(--ink-mute); opacity: .5; }
}
</style>
