<template>
  <span class="ui-icon" :class="{ 'is-spin': spin }" :style="sizeStyle" aria-hidden="true">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" :stroke-width="strokeWidth"
         stroke-linecap="round" stroke-linejoin="round">
      <component :is="resolved" />
    </svg>
  </span>
</template>

<script>
// 内置一组最常用的极简线性图标（避免引入 lucide 依赖）。
// 命名与 lucide 一致，调用方可以无感切换。
const PATHS = {
  arrow_right:  '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  arrow_left:   '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  arrow_up_right:'<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  search:       '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  heart:        '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
  star:         '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z"/>',
  star_filled:  '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z" fill="currentColor"/>',
  plus:         '<path d="M5 12h14"/><path d="M12 5v14"/>',
  check:        '<path d="M20 6 9 17l-5-5"/>',
  x:            '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  layout_grid:  '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  layout_list:  '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
  refresh:      '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>',
  log_out:      '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  user:         '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  users:        '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  bookmark:     '<path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/>',
  home:         '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/>',
  message:      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>',
  settings:     '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  spark:        '<path d="M12 3v3"/><path d="M12 18v3"/><path d="M5 12H2"/><path d="M22 12h-3"/><path d="m18.36 5.64-2.12 2.12"/><path d="m7.76 16.24-2.12 2.12"/><path d="m18.36 18.36-2.12-2.12"/><path d="m7.76 7.76-2.12-2.12"/>',
  image:        '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  edit:         '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m18.5 2.5 3 3L12 15l-4 1 1-4Z"/>',
  trash:        '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  more:         '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  chevron_down: '<path d="m6 9 6 6 6-6"/>',
  chevron_right:'<path d="m9 18 6-6-6-6"/>',
  eye:          '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  filter:       '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>',
  trending_up:  '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>'
}

const renderers = Object.fromEntries(
  Object.entries(PATHS).map(([k, p]) => [k, { template: `<g>${p}</g>` }])
)

export default {
  name: 'UiIcon',
  props: {
    name: { type: String, required: true },
    size: { type: [Number, String], default: 18 },
    strokeWidth: { type: [Number, String], default: 1.6 },
    spin: { type: Boolean, default: false }
  },
  computed: {
    resolved() { return renderers[this.name] || null },
    sizeStyle() {
      const n = typeof this.size === 'number' ? `${this.size}px` : this.size
      return { width: n, height: n, 'font-size': n }
    }
  }
}
</script>

<style lang="scss" scoped>
.ui-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  color: currentColor;
  flex: 0 0 auto;
  svg { width: 100%; height: 100%; display: block; }
  &.is-spin svg { animation: ui-icon-spin 1.1s linear infinite; }
}
@keyframes ui-icon-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
