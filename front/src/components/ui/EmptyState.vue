<template>
  <div class="empty-state">
    <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
    <h3 class="title">{{ title }}</h3>
    <p v-if="message" class="message">{{ message }}</p>
    <div v-if="$slots.action" class="action">
      <slot name="action" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    eyebrow: { type: String, default: '' },
    title: { type: String, required: true },
    message: { type: String, default: '' }
  }
}
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 56px 24px;
  color: var(--ink-soft);

  .eyebrow {
    margin: 0 0 10px;
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .title {
    margin: 0 0 8px;
    color: var(--ink);
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -.01em;
  }
  .message { margin: 0; max-width: 36ch; color: var(--ink-soft); font-size: 15px; line-height: 1.6; }
  .action { margin-top: 22px; }
}
</style>
