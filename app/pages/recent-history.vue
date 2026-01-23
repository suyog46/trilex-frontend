<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 pt-20">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-primary-normal mb-6">Recent History</h1>
      <UnderConstruction 
        title="Recent History" 
        message="View your recently visited lawyers, law firms, and cases. This feature is coming soon!" 
      />
    </div>
  </div>
</template>
