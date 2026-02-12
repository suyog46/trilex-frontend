<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { bookingsApi, type BookingResponse } from '~/composables/api/bookings.api'
import ReceivedBookingsTable from '~/components/tables/ReceivedBookingsTable/ReceivedBookingsTable.vue'
import columns from '~/components/tables/ReceivedBookingsTable/columns'
import SimpleTabs from '~/components/ui/tabs/SimpleTabs.vue'
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

const statusTabs = [
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'rejected', label: 'Rejected' },
]

const fetchBookings = async () => {
  isLoading.value = true
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      status: selectedStatus.value,
    }

    const response = await bookingsApi.getBookingsReceived(params)
    data.value = response.results || []
    totalCount.value = response.count || 0
  } catch (error: any) {
    console.error('Error fetching bookings:', error)
    toast.error('Failed to load bookings')
  } finally {
    isLoading.value = false
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
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Booking Requests</h1>
      <p class="text-gray-600 mt-1">Manage incoming booking requests from clients</p>
    </div>

    <div class="bg-white rounded-lg">
      <SimpleTabs
        v-model="selectedStatus"
        :tabs="statusTabs"
        @update:model-value="handleStatusChange"
      />
    </div>

    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <div class="text-center">
        <Icon icon="mdi:loading" class="w-12 h-12 text-primary-normal animate-spin mx-auto mb-4" />
        <p class="text-gray-600">Loading bookings...</p>
      </div>
    </div>

    <div v-else-if="data.length === 0" class="text-center py-20">
      <Icon icon="mdi:inbox" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-gray-700 mb-2">No Bookings Found</h3>
      <p class="text-gray-500">
        You don't have any {{ selectedStatus }} booking requests.
      </p>
    </div>

    <div v-else class="bg-white rounded-lg p-6">
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




