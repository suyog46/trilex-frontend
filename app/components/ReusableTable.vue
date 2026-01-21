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
  // Server-side pagination props
  currentPage?: number
  pageSize?: number
  totalCount?: number
  // Row click handler
  onRowClick?: (row: TData) => void
}

const props = withDefaults(defineProps<Props>(), {
  searchPlaceholder: 'Search...',
  currentPage: 1,
  pageSize: 5,
  totalCount: 0,
})

const emit = defineEmits<{
  'page-change': [page: number]
  'page-size-change': [pageSize: number]
  'search': [query: string]
  'row-click': [row: TData]
}>()

// Handle row click
const handleRowClick = (row: TData) => {
  if (props.onRowClick) {
    props.onRowClick(row)
  }
  emit('row-click', row)
}

const searchQuery = ref('')

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
        @input="handleSearchInput"
      />
    </div>

    <!-- Table -->
    <div class="rounded-md ">
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
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
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
            </TableRow>
          </template>
          <template v-else>
            <TableRow>
              <TableCell :colspan="columns.length" class="h-24 text-center">
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
