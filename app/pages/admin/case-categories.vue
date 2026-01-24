<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '~/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from '~/components/ui/alert-dialog'
import ReusableTable from '~/components/ReusableTable.vue'
import CategoryDialog from '~/components/admin/dialogs/CategoryDialog.vue'
import { caseCategoryApi, type CaseCategory } from '~/composables/api/admin.api'
import { useErrorHandler } from '~/composables/useErrorHandler'
import type { ColumnDef } from '@tanstack/vue-table'

const { parseError } = useErrorHandler()

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
})

// State
const categories = ref<CaseCategory[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const isLoading = ref(false)

// Dialog state
const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const selectedCategory = ref<CaseCategory | null>(null)
const isSubmitting = ref(false)

// Delete confirmation state
const deleteDialogOpen = ref(false)
const categoryToDelete = ref<CaseCategory | null>(null)

// Table columns
const columns: ColumnDef<CaseCategory>[] = [
  {
    accessorKey: 'name',
    header: 'Category Name',
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.original.is_active
      return h('div', 
        { class: `inline-block px-3 py-1 rounded-full text-sm font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}` },
        isActive ? 'Active' : 'Inactive'
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }) => {
      const date = new Date(row.original.created_at)
      return date.toLocaleDateString()
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      return h('div', { class: 'flex gap-2' }, [
        h(Button, {
          size: 'sm',
          variant: 'outline',
          onClick: () => handleEdit(row.original),
        }, 'Edit'),
        h(Button, {
          size: 'sm',
          variant: 'destructive',
          onClick: () => handleDeleteClick(row.original),
        }, 'Delete'),
      ])
    },
  },
]

// Fetch categories
const fetchCategories = async () => {
  isLoading.value = true
  try {
    const response = await caseCategoryApi.getCategories({
      page: currentPage.value,
      page_size: pageSize.value,
    })
    categories.value = response.results || []
    totalCount.value = response.count || 0
  } catch (error: any) {
    console.error('Failed to fetch categories:', error)
    const { generalErrors } = parseError(error)
    const errorMessage = generalErrors.length > 0 ? generalErrors[0] : 'Failed to load categories'
    toast.error(errorMessage)
  } finally {
    isLoading.value = false
  }
}

// Open create dialog
const handleCreate = () => {
  dialogMode.value = 'create'
  selectedCategory.value = null
  dialogOpen.value = true
}

// Open edit dialog
const handleEdit = (category: CaseCategory) => {
  dialogMode.value = 'edit'
  selectedCategory.value = category
  dialogOpen.value = true
}

// Handle dialog submit
const handleDialogSubmit = async (data: { name: string; is_active: boolean }) => {
  isSubmitting.value = true
  try {
    if (dialogMode.value === 'create') {
      await caseCategoryApi.createCategory(data)
      toast.success('Category created successfully')
    } else if (selectedCategory.value) {
      await caseCategoryApi.updateCategory(selectedCategory.value.id, data)
      toast.success('Category updated successfully')
    }
    dialogOpen.value = false
    currentPage.value = 1
    await fetchCategories()
  } catch (error: any) {
    console.error('Error:', error)
    const { generalErrors } = parseError(error)
    const errorMessage = generalErrors.length > 0 ? generalErrors[0] : 'Operation failed'
    toast.error(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

// Delete handlers
const handleDeleteClick = (category: CaseCategory) => {
  categoryToDelete.value = category
  deleteDialogOpen.value = true
}

const handleDeleteConfirm = async () => {
  if (!categoryToDelete.value) return

  isSubmitting.value = true
  try {
    await caseCategoryApi.deleteCategory(categoryToDelete.value.id)
    toast.success('Category deleted successfully')
    deleteDialogOpen.value = false
    categoryToDelete.value = null
    await fetchCategories()
  } catch (error: any) {
    console.error('Error:', error)
    const { generalErrors } = parseError(error)
    const errorMessage = generalErrors.length > 0 ? generalErrors[0] : 'Failed to delete category'
    toast.error(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

// Pagination handlers
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchCategories()
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchCategories()
}

// Initial load
onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Case Categories</h1>
        <p class="text-gray-500 mt-1">Manage case categories for the system</p>
      </div>
      <Button 
        class="bg-secondary hover:bg-secondary-hover hiver:shadow-sm"
        @click="handleCreate"
      >
        <Icon icon="mdi:plus" class="w-4 h-4 mr-2" />
        Create Category
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <Icon icon="mdi:loading" class="w-8 h-8 animate-spin text-primary-normal" />
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-lg shadow py-10 px-5 h-[70vh]">
      <ReusableTable
        :data="categories"
        :columns="columns"
        :current-page="currentPage"
        :page-size="pageSize"
        :total-count="totalCount"
        search-placeholder="Search categories..."
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>

    <!-- Category Dialog -->
    <CategoryDialog
      :open="dialogOpen"
      :mode="dialogMode"
      :name="selectedCategory?.name"
      :is-active="selectedCategory?.is_active"
      :is-loading="isSubmitting"
      @submit="handleDialogSubmit"
      @close="dialogOpen = false"
    />

    <!-- Delete Confirmation Dialog -->
    <AlertDialog :open="deleteDialogOpen">
      <AlertDialogContent class="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Category</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{{ categoryToDelete?.name }}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div class="flex gap-3 justify-end pt-4">
          <AlertDialogCancel as-child>
            <Button 
              variant="outline"
              @click="deleteDialogOpen = false"
            >
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction as-child>
            <Button 
              class="bg-red-600 hover:bg-red-700"
              :disabled="isSubmitting"
              @click="handleDeleteConfirm"
            >
              <Icon v-if="isSubmitting" icon="mdi:loading" class="w-4 h-4 mr-2 animate-spin" />
              Delete
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
