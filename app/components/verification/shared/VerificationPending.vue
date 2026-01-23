<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '~/components/ui/button'

const props = defineProps<{
  details: Record<string, string | undefined>
}>()

// Filter out undefined or null values
const filteredDetails = computed(() => {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(props.details)) {
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value
    }
  }
  return result
})

const hasDetails = computed(() => Object.keys(filteredDetails.value).length > 0)
</script>

<template>
  <div class="bg-white rounded-lg shadow-lg p-8 text-center">
    <Icon icon="mdi:clock-outline" class="w-16 h-16 text-yellow-500 mx-auto mb-4" />
    <h2 class="text-2xl font-bold text-yellow-600 mb-2">Under Review</h2>
    <p class="text-gray-600 mb-2">Your verification is currently under review.</p>
    <p class="text-gray-600 mb-6">We'll notify you once our admin team completes the verification process.</p>
    
    <!-- Submitted Details -->
    <div class="bg-gray-50 rounded-lg p-6 text-left mb-6">
      <h3 class="font-semibold text-gray-900 mb-4">Submitted Information</h3>
      <div v-if="hasDetails" class="space-y-2 text-sm text-gray-700">
        <p v-for="(value, label) in filteredDetails" :key="label">
          <strong>{{ label }}:</strong> {{ value }}
        </p>
      </div>
      <p v-else class="text-sm text-gray-500">
        Your verification documents have been submitted and are pending review.
      </p>
    </div>

    <Button disabled class="bg-gray-400 text-white px-8 py-3">
      Limited Access
    </Button>
  </div>
</template>
