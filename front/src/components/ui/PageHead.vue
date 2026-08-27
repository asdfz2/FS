<template>
  <header class="page-head" :class="{ 'is-dark': dark }">
    <p v-if="eyebrow" class="eyebrow">
      <span class="dot" aria-hidden="true"></span>
      {{ eyebrow }}
    </p>
    <h1 v-if="title" class="title">
      <slot name="title">{{ title }}</slot>
    </h1>
    <p v-if="$slots.lead || lead" class="lead">
      <slot name="lead">{{ lead }}</slot>
    </p>
    <div v-if="$slots.actions" class="actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script>
export default {
  name: 'PageHead',
  props: {
    eyebrow: { type: String, default: '' },
    title: { type: String, default: '' },
    lead: { type: String, default: '' },
    dark: { type: Boolean, default: false }
  }
}
</script>

<style lang="scss" scoped>
.page-head {
  position: relative;
  margin: 0 0 28px;

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 14px;
    font-family: var(--font-display);
    font-size: var(--fs-eyebrow);
    font-weight: 600;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: var(--accent);

    .dot {
      display: inline-block;
      width: 6px; height: 6px;
      border-radius: var(--r-pill);
      background: var(--accent);
    }
  }

  .title {
    margin: 0;
    color: var(--ink);
    font-family: var(--font-display);
    font-weight: 600;
    font-size: var(--fs-h1);
    line-height: 1.08;
    letter-spacing: -.01em;
    font-variation-settings: "opsz" 96;
  }

  .lead {
    max-width: 56ch;
    margin: 14px 0 0;
    color: var(--ink-soft);
    font-size: var(--fs-lead);
    line-height: 1.6;
  }

  .actions {
    margin-top: 22px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  &.is-dark {
    .title, .lead { color: #fbf7f0; }
    .lead { color: rgba(251, 247, 240, .72); }
  }
}

@media (max-width: 720px) {
  .page-head .title { font-size: 32px; }
  .page-head .lead { font-size: 16px; }
}
</style>
