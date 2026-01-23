<template>
  <LawyerDashboard v-if="!isLawFirm" />
  <LawFirmDashboard v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import LawyerDashboard from '~/components/dashboard/LawyerDashboard.vue'
import LawFirmDashboard from '~/components/dashboard/LawFirmDashboard.vue'

definePageMeta({
  layout: 'lawyer',
  middleware: ['auth', 'verification'],
})

const authStore = useAuthStore()

const isLawFirm = computed(() => authStore.user?.role === 'firm')
</script>
