<script setup lang="ts">
definePageMeta({
  layout: 'client',
  middleware: ['auth', 'client'],
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">My Cases</h1>
    <UnderConstruction 
      title="My Cases" 
      message="View and manage your legal cases. Track progress, documents, and updates. This feature is coming soon!" 
    />
  </div>
</template>
