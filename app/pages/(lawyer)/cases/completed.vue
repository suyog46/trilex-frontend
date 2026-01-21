<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref } from 'vue'
import DraftCasesTable from '~/components/tables/DraftCasesTable/DraftCasesTable.vue'
import ReusableCard from '~/components/ReusableCard.vue'
import { createDraftCaseColumns } from '~/components/tables/DraftCasesTable/columns'
import { caseFilters } from '~/lib/constants/filters'
import { completedCasesData, type Case } from '~/lib/constants/casesData'

definePageMeta({
  layout: "lawyer",
})

// View mode: 'table' or 'grid'
const viewMode = ref<'table' | 'grid'>('table')

// Filter modal state
const showFilterModal = ref(false)

// Active filters
const activeFilters = ref<Record<string, string>>({
  courtType: '',
  tarikMonth: '',
})

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')

// Response structure type for API simulation
interface ApiResponse {
  data: Case[]
  page: number
  totalPage: number
  pageSize: number
  totalCount: number
}

// Simulate backend API response with filters
const simulateBackendApiCall = (
  page: number, 
  size: number, 
  search: string,
  filters: Record<string, string>
): ApiResponse => {
  console.log('Backend API called with:', { page, size, search, filters })
  
  // Apply filters
  let filtered = completedCasesData
  
  // Search filter
  if (search) {
    filtered = filtered.filter(item => 
      item.caseName.toLowerCase().includes(search.toLowerCase()) ||
      item.courtType.toLowerCase().includes(search.toLowerCase()) ||
      item.clientName.toLowerCase().includes(search.toLowerCase()) ||
      item.warisName.toLowerCase().includes(search.toLowerCase())
    )
  }
  
  // Court type filter
  if (filters.courtType) {
    filtered = filtered.filter(item => item.courtType === filters.courtType)
  }
  
  // Tarik month filter
  if (filters.tarikMonth) {
    filtered = filtered.filter(item => {
      const month = item.tarikDate.split('-')[1]
      return month === filters.tarikMonth
    })
  }
  
  // Calculate total pages
  const totalCount = filtered.length
  const totalPage = Math.ceil(totalCount / size)
  
  // Simulate pagination
  const startIndex = (page - 1) * size
  const endIndex = startIndex + size
  const pageData = filtered.slice(startIndex, endIndex)
  
  // Return simulated API response
  return {
    data: pageData,
    page,
    totalPage,
    pageSize: size,
    totalCount,
  }
}

// Fetch data from backend
const data = ref<Case[]>([])
const totalCount = ref(0)

const fetchData = (page: number, size: number, search: string, filters: Record<string, string>) => {
  try {
    // TODO: Replace with actual API call later
    // const response = await $fetch('/api/cases/completed', {
    //   params: { page, pageSize: size, search, ...filters }
    // })
    
    const response = simulateBackendApiCall(page, size, search, filters)
    
    data.value = response.data
    totalCount.value = response.totalCount
    console.log('API Response:', response)
  } catch (error) {
    console.error('Error fetching data:', error)
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
    courtType: '',
    tarikMonth: '',
  }
  applyFilters()
}

// Handle action dropdown
const handleAction = (action: string, caseData: Case) => {
  console.log('Action:', action, caseData)
  // TODO: Implement action handlers (view, edit, delete)
  switch (action) {
    case 'view':
      alert(`Viewing details for ${caseData.caseName}`)
      break
    case 'edit':
      alert(`Editing ${caseData.caseName}`)
      break
    case 'delete':
      alert(`Deleting ${caseData.caseName}`)
      break
  }
}

// Handle row click
const handleRowClick = (row: Case) => {
  console.log('Row clicked:', row)
  alert(`Opening case details for: ${row.caseName}`)
}

// Handle card action
const handleCardAction = (action: string, item: Case) => {
  handleAction(action, item)
}

// Toggle view mode
const toggleView = (mode: 'table' | 'grid') => {
  viewMode.value = mode
}

// Create columns with action handler
const columns = createDraftCaseColumns(handleAction)

// Transform columns for ReusableCard compatibility
const transformedColumns = [
  { key: 'caseName', label: 'Case Name' },
  { key: 'courtType', label: 'Court Type' },
  { key: 'clientName', label: 'Client Name' },
  { key: 'warisName', label: 'Waris Name' },
  { key: 'files', label: 'Files' },
  { key: 'tarikDate', label: 'Tarik Date' },
]

// Initial data fetch
fetchData(currentPage.value, pageSize.value, searchQuery.value, activeFilters.value)
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-primary-normal">
        Completed Cases
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
          @click="showFilterModal = true"
          class="flex items-center gap-2 px-4 py-2 border border-primary-normal rounded-lg hover:bg-primary-normal hover:text-white transition-colors"
        >
          <p class="text-primary-normal">
            Filter
          </p>
          <Icon icon="mage:filter" class="w-5 h-5 text-primary-normal" />
        </button>
      </div>
    </div>

    <!-- Table View -->
    <DraftCasesTable 
      v-if="viewMode === 'table'"
      :data="data"
      :columns="columns"
      :current-page="currentPage"
      :page-size="pageSize"
      :total-count="totalCount"
      :on-row-click="handleRowClick"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
      @search="handleSearch"
      @row-click="handleRowClick"
    />

    <!-- Grid View -->
    <ReusableCard
      v-else
      :data="data"
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
          <!-- Dynamic Filters -->
          <div v-for="filterGroup in caseFilters" :key="filterGroup.id" class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              {{ filterGroup.label }}
            </label>
            <select
              v-model="activeFilters[filterGroup.id]"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal"
            >
              <option 
                v-for="option in filterGroup.options" 
                :key="option.value" 
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
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
  </div>
</template>
