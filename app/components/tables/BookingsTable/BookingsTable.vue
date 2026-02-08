<script setup lang="ts">
import { ref } from 'vue'
import ReusableTable from '~/components/ReusableTable.vue'
import BookingDetailDialog from './BookingDetailDialog.vue'
import type { BookingResponse } from '~/composables/api/bookings.api'

interface Props {
  data: BookingResponse[]
  columns: any[]
  currentPage: number
  pageSize: number
  totalCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'page-change': [page: number]
  'page-size-change': [size: number]
  'search': [query: string]
}>()

// Dialog state
const showDetailDialog = ref(false)
const selectedBooking = ref<BookingResponse | null>(null)

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
</script>

<template>
  <div>
    <ReusableTable 
      :data="data" 
      :columns="columns" 
      :current-page="currentPage"
      :page-size="pageSize"
      :total-count="totalCount"
      search-placeholder="Search by lawyer/firm name..."
      :can-view-detail="true"
      :can-edit="false"
      :can-delete="false"
      :on-view-detail="handleViewDetail"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
      @search="handleSearch"
    />


    <BookingDetailDialog
      :open="showDetailDialog"
      :booking="selectedBooking"
      @update:open="showDetailDialog = $event"
    />
  </div>
</template>
