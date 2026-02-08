<script setup lang="ts">
import { ref } from 'vue'
import ReusableTable from '~/components/ReusableTable.vue'
import ReceivedBookingDetailDialog from './ReceivedBookingDetailDialog.vue'
import { bookingsApi, type BookingResponse } from '~/composables/api/bookings.api'
import { toast } from 'vue-sonner'
import type { ColumnDef } from '@tanstack/vue-table'

interface Props {
  data: BookingResponse[]
  columns: ColumnDef<BookingResponse, any>[]
  currentPage: number
  pageSize: number
  totalCount: number
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const emit = defineEmits<{
  'page-change': [page: number]
  'page-size-change': [size: number]
  'search': [query: string]
  'accept': [booking: BookingResponse]
  'reject': [booking: BookingResponse]
}>()

// Dialog state
const showDetailDialog = ref(false)
const selectedBooking = ref<BookingResponse | null>(null)
const isProcessing = ref(false)

// Handle pagination change
const handlePageChange = (page: number) => {
  emit('page-change', page)
}

// Handle page size change
const handlePageSizeChange = (size: number) => {
  emit('page-size-change', size)
}

// Handle search
const handleSearch = (query: string) => {
  emit('search', query)
}

// Handle view detail
const handleViewDetail = (booking: BookingResponse) => {
  selectedBooking.value = booking
  showDetailDialog.value = true
}

// Handle accept
const handleAccept = async (booking: BookingResponse) => {
  isProcessing.value = true
  try {
    await bookingsApi.acceptBooking(booking.id)
    toast.success('Booking accepted successfully!')
    emit('accept', booking)
  } catch (error: any) {
    console.error('Error accepting booking:', error)
    const errorMsg = error?.data?.detail || error?.message || 'Failed to accept booking'
    toast.error(errorMsg)
  } finally {
    isProcessing.value = false
  }
}

// Handle reject
const handleReject = async (booking: BookingResponse) => {
  isProcessing.value = true
  try {
    await bookingsApi.rejectBooking(booking.id)
    toast.success('Booking rejected successfully!')
    emit('reject', booking)
  } catch (error: any) {
    console.error('Error rejecting booking:', error)
    const errorMsg = error?.data?.detail || error?.message || 'Failed to reject booking'
    toast.error(errorMsg)
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <div>
    <ReusableTable 
      :data="data" 
      :columns="columns" 
      :current-page="currentPage"
      :page-size="pageSize"
      :total-count="totalCount"
      search-placeholder="Search by client name..."
      :can-view-detail="true"
      :on-view-detail="handleViewDetail"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
      @search="handleSearch"
    />

    <!-- Received Booking Detail Dialog -->
    <ReceivedBookingDetailDialog
      :open="showDetailDialog"
      :booking="selectedBooking"
      @update:open="showDetailDialog = $event"
      @accept="(booking) => {
        emit('accept', booking)
      }"
      @reject="(booking) => {
        emit('reject', booking)
      }"
    />
  </div>
</template>
