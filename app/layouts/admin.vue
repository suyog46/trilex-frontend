<script setup lang="ts">
import AdminSidebar from '~/components/admin/AdminSidebar.vue'

// Enforce admin role for all routes using admin layout
definePageMeta({
  middleware: ['admin'], // Ensure user is authenticated and has admin role
})
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Admin Sidebar -->
    <AdminSidebar />

    <!-- Main Content Area -->
    <div class="flex-1 overflow-auto">
      <div class="p-8">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth scrolling for content area */
div {
  scroll-behavior: smooth;
}
</style>
