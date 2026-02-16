<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { Firm } from '~/composables/api/firms.api'

const props = defineProps<{
  firm: Firm
}>()

const formattedAddress = computed(() => {
  const addr = props.firm.profile?.address
  if (!addr) return 'N/A'
  
  const parts = []
  if (addr.municipality?.title) parts.push(addr.municipality.title)
  if (addr.district?.title) parts.push(addr.district.title)
  if (addr.province?.title) parts.push(addr.province.title)
  
  return parts.length > 0 ? parts.join(', ') : 'N/A'
})

const firmId = computed(() => {
  return props.firm?.id ||  ''
})
</script>

<template>
  <div class="w-full max-w-[340px] cursor-pointer rounded-xl flex flex-col p-6 bg-white border border-primary-light-active/50 hover:border-primary-normal/30 hover:shadow-xl hover:shadow-primary-normal/5 transition-all duration-300 group">
    <div class="w-full h-48 bg-gradient-to-br from-primary-light-active to-primary-light rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
      <div class="absolute inset-0 bg-primary-normal/0 group-hover:bg-primary-normal/10 transition-colors duration-300" />
      <img 
        v-if="firm.verification?.firm_license?.url" 
        :src="firm.verification.firm_license.url" 
        :alt="firm.verification?.firm_name || 'Law Firm'"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <Icon v-else icon="mdi:office-building" class="w-16 h-16 text-primary-normal group-hover:scale-110 transition-transform duration-300" />
    </div>

    <div class="flex flex-col gap-4 flex-1">
      <div>
        <h2 class="text-xl font-semibold text-primary-normal mb-2 line-clamp-1 group-hover:text-primary-normal-hover transition-colors duration-300">
          {{ firm.verification?.firm_name || 'Law Firm' }}
        </h2>
        <p class="text-gray-600 text-sm line-clamp-2 flex items-center gap-1">
          <Icon icon="mdi:email-outline" class="w-4 h-4 flex-shrink-0" />
          {{ firm.user?.email || 'No email provided' }}
        </p>
      </div>

      <div v-if="firm.profile?.services?.length" class="flex flex-wrap gap-2">
        <span 
          v-for="service in firm.profile.services.slice(0, 3)" 
          :key="service.id"
          class="px-3 py-1 bg-primary-light/80 text-primary-normal text-xs font-medium rounded-full hover:bg-primary-light-active transition-colors duration-200"
        >
          {{ service.name }}
        </span>
        <span 
          v-if="firm.profile.services.length > 3"
          class="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"
        >
          +{{ firm.profile.services.length - 3 }} 
        </span>
      </div>

      <div class="flex flex-col gap-3 border-t border-primary-light-active/50 pt-4 mt-auto">
        <div class="flex justify-between items-center">
          <p class="text-gray-500 font-medium text-sm flex items-center gap-1">
            <Icon icon="mdi:phone-outline" class="w-4 h-4" />
            Phone
          </p>
          <p class="text-gray-700 font-semibold text-sm">{{ firm.profile?.phone_number || 'N/A' }}</p>
        </div>
        <div class="flex justify-between gap-5 items-center">
          <p class="text-gray-500 font-medium text-sm flex items-center gap-1">
            <Icon icon="mdi:map-marker-outline" class="w-4 h-4" />
            Location
          </p>
          <p class="text-gray-700 font-semibold text-sm line-clamp-1">{{ formattedAddress }}</p>
        </div>
      </div>

      <NuxtLink
        :to="`/s/${firmId}`"
        class="w-full py-3 mt-4 bg-primary-normal text-white font-semibold rounded-xl hover:bg-primary-normal-hover transition-all duration-300 text-center flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-primary-normal/20"
      >
        View Details
        <Icon icon="mdi:arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
      </NuxtLink>
    </div>
  </div>
</template>
