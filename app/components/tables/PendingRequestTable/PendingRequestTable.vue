<script setup lang="ts">
import ReusableTable from '@/components/ReusableTable.vue'
import type { BookingRequest } from './columns'

interface Props {
  data: BookingRequest[]
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

 </script>
 <template>
  <ReusableTable 
      :data="data" 
      :columns="columns" 
      :current-page="currentPage"
      :page-size="pageSize"
      :total-count="totalCount"
      search-placeholder="Search by name, type, court..."
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
      @search="handleSearch"
    />
 </template>