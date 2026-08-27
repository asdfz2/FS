<template>
  <div class="page-shell" :class="{ 'is-narrow': narrow }">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'PageShell',
  props: {
    narrow: { type: Boolean, default: false }
  }
}
</script>

<style lang="scss" scoped>
.page-shell {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 56px var(--gutter) 80px;
  &.is-narrow { max-width: 720px; }
}

@media (max-width: 720px) {
  .page-shell { padding: 32px 16px 56px; }
}
</style>
