<script setup lang="ts">
definePageMeta({
  layout: 'client',
  middleware: ['auth', 'client'],
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Messages</h1>
    <UnderConstruction 
      title="Messages" 
      message="Communicate with your lawyers securely. This messaging feature is coming soon!" 
    />
  </div>
</template>
