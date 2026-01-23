<script setup lang="ts">
definePageMeta({
  layout: 'lawyer',
  middleware: ['auth', 'verification'],
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-primary-normal mb-6">User Management</h1>
    <UnderConstruction 
      title="User Management" 
      message="Manage your firm's users, roles, and permissions. This feature is coming soon!" 
    />
  </div>
</template>
