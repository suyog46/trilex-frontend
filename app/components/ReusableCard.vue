<script setup lang="ts" generic="TData">
import { ref, computed } from 'vue'

interface Column {
  key: string
  label: string
}

interface Props {
  data: TData[]
  columns: Column[]
  currentPage: number
  pageSize: number
  totalCount: number
  searchPlaceholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  searchPlaceholder: 'Search...'
})

const emit = defineEmits<{
  'page-change': [page: number]
  'page-size-change': [size: number]
  'search': [query: string]
  'action-click': [action: string, item: TData]
}>()

const searchQuery = ref('')
const searchDebounceTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const openActionId = ref<string | null>(null)

// Handle search with debounce
const handleSearch = () => {
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value)
  }
  
  searchDebounceTimer.value = setTimeout(() => {
    emit('search', searchQuery.value)
  }, 300)
}

// Toggle action dropdown
const toggleAction = (itemId: string) => {
  openActionId.value = openActionId.value === itemId ? null : itemId
}

// Handle action click
const handleActionClick = (action: string, item: TData) => {
  emit('action-click', action, item)
  openActionId.value = null
}

// Pagination computed
const totalPages = computed(() => Math.ceil(props.totalCount / props.pageSize))
const hasNextPage = computed(() => props.currentPage < totalPages.value)
const hasPrevPage = computed(() => props.currentPage > 1)

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    emit('page-change', page)
  }
}

const changePageSize = (size: number) => {
  emit('page-size-change', size)
}

// Get urgency badge color
const getUrgencyColor = (urgency: string) => {
  switch (urgency.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Search Bar -->
    <div class="relative max-w-md">
      <Icon icon="material-symbols-light:search-rounded" 
        class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        v-model="searchQuery"
        type="search"
        :placeholder="searchPlaceholder"
        @input="handleSearch"
        class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal"
      />
    </div>

    <!-- Grid View -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="item in data"
        :key="(item as any).id"
        class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative"
      >
        <!-- Action Button (Top Right) -->
        <div class="absolute top-4 right-4">
          <button
            @click="toggleAction((item as any).id)"
            class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon icon="mdi:dots-vertical" class="w-5 h-5 text-gray-600" />
          </button>
          
          <!-- Action Dropdown -->
          <div
            v-if="openActionId === (item as any).id"
            class="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]"
          >
            <button
              @click="handleActionClick('view', item)"
              class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
            >
              <Icon icon="mdi:eye-outline" class="w-4 h-4" />
              View Details
            </button>
            <button
              @click="handleActionClick('accept', item)"
              class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-green-600"
            >
              <Icon icon="mdi:check-circle-outline" class="w-4 h-4" />
              Accept
            </button>
            <button
              @click="handleActionClick('reject', item)"
              class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-red-600"
            >
              <Icon icon="mdi:close-circle-outline" class="w-4 h-4" />
              Reject
            </button>
          </div>
        </div>

        <!-- Card Content -->
        <div class="space-y-3 pr-8">
          <h3 class="font-semibold text-lg text-gray-900">
            {{ (item as any).fullName }}
          </h3>
          
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <Icon icon="mdi:folder-outline" class="w-4 h-4 text-gray-500" />
              <span class="text-sm text-gray-600">{{ (item as any).type }}</span>
            </div>
            
            <div class="flex items-center gap-2">
              <Icon icon="mdi:gavel" class="w-4 h-4 text-gray-500" />
              <span class="text-sm text-gray-600">{{ (item as any).court }}</span>
            </div>
            
            <div class="flex items-center gap-2">
              <Icon icon="mdi:alert-circle-outline" class="w-4 h-4 text-gray-500" />
              <span 
                class="text-xs px-2 py-1 rounded-full font-medium"
                :class="getUrgencyColor((item as any).urgency)"
              >
                {{ (item as any).urgency }}
              </span>
            </div>
          </div>
          
          <p class="text-sm text-gray-600 line-clamp-2">
            {{ (item as any).description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="data.length === 0" class="text-center py-12">
      <Icon icon="mdi:inbox-outline" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500 text-lg">No requests found</p>
      <p class="text-gray-400 text-sm">Try adjusting your search or filters</p>
    </div>

    <!-- Pagination -->
    <div v-if="totalCount > 0" class="flex items-center justify-between pt-4">
      <!-- Results Info -->
      <div class="text-sm text-gray-600">
        Showing {{ ((currentPage - 1) * pageSize) + 1 }} to 
        {{ Math.min(currentPage * pageSize, totalCount) }} of 
        {{ totalCount }} results
      </div>

      <!-- Pagination Controls -->
      <div class="flex items-center gap-2">
        <!-- Page Size Selector -->
        <select
          :value="pageSize"
          @change="changePageSize(Number(($event.target as HTMLSelectElement).value))"
          class="px-3 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-normal"
        >
          <option :value="10">10 per page</option>
          <option :value="20">20 per page</option>
          <option :value="50">50 per page</option>
        </select>

        <!-- Previous Button -->
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="!hasPrevPage"
          class="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <Icon icon="mdi:chevron-left" class="w-5 h-5" />
        </button>

        <!-- Page Numbers -->
        <div class="flex items-center gap-1">
          <button
            v-for="page in totalPages"
            :key="page"
            v-show="page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)"
            @click="goToPage(page)"
            class="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50"
            :class="page === currentPage ? 'bg-primary-normal text-white border-primary-normal' : ''"
          >
            {{ page }}
          </button>
        </div>

        <!-- Next Button -->
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="!hasNextPage"
          class="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <Icon icon="mdi:chevron-right" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>
