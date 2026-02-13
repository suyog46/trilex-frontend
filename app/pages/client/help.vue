<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'client'],
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Help & Support</h1>
    <UnderConstruction 
      title="Help & Support" 
      message="Get help with your account, FAQs, and contact our support team. This feature is coming soon!" 
    />
  </div>
</template>
