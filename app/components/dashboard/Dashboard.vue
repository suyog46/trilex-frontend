<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import LawyerDashboard from './LawyerDashboard.vue'
import LawFirmDashboard from './LawFirmDashboard.vue'

const authStore = useAuthStore()

const isLawFirm = computed(() => authStore.user?.role === 'law_firm')
</script>

<template>
  <LawyerDashboard v-if="!isLawFirm" />
  <LawFirmDashboard v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
</script>
