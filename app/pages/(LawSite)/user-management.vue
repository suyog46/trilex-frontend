<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import UserManagementTable from '~/components/tables/UserManagementTable/UserManagementTable.vue'
import InviteLawyerDialog from '~/components/dialogs/InviteLawyerDialog.vue'
import SuspendLawyerDialog from '~/components/dialogs/SuspendLawyerDialog.vue'
import { createUserManagementColumns } from '~/components/tables/UserManagementTable/columns'
import { firmsApi, type FirmMember, type FirmInvitation } from '~/composables/api/firms.api'
import SimpleTabs from '~/components/ui/tabs/SimpleTabs.vue'
import TabsContent from '~/components/ui/tabs/TabsContent.vue'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'lawyer',
  middleware: ['auth', 'verification'],
})

// View mode state
const viewMode = ref<'table' | 'grid'>('table')
const activeTab = ref('members')

// Tabs configuration
const tabsConfig = [
  { key: 'members', label: 'Current Members' },
  { key: 'invitations', label: 'Invited Lawyers' },
]

// Dialog states
const showInviteDialog = ref(false)
const showSuspendDialog = ref(false)
const selectedMemberToSuspend = ref<FirmMember | null>(null)
const showFilterModal = ref(false)

// Members Tab Pagination and data states
const memberCurrentPage = ref(1)
const memberPageSize = ref(10)
const memberSearchQuery = ref('')
const members = ref<FirmMember[]>([])
const memberTotalCount = ref(0)
const memberIsLoading = ref(false)

// Invitations Tab Pagination and data states
const invitationCurrentPage = ref(1)
const invitationPageSize = ref(10)
const invitations = ref<FirmInvitation[]>([])
const invitationTotalCount = ref(0)
const invitationIsLoading = ref(false)

// Filter states
const activeFilters = ref<Record<string, string>>({
  province: '',
  district: '',
  services: '',
})

// Fetch firm members data
const fetchMembers = async (page: number, size: number) => {
  memberIsLoading.value = true
  try {
    const result = await firmsApi.getFirmMembers({
      page,
      page_size: size,
    })

    members.value = result.results || []
    memberTotalCount.value = result.count || 0
  } catch (error) {
    console.error('Error fetching firm members:', error)
    toast.error('Failed to fetch firm members')
  } finally {
    memberIsLoading.value = false
  }
}

// Fetch firm invitations data
const fetchInvitations = async (page: number, size: number) => {
  invitationIsLoading.value = true
  try {
    const result = await firmsApi.getFirmInvitations({
      page,
      page_size: size,
    })

    invitations.value = result.results || []
    invitationTotalCount.value = result.count || 0
  } catch (error) {
    console.error('Error fetching firm invitations:', error)
    toast.error('Failed to fetch firm invitations')
  } finally {
    invitationIsLoading.value = false
  }
}

// Handle pagination change for members
const handleMemberPageChange = (page: number) => {
  memberCurrentPage.value = page
  fetchMembers(page, memberPageSize.value)
}

// Handle page size change for members
const handleMemberPageSizeChange = (size: number) => {
  memberPageSize.value = size
  memberCurrentPage.value = 1
  fetchMembers(1, size)
}

// Handle pagination change for invitations
const handleInvitationPageChange = (page: number) => {
  invitationCurrentPage.value = page
  fetchInvitations(page, invitationPageSize.value)
}

// Handle page size change for invitations
const handleInvitationPageSizeChange = (size: number) => {
  invitationPageSize.value = size
  invitationCurrentPage.value = 1
  fetchInvitations(1, size)
}

// Handle search
const handleSearch = (query: string) => {
  memberSearchQuery.value = query
  memberCurrentPage.value = 1
  fetchMembers(1, memberPageSize.value)
}

// Handle filter apply
const applyFilters = () => {
  memberCurrentPage.value = 1
  fetchMembers(1, memberPageSize.value)
  showFilterModal.value = false
}

// Handle filter reset
const resetFilters = () => {
  activeFilters.value = {
    province: '',
    district: '',
    services: '',
  }
  applyFilters()
}

// Handle suspend lawyer
const handleSuspendLawyer = (member: FirmMember) => {
  selectedMemberToSuspend.value = member
  showSuspendDialog.value = true
}

// Handle suspend confirmation
const handleSuspendConfirmed = (member: FirmMember) => {
  showSuspendDialog.value = false
  // Refresh the list
  fetchMembers(memberCurrentPage.value, memberPageSize.value)
  toast.success(`${member.lawyer?.verification?.full_name} has been suspended`)
}



// Handle lawyer invited
const handleLawyerInvited = (lawyerId: string) => {
  toast.success('Lawyer has been invited successfully')
  showInviteDialog.value = false
  // Refresh both lists
  fetchMembers(memberCurrentPage.value, memberPageSize.value)
  fetchInvitations(invitationCurrentPage.value, invitationPageSize.value)
}

// Toggle view mode
const toggleView = (mode: 'table' | 'grid') => {
  viewMode.value = mode
}

// Create columns
const columns = createUserManagementColumns()

// Initial data fetch
onMounted(() => {
  fetchMembers(memberCurrentPage.value, memberPageSize.value)
  fetchInvitations(invitationCurrentPage.value, invitationPageSize.value)
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Tabs Section -->
    <SimpleTabs v-model="activeTab" :tabs="tabsConfig" />

    <!-- Header Section -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-primary-normal">
        User Management
      </h1>
      <div class="flex items-center gap-4">
        <!-- View Toggle -->
        <div class="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            @click="toggleView('table')"
            class="p-2 rounded-lg transition-colors"
            :class="viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'"
          >
            <Icon icon="mdi:table" class="w-5 h-5" :class="viewMode === 'table' ? 'text-primary-normal' : 'text-gray-600'" />
          </button>
          <button
            @click="toggleView('grid')"
            class="p-2 rounded-lg transition-colors"
            :class="viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'"
          >
            <Icon icon="mdi:grid" class="w-5 h-5" :class="viewMode === 'grid' ? 'text-primary-normal' : 'text-gray-600'" />
          </button>
        </div>

        <!-- Filter Button -->
        <button 
          v-if="activeTab === 'members'"
          @click="showFilterModal = true"
          class="flex items-center gap-2 px-4 py-2 border border-primary-normal rounded-lg hover:bg-primary-normal hover:text-white transition-colors"
        >
          <p class="text-primary-normal">
            Filter
          </p>
          <Icon icon="mage:filter" class="w-5 h-5 text-primary-normal" />
        </button>

        <!-- Add Lawyers Button -->
        <button 
          @click="showInviteDialog = true"
          class="flex items-center gap-2 px-4 py-2 bg-primary-normal text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Icon icon="mdi:plus" class="w-5 h-5" />
          Add Lawyers
        </button>
      </div>
    </div>

    <!-- Members Tab Content -->
    <div v-if="activeTab === 'members'">
      <!-- Table View -->
      <UserManagementTable
        v-if="viewMode === 'table'"
        :data="members"
        :columns="columns"
        :current-page="memberCurrentPage"
        :page-size="memberPageSize"
        :total-count="memberTotalCount"
        :is-loading="memberIsLoading"
        @page-change="handleMemberPageChange"
        @page-size-change="handleMemberPageSizeChange"
        @search="handleSearch"
        @suspend="handleSuspendLawyer"
      />

      <!-- Grid View (Placeholder) -->
      <div v-else class="text-center py-12">
        <Icon icon="mdi:view-grid" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500">Grid view coming soon</p>
      </div>
    </div>

    <div v-if="activeTab === 'invitations'">
      <!-- Loading State -->
      <div v-if="invitationIsLoading" class="flex items-center justify-center py-12">
        <div class="flex flex-col items-center gap-4">
          <Icon icon="mdi:loading" class="w-12 h-12 text-primary-normal animate-spin" />
          <p class="text-gray-500">Loading invitations...</p>
        </div>
      </div>

      <div v-else class="overflow-x-auto rounded-lg border">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Invited At</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-if="invitations.length === 0" class="hover:bg-gray-50">
              <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                <Icon icon="mdi:inbox-outline" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No invited lawyers yet</p>
              </td>
            </tr>
            <tr v-for="invitation in invitations" :key="invitation.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                {{ invitation.lawyer?.verification?.full_name || 'N/A' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ invitation.lawyer?.user?.email || 'N/A' }}
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
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="!invitationIsLoading && invitations.length > 0" class="mt-6 flex items-center justify-between">
        <div class="text-sm text-gray-600">
          Showing {{ (invitationCurrentPage - 1) * invitationPageSize + 1 }} to {{ Math.min(invitationCurrentPage * invitationPageSize, invitationTotalCount) }} of {{ invitationTotalCount }}
        </div>
        <div class="flex gap-2">
          <button
            :disabled="invitationCurrentPage === 1"
            @click="handleInvitationPageChange(invitationCurrentPage - 1)"
            class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            :disabled="invitationCurrentPage * invitationPageSize >= invitationTotalCount"
            @click="handleInvitationPageChange(invitationCurrentPage + 1)"
            class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Filter Modal -->
    <div
      v-if="showFilterModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showFilterModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">Filter Lawyers</h2>
          <button 
            @click="showFilterModal = false"
            class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon icon="mdi:close" class="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div class="space-y-4">
          <!-- Province Filter -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              Province
            </label>
            <input
              v-model="activeFilters.province"
              type="text"
              placeholder="Filter by province"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal"
            />
          </div>

          <!-- District Filter -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              District
            </label>
            <input
              v-model="activeFilters.district"
              type="text"
              placeholder="Filter by district"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal"
            />
          </div>

          <!-- Services Filter -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              Services
            </label>
            <input
              v-model="activeFilters.services"
              type="text"
              placeholder="Filter by services"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal"
            />
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="resetFilters"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            @click="applyFilters"
            class="flex-1 px-4 py-2 bg-primary-normal text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Invite Lawyer Dialog -->
    <InviteLawyerDialog 
      :open="showInviteDialog"
      @update:open="showInviteDialog = $event"
      @lawyer-invited="handleLawyerInvited"
    />

    <!-- Suspend Lawyer Dialog -->
    <SuspendLawyerDialog
      :open="showSuspendDialog"
      :member="selectedMemberToSuspend"
      @update:open="showSuspendDialog = $event"
      @suspended="handleSuspendConfirmed"
    />
  </div>
</template>
