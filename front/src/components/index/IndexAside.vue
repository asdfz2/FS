<template>
  <aside class="admin-aside" aria-label="后台导航">
    <p class="aside-eyebrow">NAVIGATION</p>
    <nav>
      <button
        type="button"
        class="menu-item"
        :class="{ 'is-active': $route.path === '/index' }"
        @click="go('/index')"
      >
        <span class="bar" aria-hidden="true"></span>
        <span class="label">工作台</span>
      </button>

      <button
        v-for="item in menuItems"
        :key="item.path"
        type="button"
        class="menu-item"
        :class="{ 'is-active': $route.path === item.path }"
        @click="go(item.path)"
      >
        <span class="bar" aria-hidden="true"></span>
        <span class="label">{{ item.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<script>
import menu from '@/utils/menu'
import storage from '@/utils/storage'

export default {
  computed: {
    menuItems() {
      const role = storage.get('role')
      const roleMenu = menu.list().find(item => item.roleName === role)
      return (roleMenu?.backMenu || []).map(group => {
        const child = group.child?.[0]
        return { label: group.menu, path: child ? `/${child.tableName}` : '' }
      }).filter(item => item.path)
    }
  },
  methods: {
    go(path) {
      if (path && this.$route.path !== path) this.$router.push(path)
    }
  }
}
</script>

<style lang="scss" scoped>
.admin-aside {
  flex: 0 0 240px;
  min-height: calc(100vh - 64px);
  padding: 32px 18px 48px;
  background: var(--paper);
  border-right: 1px solid var(--rule);
  overflow-y: auto;
  position: sticky;
  top: 64px;
  align-self: flex-start;
}

.aside-eyebrow {
  margin: 0 12px 14px;
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .24em;
  text-transform: uppercase;
  color: var(--ink-mute);
}

nav { display: flex; flex-direction: column; gap: 2px; }

.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0;
  padding: 12px 14px;
  background: transparent;
  border: 0;
  border-radius: var(--r-1);
  color: var(--ink-soft);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background-color .15s ease, color .15s ease;
  overflow: hidden;
}
.menu-item .bar {
  display: inline-block;
  width: 2px;
  height: 18px;
  margin-right: 12px;
  background: transparent;
  border-radius: 2px;
  transition: background-color .15s ease;
}
.menu-item:hover { color: var(--ink); background: var(--paper-2); }
.menu-item.is-active {
  color: var(--ink);
  background: var(--paper-2);
  font-weight: 600;
}
.menu-item.is-active .bar { background: var(--accent); }

@media (max-width: 860px) {
  .admin-aside { display: none; }
}
</style>
