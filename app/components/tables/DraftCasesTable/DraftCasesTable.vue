<script setup lang="ts">
import { ref } from 'vue'
import ReusableTable from '@/components/ReusableTable.vue'
import type { Case } from '~/lib/constants/casesData'

interface Props {
  data: Case[]
  columns: any[]
  currentPage: number
  pageSize: number
  totalCount: number
  onRowClick?: (row: Case) => void
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'page-change': [page: number]
  'page-size-change': [size: number]
  'search': [query: string]
  'row-click': [row: Case]
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

// Handle row click
const handleRowClick = (row: Case) => {
  emit('row-click', row)
}

 </script>
 <template>
  <ReusableTable 
      :data="data" 
      :columns="columns" 
      :current-page="currentPage"
      :page-size="pageSize"
      :total-count="totalCount"
      search-placeholder="Search cases..."
      :on-row-click="onRowClick"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
      @search="handleSearch"
      @row-click="handleRowClick"
    />
 </template>
