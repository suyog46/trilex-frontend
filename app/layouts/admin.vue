<script setup lang="ts">
import AdminSidebar from '~/components/admin/AdminSidebar.vue'

definePageMeta({
  middleware: ['admin'], 
})
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <AdminSidebar />

    <div class="flex-1 overflow-auto">
      <div class="p-8">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
div {
  scroll-behavior: smooth;
}
</style>
