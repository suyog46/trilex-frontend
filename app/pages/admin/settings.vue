<script setup lang="ts">
import UnderConstruction from '~/components/shared/UnderConstruction.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
      <p class="text-gray-600 mt-1">Manage your admin preferences</p>
    </div>
    
    <UnderConstruction 
      title="Settings Coming Soon"
      message="We're working on building the admin settings panel. You'll be able to configure system preferences, notifications, and more."
    />
  </div>
</template>
