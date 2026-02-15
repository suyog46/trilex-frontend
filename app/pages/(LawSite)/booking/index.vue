<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { bookingsApi, type BookingResponse } from '~/composables/api/bookings.api'
import ReceivedBookingsTable from '~/components/tables/ReceivedBookingsTable/ReceivedBookingsTable.vue'
import columns from '~/components/tables/ReceivedBookingsTable/columns'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'lawyer',
})

const data = ref<BookingResponse[]>([])
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const selectedStatus = ref<'pending' | 'accepted' | 'rejected'>('pending')
const isLoading = ref(false)
const abortController = ref<AbortController | null>(null)
const currentFetchingStatus = ref<'pending' | 'accepted' | 'rejected'>('pending')

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
]

const fetchBookings = async () => {
  // Cancel previous request if still pending
  if (abortController.value) {
    abortController.value.abort()
    console.log(' Aborted previous bookings fetch for status:', currentFetchingStatus.value)
  }
  
  // Create new abort controller for this request
  abortController.value = new AbortController()
  currentFetchingStatus.value = selectedStatus.value
  const statusToFetch = selectedStatus.value
  
  isLoading.value = true
  console.log('⏳ Starting to fetch bookings for status:', statusToFetch)
  
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      status: statusToFetch,
    }

    const response = await bookingsApi.getBookingsReceived(params)
    
    // Only update state if this is still the current status
    if (statusToFetch !== currentFetchingStatus.value) {
      console.log('⏭️ Ignoring booking response for old status:', statusToFetch)
      console.log('⏭️ Current status is now:', currentFetchingStatus.value)
      return
    }
    
    data.value = response.results || []
    totalCount.value = response.count || 0
    console.log('✅ Bookings loaded for status:', statusToFetch, response.results?.length)
    
    // Only clear loading if this is the current status
    if (statusToFetch === currentFetchingStatus.value) {
      isLoading.value = false
    }
  } catch (error: any) {
    // Ignore abort errors
    if (error.name === 'AbortError') {
      console.log('⏹️ Bookings fetch was cancelled for status:', statusToFetch)
      return
    }
    
    console.error('Error fetching bookings:', error)
    
    // Only show error and clear loading if this is the current status
    if (statusToFetch === currentFetchingStatus.value) {
      toast.error('Failed to load bookings')
      isLoading.value = false
    }
  }
}

const handleStatusChange = (status: string) => {
  selectedStatus.value = status as 'pending' | 'accepted' | 'rejected'
  currentPage.value = 1
  fetchBookings()
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
  fetchBookings()
}

const handleAccept = () => {
  fetchBookings()
}

const handleReject = () => {
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
        <h1 class="text-3xl font-bold text-gray-900">Booking Requests</h1>
        <p class="text-gray-600 mt-1">Manage incoming booking requests from clients</p>
      </div>
    </div>

    <!-- Status Filter Buttons -->
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
      </button>
    </div>

    <!-- Table with Skeleton Loading -->
    <div class="bg-white rounded-lg p-6">
      <ReceivedBookingsTable
        :data="data"
        :columns="columns"
        :current-page="currentPage"
        :page-size="pageSize"
        :total-count="totalCount"
        :is-loading="isLoading"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        @search="handleSearch"
        @accept="handleAccept"
        @reject="handleReject"
      />
    </div>
  </div>
</template>




