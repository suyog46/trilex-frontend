<script setup lang="ts" generic="TData, TValue">
import type { ColumnDef } from '@tanstack/vue-table'
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  isLoading?: boolean
  // Server-side pagination props
  currentPage?: number
  pageSize?: number
  totalCount?: number
  // Row click handler
  onRowClick?: (row: TData) => void
  // Action column props
  canEdit?: boolean
  canDelete?: boolean
  canViewDetail?: boolean
  canAccept?: boolean
  canReject?: boolean
  canSuspend?: boolean
  showActionDots?: boolean
  onEdit?: (row: TData) => void
  onDelete?: (row: TData) => void
  onViewDetail?: (row: TData) => void
  onAccept?: (row: TData) => void
  onReject?: (row: TData) => void
  onSuspend?: (row: TData) => void
  onActionDotClick?: (action: string, row: TData) => void
}

const props = withDefaults(defineProps<Props>(), {
  searchPlaceholder: 'Search...',
  isLoading: false,
  currentPage: 1,
  pageSize: 5,
  totalCount: 0,
  canEdit: false,
  canDelete: false,
  canViewDetail: false,
  canAccept: false,
  canReject: false,
  canSuspend: false,
  showActionDots: false,
})

const emit = defineEmits<{
  'page-change': [page: number]
  'page-size-change': [pageSize: number]
  'search': [query: string]
  'row-click': [row: TData]
  'edit': [row: TData]
  'delete': [row: TData]
  'view-detail': [row: TData]
  'accept': [row: TData]
  'reject': [row: TData]
  'suspend': [row: TData]
  'action-dot-click': [action: string, row: TData]
}>()

// Handle row click
const handleRowClick = (row: TData) => {
  if (props.onRowClick) {
    props.onRowClick(row)
  }
  emit('row-click', row)
}

// Handle action clicks
const handleEdit = (row: TData) => {
  if (props.onEdit) {
    props.onEdit(row)
  }
  emit('edit', row)
}

const handleDelete = (row: TData) => {
  if (props.onDelete) {
    props.onDelete(row)
  }
  emit('delete', row)
}

const handleViewDetail = (row: TData) => {
  if (props.onViewDetail) {
    props.onViewDetail(row)
  }
  emit('view-detail', row)
}

const handleAccept = (row: TData) => {
  if (props.onAccept) {
    props.onAccept(row)
  }
  emit('accept', row)
}

const handleReject = (row: TData) => {
  if (props.onReject) {
    props.onReject(row)
  }
  emit('reject', row)
}

const handleSuspend = (row: TData) => {
  if (props.onSuspend) {
    props.onSuspend(row)
  }
  emit('suspend', row)
}

const handleActionDotClick = (action: string, row: TData) => {
  if (props.onActionDotClick) {
    props.onActionDotClick(action, row)
  }
  emit('action-dot-click', action, row)
}

// Check if any actions are enabled
const hasActions = computed(() => {
  return props.canEdit || props.canDelete || props.canViewDetail || props.canAccept || props.canReject || props.canSuspend || props.showActionDots
})

const searchQuery = ref('')

// Track which row has dropdown open
const openDropdownRowId = ref<string | null>(null)

// Calculate total pages
const totalPages = computed(() => {
  if (props.totalCount === 0) return 1
  const pages = Math.ceil(props.totalCount / props.pageSize)
  return pages
})

// Simple table - no pagination logic in TanStack
const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
})

// Debounce search
let searchTimeout: NodeJS.Timeout
const handleSearchInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  searchQuery.value = value
  
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    console.log('Emitting search with debounce:', value)
    emit('search', value)
  }, 500) // 500ms debounce
}

const handlePageSizeChange = (event: Event) => {
  const value = Number((event.target as HTMLSelectElement).value)
  emit('page-size-change', value)
}

const goToFirstPage = () => {
  if (props.currentPage > 1) {
    emit('page-change', 1)
  }
}

const goToPreviousPage = () => {
  if (props.currentPage > 1) {
    emit('page-change', props.currentPage - 1)
  }
}

const goToNextPage = () => {
  if (props.currentPage < totalPages.value) {
    emit('page-change', props.currentPage + 1)
  }
}

const goToLastPage = () => {
  if (props.currentPage < totalPages.value) {
    emit('page-change', totalPages.value)
  }
}
</script>

<template>
  <div class="w-full space-y-4">
    <!-- Search Input -->
    <div class="flex items-center">
      <Input
        :placeholder="searchPlaceholder"
        :model-value="searchQuery"
        class="max-w-sm"
        :disabled="isLoading"
        @input="handleSearchInput"
      />
    </div>

    <!-- Table -->
    <div class="rounded-md">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead 
              v-for="header in headerGroup.headers" 
              :key="header.id" 
              class="text-primary-normal text-lg"
              :style="{ width: (header.column.columnDef.meta as any)?.width || 'auto' }"
            >
               
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
            <!-- Actions Header -->
            <TableHead v-if="hasActions" class="text-primary-normal text-lg w-auto">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <!-- Loading State - Skeleton Rows -->
          <template v-if="isLoading">
            <TableRow v-for="i in pageSize" :key="`skeleton-${i}`" class="border-b border-gray-300">
              <TableCell 
                v-for="(col, index) in columns" 
                :key="`skeleton-cell-${i}-${index}`" 
                class="py-4"
              >
                <div class="h-4 bg-gray-200 rounded animate-pulse" />
              </TableCell>
              <TableCell v-if="hasActions" class="py-4">
                <div class="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </TableCell>
            </TableRow>
          </template>
          <!-- Loading State - Skeleton Rows -->
          <template v-if="isLoading">
            <TableRow v-for="i in pageSize" :key="`skeleton-${i}`" class="border-b border-gray-300">
              <TableCell 
                v-for="(col, index) in columns" 
                :key="`skeleton-cell-${i}-${index}`" 
                class="py-4"
              >
                <div class="h-4 bg-gray-200 rounded animate-pulse" />
              </TableCell>
              <TableCell v-if="hasActions" class="py-4">
                <div class="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </TableCell>
            </TableRow>
          </template>
          <!-- Data Rows -->
          <template v-else-if="table.getRowModel().rows?.length">
            <TableRow
              class="border-b border-gray-300"
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() ? 'selected' : undefined"
              :class="onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''"
              @click="handleRowClick(row.original)"
            >
              <TableCell 
                v-for="cell in row.getVisibleCells()" 
                :key="cell.id" 
                class="text-gray-500 text-md py-4"
                :style="{ width: (cell.column.columnDef.meta as any)?.width || 'auto' }"
              >
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
              <!-- Action Cells -->
              <TableCell v-if="hasActions" class="text-gray-500 text-md py-4 w-auto relative">
                <div class="flex items-center gap-2 flex-wrap">
                  <button
                    v-if="canViewDetail"
                    @click.stop="handleViewDetail(row.original)"
                    class="px-3 py-1 text-primary-normal border border-primary-normal hover:bg-primary-normal-hover hover:text-white rounded-md transition-colors font-medium text-sm"
                  >
                    View Details
                  </button>
                  <button
                    v-if="canAccept"
                    @click.stop="handleAccept(row.original)"
                    class="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title="Accept"
                  >
                    <Icon icon="mdi:check-circle" class="w-5 h-5" />
                  </button>
                  <button
                    v-if="canReject"
                    @click.stop="handleReject(row.original)"
                    class="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Reject"
                  >
                    <Icon icon="mdi:close-circle" class="w-5 h-5" />
                  </button>
                  <button
                    v-if="canEdit"
                    @click.stop="handleEdit(row.original)"
                    class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                    title="Edit"
                  >
                    <Icon icon="mdi:pencil" class="w-5 h-5" />
                  </button>
                  <button
                    v-if="canDelete"
                    @click.stop="handleDelete(row.original)"
                    class="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Icon icon="mdi:trash-can" class="w-5 h-5" />
                  </button>
                  <button
                    v-if="canSuspend"
                    @click.stop="handleSuspend(row.original)"
                    class="px-3 py-1 text-orange-600 border border-orange-600 hover:bg-orange-50 rounded-md transition-colors font-medium text-sm"
                  >
                    Suspend
                  </button>
                </div>
              </TableCell>
            </TableRow>
          </template>
          <!-- No Results -->
          <template v-else>
            <TableRow>
              <TableCell :colspan="columns.length + (hasActions ? 1 : 0)" class="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between px-2">
      <div class="flex-1 text-sm text-muted-foreground">
        {{ totalCount }} row(s) total.
      </div>
      <div class="flex items-center space-x-6 lg:space-x-8">
        <div class="flex items-center space-x-2">
          <p class="text-sm font-medium">Rows per page</p>
          <select
            :value="pageSize"
            class="h-8 w-[70px] rounded-md   bg-transparent px-2 text-sm"
            @change="handlePageSizeChange"
          >
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="30">30</option>
            <option :value="50">50</option>
          </select>
        </div>
        <div class="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            class="h-8 w-8 p-0"
            :disabled="currentPage <= 1"
            @click="goToFirstPage"
          >
            <Icon icon="lucide:chevrons-left" class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            class="h-8 w-8 p-0"
            :disabled="currentPage <= 1"
            @click="goToPreviousPage"
          >
            <Icon icon="lucide:chevron-left" class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            class="h-8 w-8 p-0"
            :disabled="currentPage >= totalPages"
            @click="goToNextPage"
          >
            <Icon icon="lucide:chevron-right" class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            class="h-8 w-8 p-0"
            :disabled="currentPage >= totalPages"
            @click="goToLastPage"
          >
            <Icon icon="lucide:chevrons-right" class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
