<template>
  <article class="home-card">
    <p class="eyebrow">
      <span class="dot" aria-hidden="true"></span>
      {{ title }}
    </p>
    <p class="number">
      <span class="value">{{ content }}</span>
      <span class="unit" v-if="contentUnit">{{ contentUnit }}</span>
    </p>
    <p class="bottom">
      <span>{{ bottomTitle }}</span>
      <span class="delta">
        {{ bottomContent }}
        <ui-icon v-if="trend === 'up'" name="trending_up" :size="14" />
        <ui-icon v-else-if="trend === 'down'" name="trending_up" :size="14" class="flip" />
      </span>
    </p>
  </article>
</template>

<script>
import UiIcon from '@/components/ui/Icon.vue'
export default {
  components: { UiIcon },
  props: {
    title:       { type: String, required: true },
    titleUnit:   { type: String, default: '' },
    content:     { type: [String, Number], required: true },
    contentUnit: { type: String, default: '' },
    bottomTitle: { type: String, default: '' },
    bottomContent:{ type: String, default: '' },
    trend:       { type: String, default: '' } // up | down | ''
  }
}
</script>

<style lang="scss" scoped>
.home-card {
  background: #fff;
  border: 1px solid var(--rule);
  border-radius: var(--r-2);
  padding: 22px 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 132px;
  transition: box-shadow .2s ease, transform .2s ease;
  &:hover { box-shadow: var(--shadow-1); transform: translateY(-1px); }
}
.eyebrow {
  margin: 0;
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--ink-soft);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  .dot { width: 6px; height: 6px; border-radius: 999px; background: var(--accent); }
}
.number {
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 6px;
  .value {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 38px;
    line-height: 1;
    color: var(--ink);
    letter-spacing: -.02em;
    font-variation-settings: "opsz" 96;
  }
  .unit {
    font-family: var(--font-display);
    font-size: 14px;
    color: var(--ink-mute);
  }
}
.bottom {
  margin: auto 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid var(--rule);
  font-size: 12px;
  color: var(--ink-mute);
  .delta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--ink-soft);
    .flip { transform: rotate(180deg); }
  }
}
</style>
