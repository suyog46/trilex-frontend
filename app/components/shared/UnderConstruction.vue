<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

defineProps<{
  title?: string
  message?: string
}>()

const authStore = useAuthStore()

// Compute dashboard path based on user role
const dashboardPath = computed(() => {
  const role = authStore.user?.role
  switch (role) {
    case 'lawyer':
      return '/lawyer/dashboard'
    case 'firm':
      return '/law-firm/dashboard'
    case 'admin':
      return '/admin/dashboard'
    case 'client':
    default:
      return '/client/dashboard'
  }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
    <div class="bg-primary-light/30 rounded-full p-6 mb-6">
      <Icon icon="mdi:construction" class="w-16 h-16 text-primary-normal" />
    </div>
    <h2 class="text-2xl font-bold text-primary-normal mb-3">
      {{ title || 'Under Construction' }}
    </h2>
    <p class="text-gray-600 max-w-md mb-6">
      {{ message || 'This page is currently being built. Please check back soon for updates!' }}
    </p>
    <div class="flex items-center gap-2 text-sm text-primary-normal/70">
      <Icon icon="mdi:clock-outline" class="w-4 h-4" />
      <span>Coming Soon</span>
    </div>
    <div class="mt-8 flex gap-4">
      <button 
        @click="$router.back()"
        class="px-6 py-2 border-2 border-primary-normal text-primary-normal rounded-lg hover:bg-primary-light/30 transition-colors font-medium"
      >
        Go Back
      </button>
      <NuxtLink 
        :to="dashboardPath"
        class="px-6 py-2 bg-primary-normal text-white rounded-lg hover:bg-primary-normal-hover transition-colors font-medium"
      >
        Dashboard
      </NuxtLink>
    </div>
  </div>
</template>
