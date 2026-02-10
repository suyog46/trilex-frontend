<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import SimpleTabs from '~/components/ui/tabs/SimpleTabs.vue'
import { lawyersApi, type LawyerFirmInvitation } from '~/composables/api/lawyers.api'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'lawyer',
  middleware: ['auth', 'verification'],
})

// Tab state
const activeTab = ref('pending')

// Tabs configuration
const tabsConfig = [
  { key: 'pending', label: 'Pending Invitations' },
]

// Pagination and data states
const currentPage = ref(1)
const pageSize = ref(10)
const invitations = ref<LawyerFirmInvitation[]>([])
const totalCount = ref(0)
const isLoading = ref(false)
const isProcessing = ref(false)

// Fetch firm invitations
const fetchInvitations = async (page: number, size: number) => {
  isLoading.value = true
  try {
    const result = await lawyersApi.getLawyerFirmInvitations({
      page,
      page_size: size,
    })

    invitations.value = result.results || []
    totalCount.value = result.count || 0
  } catch (error) {
    console.error('Error fetching firm invitations:', error)
    toast.error('Failed to fetch firm invitations')
  } finally {
    isLoading.value = false
  }
}

// Handle pagination change
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchInvitations(page, pageSize.value)
}

// Handle page size change
const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchInvitations(1, size)
}

// Handle accept invitation
const handleAccept = async (invitation: LawyerFirmInvitation) => {
  isProcessing.value = true
  try {
    await lawyersApi.respondToFirmInvitation(invitation.id, 'accept')
    toast.success(`Invitation from ${invitation.firm?.verification?.firm_name} accepted!`)
    // Refresh the list
    fetchInvitations(currentPage.value, pageSize.value)
  } catch (error: any) {
    console.error('Error accepting invitation:', error)
    const errorMsg = error?.data?.detail || error?.message || 'Failed to accept invitation'
    toast.error(errorMsg)
  } finally {
    isProcessing.value = false
  }
}

// Handle reject invitation
const handleReject = async (invitation: LawyerFirmInvitation) => {
  isProcessing.value = true
  try {
    await lawyersApi.respondToFirmInvitation(invitation.id, 'reject')
    toast.success(`Invitation from ${invitation.firm?.verification?.firm_name} rejected!`)
    // Refresh the list
    fetchInvitations(currentPage.value, pageSize.value)
  } catch (error: any) {
    console.error('Error rejecting invitation:', error)
    const errorMsg = error?.data?.detail || error?.message || 'Failed to reject invitation'
    toast.error(errorMsg)
  } finally {
    isProcessing.value = false
  }
}

// Initial data fetch
onMounted(() => {
  fetchInvitations(currentPage.value, pageSize.value)
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Tabs Section -->
    <SimpleTabs v-model="activeTab" :tabs="tabsConfig" />

    <!-- Header Section -->
    <div>
      <h1 class="text-2xl font-bold text-primary-normal">
        Firm Requests
      </h1>
    </div>

    <!-- Content Section -->
    <div v-if="activeTab === 'pending'">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <Icon icon="mdi:loading" class="w-12 h-12 text-primary-normal mx-auto mb-3 animate-spin" />
        <p class="text-gray-500">Loading invitations...</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto rounded-lg border">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Firm Name</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Invited At</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-if="invitations.length === 0" class="hover:bg-gray-50">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                <Icon icon="mdi:inbox-outline" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No pending firm invitations</p>
              </td>
            </tr>
            <tr v-for="invitation in invitations" :key="invitation.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                {{ invitation.firm?.verification?.firm_name || 'N/A' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ invitation.firm?.user?.email || 'N/A' }}
              </td>
              <td class="px-6 py-4 text-sm">
                <span 
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="invitation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : invitation.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ new Date(invitation.invited_at).toLocaleDateString() }}
              </td>
              <td class="px-6 py-4 text-sm">
                <div class="flex gap-2">
                  <button
                    :disabled="isProcessing || invitation.status !== 'pending'"
                    @click="handleAccept(invitation)"
                    class="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                  >
                    Accept
                  </button>
                  <button
                    :disabled="isProcessing || invitation.status !== 'pending'"
                    @click="handleReject(invitation)"
                    class="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="invitations.length > 0" class="mt-6 flex items-center justify-between">
        <div class="text-sm text-gray-600">
          Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, totalCount) }} of {{ totalCount }}
        </div>
        <div class="flex gap-2">
          <button
            :disabled="currentPage === 1"
            @click="handlePageChange(currentPage - 1)"
            class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            :disabled="currentPage * pageSize >= totalCount"
            @click="handlePageChange(currentPage + 1)"
            class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
