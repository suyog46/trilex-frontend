<script setup lang="ts">
import type { LawyerRecommendation } from '~/composables/api/ai-assistant.api'

interface Props {
  lawyer: LawyerRecommendation
}

const props = defineProps<Props>()

const navigateToLawyer = () => {
  navigateTo(`/client/lawyers/${props.lawyer.id}`)
}

const getLocationString = () => {
  const { province, district, municipality } = props.lawyer.profile.address
  return `${province.title}, ${district.title}, ${municipality.title}`
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div class="flex items-start gap-4">
      <div class="w-12 h-12 rounded-full bg-primary-normal text-white flex items-center justify-center text-lg font-semibold flex-shrink-0">
        {{ lawyer.verification.full_name.charAt(0).toUpperCase() }}
      </div>

      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-gray-900 mb-1">{{ lawyer.verification.full_name }}</h3>
        <p class="text-sm text-gray-600 mb-2">{{ lawyer.user.email }}</p>

        <div class="flex flex-wrap gap-2 mb-2">
          <span 
            v-for="service in lawyer.profile.services" 
            :key="service.id"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {{ service.name }}
          </span>
        </div>

        <div class="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <Icon icon="mdi:map-marker" class="w-4 h-4" />
          <span class="truncate">{{ getLocationString() }}</span>
        </div>

        <button
          @click="navigateToLawyer"
          class="w-full sm:w-auto px-4 py-2 bg-primary-normal text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
        >
          View Details
        </button>
      </div>
    </div>
  </div>
</template>
