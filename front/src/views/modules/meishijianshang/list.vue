<template>
  <AdminCrudPage :schema="foodSchema" />
</template>

<script setup>
import AdminCrudPage from '@/components/admin/AdminCrudPage.vue'
import { foodSchema } from '@/admin/schemas'
</script>
