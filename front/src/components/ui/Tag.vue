<template>
  <span class="ui-tag" :class="['is-' + tone, { 'is-outlined': outlined }]">
    <slot />
  </span>
</template>

<script>
export default {
  name: 'UiTag',
  props: {
    tone: { type: String, default: 'neutral' }, // neutral | accent | ok | warn | err
    outlined: { type: Boolean, default: true }
  }
}
</script>

<style lang="scss" scoped>
.ui-tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: var(--r-pill);
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
  line-height: 1;
  white-space: nowrap;
  border: 1px solid var(--rule);
  background: var(--paper-2);
  color: var(--ink-soft);

  &.is-accent { color: var(--accent); border-color: var(--accent-soft); background: var(--accent-soft); }
  &.is-ok     { color: var(--ok);       border-color: #c9e3d2;             background: #e9f3ec; }
  &.is-warn   { color: var(--warn);     border-color: #e8d6a4;             background: #faf2dd; }
  &.is-err    { color: var(--err);      border-color: #e9b8b3;             background: #fbe3df; }
}
</style>
