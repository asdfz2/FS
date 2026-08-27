<template>
  <div class="list-page">
    <PageHead
      :eyebrow="eyebrow"
      :title="title"
      :lead="lead"
    >
      <template v-if="$slots.actions" #actions>
        <slot name="actions" />
      </template>
    </PageHead>

    <div class="list-toolbar" v-if="$slots.toolbar">
      <slot name="toolbar" />
    </div>

    <div class="list-card">
      <slot />
    </div>

    <div class="list-footer" v-if="$slots.footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script>
import PageHead from '@/components/ui/PageHead.vue'
export default {
  components: { PageHead },
  props: {
    eyebrow: { type: String, default: 'LIST' },
    title:   { type: String, required: true },
    lead:    { type: String, default: '' }
  }
}
</script>

<style lang="scss" scoped>
.list-page {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.list-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border: 1px solid var(--rule);
  border-radius: var(--r-2);
}
.list-card {
  background: #fff;
  border: 1px solid var(--rule);
  border-radius: var(--r-2);
  padding: 8px 18px 14px;
  overflow: hidden;
}
.list-footer {
  display: flex;
  justify-content: flex-end;
}

/* 内部 el-table / el-form 气质统一 */
:deep(.el-table) { background: transparent; }
:deep(.el-table .el-table__row) { transition: background-color .15s ease; }
:deep(.el-button + .el-button) { margin-left: 6px; }
</style>
