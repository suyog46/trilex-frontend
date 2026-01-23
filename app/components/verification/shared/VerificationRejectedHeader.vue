<script setup lang="ts">
defineProps<{
  reason?: string
}>()
</script>

<template>
  <div class="text-center mb-6">
    <Icon icon="mdi:alert-circle" class="w-16 h-16 text-red-500 mx-auto mb-4" />
    <h2 class="text-2xl font-bold text-red-600 mb-2">Verification Rejected</h2>
  </div>

  <!-- Rejection Reason -->
  <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
    <p class="text-sm font-semibold text-red-900 mb-2">Reason for Rejection:</p>
    <p class="text-red-700">{{ reason || 'No reason provided' }}</p>
  </div>
</template>
