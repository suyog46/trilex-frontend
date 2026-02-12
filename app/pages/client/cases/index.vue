<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, watch, computed } from 'vue'
import DraftCasesTable from '~/components/tables/DraftCasesTable/DraftCasesTable.vue'
import { createDraftCaseColumns } from '~/components/tables/DraftCasesTable/columns'
import { casesApi, type CaseListItem } from '~/composables/api/cases.api'
import { toast } from 'vue-sonner'
import SimpleTabs from '~/components/ui/tabs/SimpleTabs.vue'

definePageMeta({
  layout: 'client',
  middleware: ['auth', 'client'],
})

const caseStatus = ref<'all' | 'pending' | 'in-progress' | 'completed'>('all')
const statusTabs = [
  { key: 'all', label: 'All Cases' },
  { key: 'pending', label: 'Pending' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
]

const showFilterModal = ref(false)

const activeFilters = ref<Record<string, string>>({
  case_category: '',
  court_type: '',
  created_from: '',
  created_to: '',
})

const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')

const data = ref<CaseListItem[]>([])
const totalCount = ref(0)
const isLoading = ref(false)

const fetchData = async (page: number, size: number, search: string, filters: Record<string, string>) => {
  isLoading.value = true
  try {
    const params: any = {
      page,
      page_size: size,
    }
    
    // Add status filter if not 'all'
    if (caseStatus.value !== 'all') {
      params.status = caseStatus.value
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

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchData(page, pageSize.value, searchQuery.value, activeFilters.value)
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchData(1, size, searchQuery.value, activeFilters.value)
}

const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1
  fetchData(1, pageSize.value, query, activeFilters.value)
}

const applyFilters = () => {
  currentPage.value = 1
  fetchData(1, pageSize.value, searchQuery.value, activeFilters.value)
  showFilterModal.value = false
}

const resetFilters = () => {
  activeFilters.value = {
    case_category: '',
    court_type: '',
    created_from: '',
    created_to: '',
  }
  applyFilters()
}

const handleRowClick = (row: any) => {
  console.log('Row clicked:', row)
  navigateTo(`/client/cases/${row.id}`)
}

// View-only columns - no actions for client
const columns = computed(() => {
  return createDraftCaseColumns(() => {}, { hideActions: true })
})

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

watch(caseStatus, () => {
  currentPage.value = 1
  fetchData(1, pageSize.value, searchQuery.value, activeFilters.value)
})

fetchData(currentPage.value, pageSize.value, searchQuery.value, activeFilters.value)
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-primary-normal">
        My Cases
      </h1>
    </div>

    <SimpleTabs v-model="caseStatus" :tabs="statusTabs" />

    <div class="flex justify-between items-center">
      <div class="flex items-center gap-4">
        <button 
          @click="showFilterModal = true"
          class="flex items-center gap-2 px-4 py-2 border border-primary-normal rounded-lg hover:bg-primary-normal hover:text-white transition-colors"
        >
          <span class="text-sm font-medium">Filter</span>
          <Icon icon="mage:filter" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <DraftCasesTable 
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
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Case Category</label>
            <select
              v-model="activeFilters.case_category"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal"
            >
              <option value="">All Categories</option>
              <option value="civil">Civil</option>
              <option value="criminal">Criminal</option>
              <option value="family">Family</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>

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

    <!-- Empty State -->
    <div 
      v-if="!isLoading && data.length === 0"
      class="flex flex-col items-center justify-center py-12 text-center"
    >
      <Icon icon="mdi:briefcase-outline" class="w-16 h-16 text-gray-400 mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 mb-2">No Cases Found</h3>
      <p class="text-sm text-gray-600">
        {{ searchQuery || Object.values(activeFilters).some(v => v) 
          ? 'Try adjusting your filters or search query' 
          : "You don't have any cases yet" 
        }}
      </p>
    </div>
  </div>
</template>
