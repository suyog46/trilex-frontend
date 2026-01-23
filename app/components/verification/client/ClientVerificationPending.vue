<script setup lang="ts">
import { Button } from '~/components/ui/button'

interface Props {
  fullName?: string
  dateOfBirth?: string
  idType?: string
}

defineProps<Props>()
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
      <div class="space-y-2 text-sm text-gray-700">
        <p><strong>Full Name:</strong> {{ fullName }}</p>
        <p><strong>Date of Birth:</strong> {{ dateOfBirth }}</p>
        <p><strong>ID Type:</strong> {{ idType }}</p>
      </div>
    </div>

    <Button disabled class="bg-gray-400 text-white px-8 py-3">
      Limited Access
    </Button>
  </div>
</template>
