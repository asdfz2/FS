<template>
  <AdminCrudPage :schema="bannerSchema" />
</template>

<script setup>
import AdminCrudPage from '@/components/admin/AdminCrudPage.vue'
import { bannerSchema } from '@/admin/schemas'
</script>
