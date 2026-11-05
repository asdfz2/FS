<template>
  <AdminCrudPage :schema="commentSchema" />
</template>

<script setup>
import AdminCrudPage from '@/components/admin/AdminCrudPage.vue'
import { commentSchema } from '@/admin/schemas'
</script>
