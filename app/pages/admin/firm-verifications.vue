<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '~/components/ui/button'
import ReusableTable from '~/components/ReusableTable.vue'
import VerificationDialog from '~/components/admin/dialogs/VerificationDialog.vue'
import { firmVerificationApi, type FirmVerification } from '~/composables/api/admin.api'
import { useErrorHandler } from '~/composables/useErrorHandler'
import type { ColumnDef } from '@tanstack/vue-table'

const { parseError } = useErrorHandler()

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
})

// State
const verifications = ref<FirmVerification[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const isLoading = ref(false)
const statusFilter = ref<'PENDING' | 'VERIFIED' | 'REJECTED' | ''>('')

// Dialog state
const dialogOpen = ref(false)
const isDialogRejecting = ref(false)
const selectedVerification = ref<FirmVerification | null>(null)
const isSubmitting = ref(false)

// Status options
const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Verified', value: 'VERIFIED' },
  { label: 'Rejected', value: 'REJECTED' },
]

// Get badge class for status
const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'VERIFIED': 'bg-green-100 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800',
    'NOT_SUBMITTED': 'bg-gray-100 text-gray-800',
  }
  return classMap[status] || 'bg-gray-100 text-gray-800'
}

// Table columns
const columns: ColumnDef<FirmVerification>[] = [
  {
    accessorKey: 'firm_name',
    header: 'Firm Name',
    cell: ({ row }) => row.original.firm_name,
  },
  {
    accessorKey: 'owner_name',
    header: 'Owner Name',
    cell: ({ row }) => row.original.owner_name,
  },
  {
    accessorKey: 'firm_id',
    header: 'Firm ID',
    cell: ({ row }) => row.original.firm_id,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return h('div', 
        { class: `inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(row.original.status)}` },
        row.original.status
      )
    },
  },
  {
    id: 'license',
    header: 'License',
    cell: ({ row }) => {
      if (row.original.firm_license?.url) {
        return h('a', {
          href: row.original.firm_license.url,
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'text-primary-normal hover:underline'
        }, 'View')
      }
      return 'N/A'
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const status = row.original.status
      const isApproved = status === 'VERIFIED'
      const isRejected = status === 'REJECTED'
      
      return h('div', { class: 'flex gap-2' }, [
        h(Button, {
          size: 'sm',
          variant: 'outline',
          disabled: isApproved || isRejected,
          onClick: () => handleApprove(row.original),
        }, 'Approve'),
        h(Button, {
          size: 'sm',
          variant: 'destructive',
          disabled: isApproved || isRejected,
          onClick: () => handleReject(row.original),
        }, 'Reject'),
      ])
    },
  },
]

// Fetch verifications
const fetchVerifications = async () => {
  isLoading.value = true
  try {
    const response = await firmVerificationApi.getVerifications({
      page: currentPage.value,
      page_size: pageSize.value,
      status: statusFilter.value as 'PENDING' | 'VERIFIED' | 'REJECTED' | undefined,
    })
    verifications.value = response.results || []
    totalCount.value = response.count || 0
  } catch (error: any) {
    console.error('Failed to fetch verifications:', error)
    const { generalErrors } = parseError(error)
    const errorMessage = generalErrors.length > 0 ? generalErrors[0] : 'Failed to load verifications'
    toast.error(errorMessage)
  } finally {
    isLoading.value = false
  }
}

// Handle approve
const handleApprove = (verification: FirmVerification) => {
  selectedVerification.value = verification
  isDialogRejecting.value = false
  dialogOpen.value = true
}

// Handle reject
const handleReject = (verification: FirmVerification) => {
  selectedVerification.value = verification
  isDialogRejecting.value = true
  dialogOpen.value = true
}

// Handle dialog action
const handleDialogApprove = async () => {
  if (!selectedVerification.value) return

  isSubmitting.value = true
  try {
    const verificationId = selectedVerification.value.id || selectedVerification.value.firm_id
    await firmVerificationApi.approveVerification(verificationId)
    toast.success('Verification approved successfully')
    dialogOpen.value = false
    await fetchVerifications()
  } catch (error: any) {
    console.error('Error:', error)
    const { generalErrors } = parseError(error)
    const errorMessage = generalErrors.length > 0 ? generalErrors[0] : 'Failed to approve verification'
    toast.error(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

const handleDialogReject = async (reason: string) => {
  if (!selectedVerification.value) return

  isSubmitting.value = true
  try {
    const verificationId = selectedVerification.value.id || selectedVerification.value.firm_id
    await firmVerificationApi.rejectVerification(verificationId, reason)
    toast.success('Verification rejected successfully')
    dialogOpen.value = false
    await fetchVerifications()
  } catch (error: any) {
    console.error('Error:', error)
    const { generalErrors } = parseError(error)
    const errorMessage = generalErrors.length > 0 ? generalErrors[0] : 'Failed to reject verification'
    toast.error(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

// Handle status filter change
const handleStatusChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  statusFilter.value = value as 'PENDING' | 'VERIFIED' | 'REJECTED' | ''
  currentPage.value = 1
  fetchVerifications()
}

// Pagination handlers
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchVerifications()
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchVerifications()
}

// Initial load
onMounted(() => {
  fetchVerifications()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Firm Verifications</h1>
      <p class="text-gray-500 mt-1">Review and manage law firm verifications</p>
    </div>

    <!-- Filter Section -->
    <div class="bg-white rounded-lg shadow p-4 flex gap-3 items-center">
      <label for="status-filter" class="text-sm font-medium text-gray-700">Filter by Status:</label>
      <select
        id="status-filter"
        :value="statusFilter"
        @change="handleStatusChange"
        class="mt-2 px-4 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-normal"
      >
        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <Icon icon="mdi:loading" class="w-8 h-8 animate-spin text-primary-normal" />
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-lg shadow  py-5 px-2">
      <ReusableTable
        :data="verifications"
        :columns="columns"
        :current-page="currentPage"
        :page-size="pageSize"
        :total-count="totalCount"
        search-placeholder="Search firm verifications..."
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>

    <!-- Verification Dialog -->
    <VerificationDialog
      :open="dialogOpen"
      :is-rejecting="isDialogRejecting"
      :item-name="selectedVerification?.firm_name || ''"
      :is-loading="isSubmitting"
      @approve="handleDialogApprove"
      @reject="handleDialogReject"
      @close="dialogOpen = false"
    />
  </div>
</template>
