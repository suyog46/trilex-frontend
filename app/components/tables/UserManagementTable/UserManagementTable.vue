<script setup lang="ts">
import { ref } from 'vue'
import ReusableTable from '~/components/ReusableTable.vue'
import type { FirmMember } from '~/composables/api/firms.api'
import type { ColumnDef } from '@tanstack/vue-table'

interface Props {
  data: FirmMember[]
  columns: ColumnDef<FirmMember, any>[]
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
  'suspend': [member: FirmMember]
  'reject': [member: FirmMember]
  'action-dot-click': [action: string, member: FirmMember]
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

// Handle suspend
const handleSuspend = (member: FirmMember) => {
  emit('suspend', member)
}

// Handle action dot click
const handleActionDotClick = (action: string, member: FirmMember) => {
  if (action === 'suspend') {
    emit('suspend', member)
  } else {
    emit('action-dot-click', action, member)
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
      :is-loading="isLoading"
      search-placeholder="Search by lawyer name or email..."
      :can-suspend="true"
      :on-suspend="handleSuspend"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
      @search="handleSearch"
      @suspend="(member) => emit('suspend', member)"
    />
  </div>
</template>
