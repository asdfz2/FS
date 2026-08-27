<template>
  <div class="form-page">
    <PageHead
      :eyebrow="eyebrow"
      :title="title"
      :lead="lead"
    >
      <template v-if="$slots.actions" #actions>
        <slot name="actions" />
      </template>
    </PageHead>

    <div class="form-card">
      <slot />
    </div>

    <div class="form-actions" v-if="$slots.actions || !hideDefaultActions">
      <slot name="actions">
        <button class="btn-text" @click="onCancel">{{ cancelText }}</button>
        <button class="btn-primary" :disabled="submitting" @click="$emit('submit')">
          {{ submitting ? '保存中…' : submitText }}
        </button>
      </slot>
    </div>
  </div>
</template>

<script>
import PageHead from '@/components/ui/PageHead.vue'
export default {
  components: { PageHead },
  props: {
    eyebrow:    { type: String, default: 'FORM' },
    title:      { type: String, required: true },
    lead:       { type: String, default: '' },
    submitText: { type: String, default: '保存' },
    cancelText: { type: String, default: '取消' },
    submitting: { type: Boolean, default: false },
    hideDefaultActions: { type: Boolean, default: false }
  },
  emits: ['submit', 'cancel'],
  methods: {
    onCancel() { this.$emit('cancel') }
  }
}
</script>

<style lang="scss" scoped>
.form-page {
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.form-card {
  background: #fff;
  border: 1px solid var(--rule);
  border-radius: var(--r-2);
  padding: 28px 32px;
}
.form-actions {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  background: var(--paper);
  border-top: 1px solid var(--rule);
}
.btn-text {
  padding: 8px 18px;
  border: 0;
  background: transparent;
  color: var(--ink-soft);
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  cursor: pointer;
  &:hover { color: var(--ink); }
}
.btn-primary {
  padding: 10px 22px;
  background: var(--accent);
  color: #fff;
  border: 0;
  border-radius: var(--r-1);
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color .15s ease, transform .12s ease;
  &:hover { background: var(--accent-2); }
  &:active { transform: translateY(1px); }
  &:disabled { opacity: .6; cursor: not-allowed; }
}
</style>
