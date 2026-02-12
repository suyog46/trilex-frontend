<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import AiChat from './AiChat.vue'

const authStore = useAuthStore()

const isVerified = computed(() => {
  const role = authStore.user?.role
  
  if (role === 'client') {
    return authStore.clientVerificationStatus?.status === 'VERIFIED'
  }
  
  if (role === 'lawyer') {
    return authStore.lawyerVerificationStatus?.status === 'VERIFIED'
  }
  
  if (role === 'firm') {
    return authStore.firmVerificationStatus?.status === 'VERIFIED'
  }
  
  return false
})

const verificationStatus = computed(() => {
  const role = authStore.user?.role
  
  if (role === 'client') {
    return authStore.clientVerificationStatus?.status
  }
  
  if (role === 'lawyer') {
    return authStore.lawyerVerificationStatus?.status
  }
  
  if (role === 'firm') {
    return authStore.firmVerificationStatus?.status
  }
  
  return null
})

const getVerificationPath = () => {
  const role = authStore.user?.role
  
  if (role === 'client') return '/client/verification-status'
  if (role === 'lawyer') return '/lawyer/verification'
  if (role === 'firm') return '/law-firm/verification'
  
  return '/'
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div
      v-if="!isVerified && verificationStatus !== 'PENDING'"
      class="flex-1 flex items-center justify-center p-8"
    >
      <div class="max-w-md text-center">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-100 flex items-center justify-center">
          <Icon icon="mdi:shield-alert-outline" class="w-10 h-10 text-yellow-600" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-3">Verification Required</h2>
        <p class="text-gray-600 mb-6">
          To access the AI Legal Assistant, you need to complete your profile verification first.
        </p>
        <NuxtLink
          :to="getVerificationPath()"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary-normal text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          <Icon icon="mdi:shield-check" class="w-5 h-5" />
          Complete Verification
        </NuxtLink>
      </div>
    </div>

    <div
      v-else-if="verificationStatus === 'PENDING'"
      class="flex-1 flex items-center justify-center p-8"
    >
      <div class="max-w-md text-center">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
          <Icon icon="mdi:clock-outline" class="w-10 h-10 text-blue-600" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-3">Verification Under Review</h2>
        <p class="text-gray-600 mb-4">
          Your profile is currently being verified. This usually takes 24-48 hours.
        </p>
        <p class="text-sm text-gray-500">
          You'll be able to access the AI Assistant once your verification is complete.
        </p>
      </div>
    </div>

    <div v-else class="flex-1 overflow-hidden">
      <AiChat />
    </div>
  </div>
</template>
