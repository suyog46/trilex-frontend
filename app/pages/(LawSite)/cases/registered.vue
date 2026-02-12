<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, watch, computed } from 'vue'
import DraftCasesTable from '~/components/tables/DraftCasesTable/DraftCasesTable.vue'
import ReusableCard from '~/components/ReusableCard.vue'
import { createDraftCaseColumns } from '~/components/tables/DraftCasesTable/columns'
import { casesApi, type CaseListItem } from '~/composables/api/cases.api'
import { toast } from 'vue-sonner'
import AssignLawyerDialog from '~/components/dialogs/AssignLawyerDialog.vue'
import SimpleTabs from '~/components/ui/tabs/SimpleTabs.vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: "lawyer",
})

const authStore = useAuthStore()

// View mode: 'table' or 'grid'
const viewMode = ref<'table' | 'grid'>('table')

// Check if user is a lawyer
const isLawyer = computed(() => authStore.user?.role === 'lawyer')

// Case scope tab state
const caseScope = ref<'personal' | 'firm'>('personal')
const scopeTabs = [
  { key: 'personal', label: 'Personal' },
  { key: 'firm', label: 'Related Law Firm' },
]

// Filter modal state
const showFilterModal = ref(false)

// Assign lawyer dialog state
const showAssignLawyerDialog = ref(false)
const selectedCase = ref<CaseListItem | null>(null)

// Active filters
const activeFilters = ref<Record<string, string>>({
  case_category: '',
  court_type: '',
  created_from: '',
  created_to: '',
})

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')

// Fetch data from backend
const data = ref<CaseListItem[]>([])
const totalCount = ref(0)
const isLoading = ref(false)

const fetchData = async (page: number, size: number, search: string, filters: Record<string, string>) => {
  isLoading.value = true
  try {
    const params: any = {
      page,
      page_size: size,
      status: 'registered',
      case_scope: caseScope.value,
    }
    
    if (search) params.search = search
    if (filters.case_category) params.case_category = filters.case_category
    if (filters.court_type) params.court_type = filters.court_type
    if (filters.created_from) params.created_from = filters.created_from
    if (filters.created_to) params.created_to = filters.created_to
    
    const response = await casesApi.getCasesList(params)
    
    data.value = response.results
    totalCount.value = response.count
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.error('Failed to load cases')
  } finally {
    isLoading.value = false
  }
}

// Handle pagination change
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchData(page, pageSize.value, searchQuery.value, activeFilters.value)
}

// Handle page size change
const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchData(1, size, searchQuery.value, activeFilters.value)
}

// Handle search
const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1
  fetchData(1, pageSize.value, query, activeFilters.value)
}

// Handle filter apply
const applyFilters = () => {
  currentPage.value = 1
  fetchData(1, pageSize.value, searchQuery.value, activeFilters.value)
  showFilterModal.value = false
}

// Handle filter reset
const resetFilters = () => {
  activeFilters.value = {
    case_category: '',
    court_type: '',
    created_from: '',
    created_to: '',
  }
  applyFilters()
}

// Handle action dropdown
const handleAction = (action: string, caseData: any) => {
  console.log('Action:', action, caseData)
  
  switch (action) {
    case 'edit':
      navigateTo(`/lawyer/cases/edit/${caseData.id}`)
      break
    case 'assign':
      selectedCase.value = caseData
      showAssignLawyerDialog.value = true
      break
  }
}

// Handle lawyer assigned
const handleLawyerAssigned = () => {
  fetchData(currentPage.value, pageSize.value, searchQuery.value, activeFilters.value)
}

// Handle row click
const handleRowClick = (row: any) => {
  console.log('Row clicked:', row)
  navigateTo(`/lawyer/cases/case-detail/${row.id}`)
}

// Handle card action
const handleCardAction = (action: string, item: any) => {
  const caseData = data.value.find(c => c.id === item.id)
  if (caseData) {
    handleAction(action, caseData)
  }
}

// Toggle view mode
const toggleView = (mode: 'table' | 'grid') => {
  viewMode.value = mode
}

// Create columns with action handler and scope-based options
const columns = computed(() => {
  const options = caseScope.value === 'firm'
    ? { hideActions: true } // Firm scope: hide actions column
    : { showAssignLawyer: false } // Personal scope: show edit only
  
  return createDraftCaseColumns(handleAction, options)
})

// Transform data for table display
const transformedData = computed(() => {
  return data.value.map(item => ({
    id: item.id,
    caseName: item.title,
    courtType: item.court_type,
    clientName: item.client_details?.full_name || 'N/A',
    warisName: item.waris?.full_name || 'N/A',
    files: item.total_documents,
    tarikDate: item.dates.length > 0 ? item.dates[0].date : 'N/A',
  }))
})

// Transform columns for ReusableCard compatibility
const transformedColumns = [
  { key: 'caseName', label: 'Case Name' },
  { key: 'courtType', label: 'Court Type' },
  { key: 'clientName', label: 'Client Name' },
  { key: 'warisName', label: 'Waris Name' },
  { key: 'files', label: 'Files' },
  { key: 'tarikDate', label: 'Tarik Date' },
]

// Watch case scope changes
watch(caseScope, () => {
  currentPage.value = 1
  fetchData(1, pageSize.value, searchQuery.value, activeFilters.value)
})

// Initial data fetch
fetchData(currentPage.value, pageSize.value, searchQuery.value, activeFilters.value)
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-primary-normal">
        Registered Cases
      </h1>
    </div>

    <!-- Case Scope Tabs (Only for Lawyers) -->
    <SimpleTabs v-if="isLawyer" v-model="caseScope" :tabs="scopeTabs" />

    <div class="flex justify-end items-center">
      <div class="flex items-center gap-4">
        <!-- View Toggle -->
        <!-- <div class="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
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
        </div> -->

        <!-- Filter Button -->
        <button 
          @click="showFilterModal = true"
          class="group flex items-center gap-2 px-4 py-2 border border-primary-normal rounded-lg hover:bg-primary-normal hover:text-white transition-colors"
        >
          <p class="text-primary-normal group-hover:text-white transition-colors">
            Filter
          </p>
          <Icon icon="mage:filter" class="w-5 h-5 text-primary-normal group-hover:text-white transition-colors" />
        </button>
      </div>
    </div>

    <!-- Table View -->
    <DraftCasesTable 
      v-if="viewMode === 'table'"
      :data="transformedData"
      :columns="columns"
      :current-page="currentPage"
      :page-size="pageSize"
      :total-count="totalCount"
      :is-loading="isLoading"
      :on-row-click="handleRowClick"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
      @search="handleSearch"
      @row-click="handleRowClick"
    />

    <!-- Grid View -->
    <ReusableCard
      v-else
      :data="transformedData"
      :columns="transformedColumns"
      :current-page="currentPage"
      :page-size="pageSize"
      :total-count="totalCount"
      search-placeholder="Search cases..."
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
      @search="handleSearch"
      @action-click="handleCardAction"
    />

    <!-- Filter Modal -->
    <div
      v-if="showFilterModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showFilterModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">Filter Cases</h2>
          <button 
            @click="showFilterModal = false"
            class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon icon="mdi:close" class="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div class="space-y-4">
          <!-- Court Type Filter -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Court Type</label>
            <select
              v-model="activeFilters.court_type"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal"
            >
              <option value="">All Court Types</option>
              <option value="district">District Court</option>
              <option value="high">High Court</option>
              <option value="supreme">Supreme Court</option>
            </select>
          </div>

          <!-- Date Range Filters -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Created From</label>
            <input
              v-model="activeFilters.created_from"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Created To</label>
            <input
              v-model="activeFilters.created_to"
              type="date"
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

    <!-- Assign Lawyer Dialog -->
    <AssignLawyerDialog
      v-if="selectedCase"
      :open="showAssignLawyerDialog"
      :case-id="selectedCase.id"
      :case-title="selectedCase.title"
      @update:open="showAssignLawyerDialog = $event"
      @assigned="handleLawyerAssigned"
    />
  </div>
</template>
