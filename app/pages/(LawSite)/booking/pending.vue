<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref } from 'vue'
import PendingRequestTable from '~/components/tables/PendingRequestTable/PendingRequestTable.vue'
import ReusableCard from '~/components/ReusableCard.vue'
import columns from '~/components/tables/PendingRequestTable/columns'
import { bookingFilters, type FilterGroup } from '~/lib/constants/filters'
import type { BookingRequest } from '~/components/tables/PendingRequestTable/columns'

// Transform columns for ReusableCard compatibility
const transformedColumns = columns.map((col: any) => ({
  key: col.id || col.accessorKey,
  label: col.header || col.id || col.accessorKey,
}))

definePageMeta({
  layout: "lawyer",
})

// View mode: 'table' or 'grid'
const viewMode = ref<'table' | 'grid'>('table')

// Filter modal state
const showFilterModal = ref(false)

// Active filters
const activeFilters = ref<Record<string, string>>({
  type: '',
  urgency: '',
  court: '',
})

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')

// All dummy data (simulating backend database)
const allData: BookingRequest[] = [
  {
    id: '1',
    fullName: 'John Doe',
    type: 'Criminal',
    court: 'Supreme Court',
    urgency: 'High',
    description: 'Defense case for fraud allegations with multiple defendants involved',
  },
  {
    id: '2',
    fullName: 'Jane Smith',
    type: 'Civil',
    court: 'District Court',
    urgency: 'Medium',
    description: 'Property dispute between family members regarding inheritance',
  },
  {
    id: '3',
    fullName: 'Robert Johnson',
    type: 'Family',
    court: 'Family Court',
    urgency: 'Low',
    description: 'Child custody case with joint custody agreement negotiations',
  },
  {
    id: '4',
    fullName: 'Emily Davis',
    type: 'Corporate',
    court: 'Commercial Court',
    urgency: 'High',
    description: 'Corporate merger legal review and compliance documentation',
  },
  {
    id: '5',
    fullName: 'Michael Brown',
    type: 'Criminal',
    court: 'District Court',
    urgency: 'Medium',
    description: 'Defense for DUI charges with potential license suspension',
  },
  {
    id: '6',
    fullName: 'Sarah Wilson',
    type: 'Civil',
    court: 'Supreme Court',
    urgency: 'Low',
    description: 'Contract dispute resolution for business partnership dissolution',
  },
  {
    id: '7',
    fullName: 'David Martinez',
    type: 'Immigration',
    court: 'Immigration Court',
    urgency: 'High',
    description: 'Asylum case with urgent deportation hearing scheduled',
  },
  {
    id: '8',
    fullName: 'Lisa Anderson',
    type: 'Family',
    court: 'Family Court',
    urgency: 'Medium',
    description: 'Divorce proceedings with asset division and alimony negotiations',
  },
  {
    id: '9',
    fullName: 'James Taylor',
    type: 'Criminal',
    court: 'Supreme Court',
    urgency: 'High',
    description: 'Murder trial defense with complex forensic evidence review',
  },
  {
    id: '10',
    fullName: 'Jennifer Thomas',
    type: 'Civil',
    court: 'District Court',
    urgency: 'Low',
    description: 'Personal injury claim for workplace accident compensation',
  },
  {
    id: '11',
    fullName: 'Christopher Lee',
    type: 'Corporate',
    court: 'Commercial Court',
    urgency: 'Medium',
    description: 'Trademark infringement case with international implications',
  },
  {
    id: '12',
    fullName: 'Amanda White',
    type: 'Family',
    court: 'Family Court',
    urgency: 'Low',
    description: 'Adoption proceedings for foster child placement',
  },
]

// Response structure type for API simulation
interface ApiResponse {
  data: BookingRequest[]
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
  let filtered = allData
  
  // Search filter
  if (search) {
    filtered = filtered.filter(item => 
      item.fullName.toLowerCase().includes(search.toLowerCase()) ||
      item.type.toLowerCase().includes(search.toLowerCase()) ||
      item.court.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
    )
  }
  
  // Type filter
  if (filters.type) {
    filtered = filtered.filter(item => item.type === filters.type)
  }
  
  // Urgency filter
  if (filters.urgency) {
    filtered = filtered.filter(item => item.urgency === filters.urgency)
  }
  
  if (filters.court) {
    filtered = filtered.filter(item => item.court === filters.court)
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
const data = ref<BookingRequest[]>([])
const totalCount = ref(0)

const fetchData = (page: number, size: number, search: string, filters: Record<string, string>) => {
  try {
    // TODO: Replace with actual API call later
    // const response = await $fetch('/api/pending-requests', {
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
    type: '',
    urgency: '',
    court: '',
  }
  applyFilters()
}

// Handle card action
const handleCardAction = (action: string, item: BookingRequest) => {
  console.log('Card action:', action, item)
  // TODO: Implement action handlers (view, accept, reject)
  switch (action) {
    case 'view':
      alert(`Viewing details for ${item.fullName}`)
      break
    case 'accept':
      alert(`Accepting request from ${item.fullName}`)
      break
    case 'reject':
      alert(`Rejecting request from ${item.fullName}`)
      break
  }
}

// Toggle view mode
const toggleView = (mode: 'table' | 'grid') => {
  viewMode.value = mode
}

// Initial data fetch
fetchData(currentPage.value, pageSize.value, searchQuery.value, activeFilters.value)
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-primary-normal">
        Pending Requests
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

    <PendingRequestTable 
      v-if="viewMode === 'table'"
      :data="data"
      :columns="columns"
      :current-page="currentPage"
      :page-size="pageSize"
      :total-count="totalCount"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
      @search="handleSearch"
    />

    <ReusableCard
      v-else
      :data="data"
      :columns="transformedColumns"
      :current-page="currentPage"
      :page-size="pageSize"
      :total-count="totalCount"
      search-placeholder="Search by name, type, court..."
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
          <h2 class="text-xl font-bold text-gray-900">Filter Requests</h2>
          <button 
            @click="showFilterModal = false"
            class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon icon="mdi:close" class="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div class="space-y-4">
          <!-- Dynamic Filters -->
          <div v-for="filterGroup in bookingFilters" :key="filterGroup.id" class="space-y-2">
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



