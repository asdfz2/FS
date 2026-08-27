<template>
  <div class="action-bar" :class="{ 'is-stacked': stacked }">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'ActionBar',
  props: {
    stacked: { type: Boolean, default: false }
  }
}
</script>

<style lang="scss" scoped>
.action-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 22px;
  align-items: center;
  margin: 24px 0 0;

  &.is-stacked {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
