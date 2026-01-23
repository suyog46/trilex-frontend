<script setup lang="ts">
definePageMeta({
  layout: 'lawyer',
  middleware: ['auth', 'verification'],
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-primary-normal mb-6">Ongoing Bookings</h1>
    <UnderConstruction 
      title="Ongoing Bookings" 
      message="View and manage your ongoing booking requests. This feature is coming soon!" 
    />
  </div>
</template>