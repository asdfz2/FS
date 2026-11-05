<template>
  <AdminCrudPage :schema="userSchema" />
</template>

<script setup>
import AdminCrudPage from '@/components/admin/AdminCrudPage.vue'
import { userSchema } from '@/admin/schemas'
</script>
