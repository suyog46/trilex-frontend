<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { bookingsApi, type BookingResponse } from '~/composables/api/bookings.api'
import BookingsTable from '~/components/tables/BookingsTable/BookingsTable.vue'
import columns from '~/components/tables/BookingsTable/columns'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'client',
  middleware: ['auth', 'client'],
})

// State
const data = ref<BookingResponse[]>([])
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const selectedStatus = ref<'all' | 'pending' | 'accepted' | 'rejected'>('all')
const isLoading = ref(false)

const statusOptions = [
  { value: 'all', label: 'All Bookings' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
]

const fetchBookings = async () => {
  isLoading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      page_size: pageSize.value,
    }

    // Add status filter if not 'all'
    if (selectedStatus.value !== 'all') {
      params.status = selectedStatus.value
    }

    const response = await bookingsApi.getBookingsSent(params)
    data.value = response.results || []
    totalCount.value = response.count || 0
  } catch (error: any) {
    console.error('Error fetching bookings:', error)
    toast.error('Failed to load bookings')
  } finally {
    isLoading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchBookings()
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchBookings()
}

const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1
  // Note: Search is handled client-side or backend depending on your API
  // For now, we'll just refetch with the current filters
  fetchBookings()
}

const handleStatusChange = (status: string) => {
  selectedStatus.value = status as any
  currentPage.value = 1
  fetchBookings()
}

onMounted(() => {
  fetchBookings()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p class="text-gray-600 mt-1">Manage your lawyer and law firm bookings</p>
      </div>
    </div>

    <!-- Status Filter -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="option in statusOptions"
        :key="option.value"
        @click="handleStatusChange(option.value)"
        :class="[
          'px-4 py-2 rounded-lg font-medium transition-colors',
          selectedStatus === option.value
            ? 'bg-primary-normal text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        {{ option.label }}
        <span v-if="option.value === 'all'" class="ml-2 text-sm">({{ totalCount }})</span>
      </button>
    </div>

    <!-- Bookings Table -->
    <BookingsTable
      :data="data"
      :columns="columns"
      :current-page="currentPage"
      :page-size="pageSize"
      :total-count="totalCount"
      :is-loading="isLoading"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
      @search="handleSearch"
    />

    <!-- Empty State -->
    <div 
      v-if="!isLoading && data.length === 0"
      class="text-center py-20"
    >
      <Icon icon="mdi:calendar-blank" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-gray-700 mb-2">No Bookings Found</h3>
      <p class="text-gray-500 mb-6">
        {{
          selectedStatus === 'all'
            ? "You haven't created any bookings yet."
            : `You don't have any ${selectedStatus} bookings.`
        }}
      </p>
      <NuxtLink
        to="/client/lawyers"
        class="inline-flex items-center gap-2 px-6 py-3 bg-primary-normal text-white rounded-lg hover:bg-primary-normal-hover transition-colors font-medium"
      >
        <Icon icon="mdi:magnify" class="w-5 h-5" />
        Browse Lawyers
      </NuxtLink>
    </div>
  </div>
</template>
