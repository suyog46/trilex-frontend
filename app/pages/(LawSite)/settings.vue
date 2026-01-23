<script setup lang="ts">
definePageMeta({
  layout: 'lawyer',
  middleware: ['auth', 'verification'],
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-primary-normal mb-6">Settings</h1>
    <UnderConstruction 
      title="Settings" 
      message="Manage your account settings, preferences, and configurations. This feature is coming soon!" 
    />
  </div>
</template>
