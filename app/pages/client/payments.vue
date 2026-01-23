<script setup lang="ts">
definePageMeta({
  layout: 'client',
  middleware: ['auth', 'client'],
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Payments</h1>
    <UnderConstruction 
      title="Payments" 
      message="Manage your payments, invoices, and billing history. This feature is coming soon!" 
    />
  </div>
</template>
