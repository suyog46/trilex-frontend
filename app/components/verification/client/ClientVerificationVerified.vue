<script setup lang="ts">
import { Button } from '~/components/ui/button'

const emit = defineEmits<{
  navigate: []
}>()
</script>

<template>
  <div class="bg-white rounded-lg shadow-lg p-8 text-center">
    <Icon icon="mdi:check-circle" class="w-16 h-16 text-green-500 mx-auto mb-4" />
    <h2 class="text-2xl font-bold text-green-600 mb-2">Verified</h2>
    <p class="text-gray-600 mb-6">Your ID verification is complete. You can now access all features.</p>
    <Button
      @click="emit('navigate')"
      class="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
    >
      Go to Dashboard
    </Button>
  </div>
</template>
