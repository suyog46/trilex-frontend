<script setup lang="ts">
definePageMeta({
  layout: 'client',
  middleware: ['auth', 'client'],
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">My Bookings</h1>
    <UnderConstruction 
      title="My Bookings" 
      message="Manage your lawyer appointments and consultations. This feature is coming soon!" 
    />
  </div>
</template>
