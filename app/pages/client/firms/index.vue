<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { firmsApi, type Firm } from '~/composables/api/firms.api'
import LawFirmCard from '~/components/cards/LawFirmCard.vue'
import { Button } from '~/components/ui/button'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'client',
  middleware: ['auth', 'client'],
})

const firms = ref<Firm[]>([])
const isLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(12)
const totalCount = ref(0)
const hasNext = ref(false)
const hasPrevious = ref(false)

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

const fetchFirms = async () => {
  isLoading.value = true
  try {
    const response = await firmsApi.getFirms({
      page: currentPage.value,
      page_size: pageSize.value,
    })
    
    firms.value = response.results || []
    totalCount.value = response.count || 0
    hasNext.value = !!response.next
    hasPrevious.value = !!response.previous
  } catch (error: any) {
    console.error('Error fetching firms:', error)
    toast.error('Failed to load law firms')
  } finally {
    isLoading.value = false
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchFirms()
  }
}

const nextPage = () => {
  if (hasNext.value) {
    currentPage.value++
    fetchFirms()
  }
}

const prevPage = () => {
  if (hasPrevious.value) {
    currentPage.value--
    fetchFirms()
  }
}

onMounted(() => {
  fetchFirms()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Find Law Firms</h1>
        <p class="text-gray-600 mt-2">Browse verified law firms and find the right one for your legal needs</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <Icon icon="mdi:loading" class="w-12 h-12 text-primary-normal animate-spin mx-auto mb-4" />
          <p class="text-gray-600">Loading law firms...</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="firms.length === 0" class="text-center py-20">
        <Icon icon="mdi:office-building-remove" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-gray-700 mb-2">No Law Firms Found</h3>
        <p class="text-gray-500">There are no law firms available at the moment.</p>
      </div>

      <!-- Firms Grid -->
      <div v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <LawFirmCard 
            v-for="firm in firms" 
            :key="firm.verification?.id || firm.user?.email" 
            :firm="firm" 
          />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-8 flex justify-center items-center gap-2">
          <Button
            variant="outline"
            :disabled="!hasPrevious"
            @click="prevPage"
            class="flex items-center gap-1"
          >
            <Icon icon="mdi:chevron-left" class="w-5 h-5" />
            Previous
          </Button>

          <div class="flex items-center gap-1">
            <button
              v-for="page in totalPages"
              :key="page"
              @click="goToPage(page)"
              class="w-10 h-10 rounded-lg font-medium transition-colors"
              :class="page === currentPage 
                ? 'bg-primary-normal text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'"
            >
              {{ page }}
            </button>
          </div>

          <Button
            variant="outline"
            :disabled="!hasNext"
            @click="nextPage"
            class="flex items-center gap-1"
          >
            Next
            <Icon icon="mdi:chevron-right" class="w-5 h-5" />
          </Button>
        </div>

        <!-- Results Info -->
        <div class="mt-4 text-center text-sm text-gray-500">
          Showing {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, totalCount) }} of {{ totalCount }} firms
        </div>
      </div>
    </div>
  </div>
</template>
