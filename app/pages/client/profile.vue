<script setup lang="ts">
definePageMeta({
  layout: 'client',
  middleware: ['auth', 'client'],
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
    <UnderConstruction 
      title="My Profile" 
      message="View and edit your profile information, settings, and preferences. This feature is coming soon!" 
    />
  </div>
</template>
