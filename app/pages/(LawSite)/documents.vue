<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { casesApi, type CaseListItem, type DocumentItem, type UploadDocumentInput } from '~/composables/api/cases.api'
import { toast } from 'vue-sonner'
import DocumentFolderView from '~/components/cases/DocumentFolderView.vue'
import DocumentListView from '~/components/cases/DocumentListView.vue'
import UploadDocumentDialog from '~/components/dialogs/UploadDocumentDialog.vue'

definePageMeta({
  layout: "lawyer",
})

const activeTab = ref<'draft' | 'ongoing' | 'completed' | 'registered'>('draft')
const isLoadingCases = ref(false)
const cases = ref<CaseListItem[]>([])

// Selected case and folder state
const selectedCase = ref<CaseListItem | null>(null)
const selectedFolder = ref<'client' | 'internal' | null>(null)

// Documents state
const clientDocuments = ref<DocumentItem[]>([])
const internalDocuments = ref<DocumentItem[]>([])
const isLoadingDocuments = ref(false)

// Upload dialog state
const showUploadDialog = ref(false)

// Fetch cases for active tab
const fetchCases = async (status: string) => {
  isLoadingCases.value = true
  try {
    const response = await casesApi.getCasesList({
      status,
      page: 1,
      page_size: 100,
    })
    cases.value = response.results
  } catch (error) {
    console.error('Error fetching cases:', error)
    toast.error('Failed to load cases')
  } finally {
    isLoadingCases.value = false
  }
}

// Fetch documents for selected case
const fetchDocuments = async (caseId: string) => {
  isLoadingDocuments.value = true
  try {
    // Fetch client documents
    const clientResponse = await casesApi.getCaseDocuments(caseId, {
      scope: 'client',
      page_size: 100,
    })
    clientDocuments.value = clientResponse.results

    // Fetch internal (my) documents
    const internalResponse = await casesApi.getCaseDocuments(caseId, {
      scope: 'my',
      page_size: 100,
    })
    internalDocuments.value = internalResponse.results
  } catch (error) {
    console.error('Error fetching documents:', error)
    toast.error('Failed to load documents')
  } finally {
    isLoadingDocuments.value = false
  }
}

// Watch tab changes to fetch cases
watch(activeTab, (newTab) => {
  selectedCase.value = null
  selectedFolder.value = null
  fetchCases(newTab)
}, { immediate: true })

// Handle case selection
const handleCaseSelect = (caseItem: CaseListItem) => {
  selectedCase.value = caseItem
  selectedFolder.value = null
  fetchDocuments(caseItem.id)
}

// Handle folder selection
const handleFolderSelect = (folder: 'client' | 'internal') => {
  selectedFolder.value = folder
}

// Handle back navigation
const handleBack = () => {
  if (selectedFolder.value) {
    selectedFolder.value = null
  } else {
    selectedCase.value = null
  }
}

// Handle document upload
const handleUploadClick = () => {
  showUploadDialog.value = true
}

const handleDocumentUploaded = async (data: UploadDocumentInput) => {
  if (!selectedCase.value) return
  
  try {
    await casesApi.uploadCaseDocument(selectedCase.value.id, data)
    toast.success('Document uploaded successfully')
    
    // Refresh documents
    await fetchDocuments(selectedCase.value.id)
  } catch (error) {
    console.error('Error uploading document:', error)
    toast.error('Failed to upload document')
  }
}

// Handle document delete
const handleDocumentDelete = async (documentId: string) => {
  // TODO: Implement delete API when available
  toast.info('Delete functionality coming soon')
}

// Get current folder documents
const currentDocuments = computed(() => {
  if (selectedFolder.value === 'client') {
    return clientDocuments.value
  } else if (selectedFolder.value === 'internal') {
    return internalDocuments.value
  }
  return []
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          v-if="selectedCase"
          @click="handleBack"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Icon icon="mdi:arrow-left" class="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-primary-normal">Documents</h1>
          <p v-if="selectedCase" class="text-sm text-gray-600 mt-1">
            {{ selectedCase.title }}
          </p>
        </div>
      </div>
    </div>

    <!-- Case not selected - Show tabs and case list -->
    <div v-if="!selectedCase" class="bg-white rounded-lg shadow-sm p-6">
      <Tabs v-model="activeTab">
        <TabsList class="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="registered">Registered</TabsTrigger>
        </TabsList>

        <!-- Loading State -->
        <div v-if="isLoadingCases" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="border border-gray-200 rounded-lg p-4">
            <div class="space-y-3">
              <div class="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="cases.length === 0" class="text-center py-12">
          <Icon icon="mdi:folder-open-outline" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-600">No {{ activeTab }} cases found</p>
        </div>

        <!-- Cases Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="caseItem in cases"
            :key="caseItem.id"
            class="group border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-primary-normal hover:shadow-lg transition-all"
            @click="handleCaseSelect(caseItem)"
          >
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                <Icon icon="mdi:folder" class="w-6 h-6 text-primary-normal" />
              </div>
              
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 mb-2 truncate group-hover:text-primary-normal transition-colors">
                  {{ caseItem.title }}
                </h3>
                <p class="text-sm text-gray-600 mb-2 truncate">
                  Client: {{ caseItem.client_details?.full_name || 'N/A' }}
                </p>
                <div class="flex items-center gap-2">
                  <Icon icon="mdi:file-document" class="w-4 h-4 text-gray-500" />
                  <span class="text-sm text-gray-600">
                    {{ caseItem.total_documents }} {{ caseItem.total_documents === 1 ? 'file' : 'files' }}
                  </span>
                </div>
              </div>

              <Icon
                icon="mdi:chevron-right"
                class="w-6 h-6 text-gray-400 group-hover:text-primary-normal group-hover:translate-x-1 transition-all"
              />
            </div>
          </div>
        </div>
      </Tabs>
    </div>

    <!-- Case selected - Show folders or documents -->
    <div v-else class="bg-white rounded-lg shadow-sm p-6">
      <!-- Folder View -->
      <DocumentFolderView
        v-if="!selectedFolder"
        :client-files-count="clientDocuments.length"
        :internal-files-count="internalDocuments.length"
        @open-folder="handleFolderSelect"
      />

      <!-- Document List View -->
      <DocumentListView
        v-else="selectedFolder"
        :documents="currentDocuments"
        :folder-type="selectedFolder"
        :is-loading="isLoadingDocuments"
        @back="handleBack"
        @upload="handleUploadClick"
        @delete="handleDocumentDelete"
      />
    </div>

    <!-- Upload Dialog -->
    <UploadDocumentDialog
      v-if="selectedFolder"
      :open="showUploadDialog"
      :folder-type="selectedFolder"
      @update:open="showUploadDialog = $event"
      @uploaded="handleDocumentUploaded"
    />
  </div>
</template>
