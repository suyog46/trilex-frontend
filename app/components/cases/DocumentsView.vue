<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { casesApi, type CaseListItem, type DocumentItem, type UploadDocumentInput } from '~/composables/api/cases.api'
import { toast } from 'vue-sonner'
import DocumentFolderView from '~/components/cases/DocumentFolderView.vue'
import DocumentListView from '~/components/cases/DocumentListView.vue'
import UploadDocumentDialog from '~/components/dialogs/UploadDocumentDialog.vue'

interface Props {
  scope?: 'lawyer' | 'client'
}

const props = withDefaults(defineProps<Props>(), {
  scope: 'lawyer'
})

const activeTab = ref<'draft' | 'ongoing' | 'completed' | 'registered'>('draft')
const isLoadingCases = ref(false)
const cases = ref<CaseListItem[]>([])
const casesAbortController = ref<AbortController | null>(null)
const currentFetchingStatus = ref<'draft' | 'ongoing' | 'completed' | 'registered'>('draft')

const selectedCase = ref<CaseListItem | null>(null)
const selectedFolder = ref<'client' | 'internal' | 'firm' | null>(null)

const clientDocuments = ref<DocumentItem[]>([])
const internalDocuments = ref<DocumentItem[]>([])
const firmDocuments = ref<DocumentItem[]>([])
const isLoadingDocuments = ref(false)
const documentsAbortController = ref<AbortController | null>(null)
const currentFetchingCaseId = ref<string | null>(null)

const showUploadDialog = ref(false)

const isClientScope = computed(() => props.scope === 'client')

const fetchCases = async (status: string) => {
  if (casesAbortController.value) {
    casesAbortController.value.abort()
  }
  casesAbortController.value = new AbortController()
  currentFetchingStatus.value = status as 'draft' | 'ongoing' | 'completed' | 'registered'
  const statusToFetch = status
  isLoadingCases.value = true
  try {
    const response = await casesApi.getCasesList({
      status: statusToFetch,
      page: 1,
      page_size: 100,
    })
    if (statusToFetch !== currentFetchingStatus.value) {
      return
    }
    cases.value = response.results
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      return
    }
    console.error('Error fetching cases:', error)
    if (statusToFetch === currentFetchingStatus.value) {
      toast.error('Failed to load cases')
    }
  } finally {
    if (statusToFetch === currentFetchingStatus.value) {
      isLoadingCases.value = false
    }
  }
}

const fetchDocuments = async (caseId: string) => {
  if (documentsAbortController.value) {
    documentsAbortController.value.abort()
  }
  documentsAbortController.value = new AbortController()
  currentFetchingCaseId.value = caseId
  const caseIdToFetch = caseId
  isLoadingDocuments.value = true
  try {
    const clientResponse = await casesApi.getCaseDocuments(caseId, {
      scope: 'client',
      page_size: 100,
    })
    if (caseIdToFetch !== currentFetchingCaseId.value) {
      return
    }
    clientDocuments.value = clientResponse.results

    if (!isClientScope.value) {
      const internalResponse = await casesApi.getCaseDocuments(caseId, {
        scope: 'my',
        page_size: 100,
      })
      if (caseIdToFetch !== currentFetchingCaseId.value) {
        return
      }
      internalDocuments.value = internalResponse.results

      const firmResponse = await casesApi.getCaseDocuments(caseId, {
        scope: 'firm',
        page_size: 100,
      })
      if (caseIdToFetch !== currentFetchingCaseId.value) {
        return
      }
      firmDocuments.value = firmResponse.results
    }
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      return
    }
    console.error('Error fetching documents:', error)
    if (caseIdToFetch === currentFetchingCaseId.value) {
      toast.error('Failed to load documents')
    }
  } finally {
    if (caseIdToFetch === currentFetchingCaseId.value) {
      isLoadingDocuments.value = false
    }
  }
}

watch(activeTab, (newTab) => {
  selectedCase.value = null
  selectedFolder.value = null
  cases.value = []
  fetchCases(newTab)
}, { immediate: true })

const handleCaseSelect = (caseItem: CaseListItem) => {
  selectedCase.value = caseItem
  clientDocuments.value = []
  internalDocuments.value = []
  firmDocuments.value = []
  
  if (isClientScope.value) {
    selectedFolder.value = 'client'
  } else {
    selectedFolder.value = null
  }
  
  fetchDocuments(caseItem.id)
}

const handleFolderSelect = (folder: 'client' | 'internal' | 'firm') => {
  selectedFolder.value = folder
}

const handleBack = () => {
  if (selectedFolder.value) {
    if (isClientScope.value) {
      selectedCase.value = null
      selectedFolder.value = null
    } else {
      selectedFolder.value = null
    }
  } else {
    selectedCase.value = null
  }
}

const handleUploadClick = () => {
  showUploadDialog.value = true
}

const handleDocumentUploaded = async (data: UploadDocumentInput) => {
  if (!selectedCase.value) return
  
  try {
    await casesApi.uploadCaseDocument(selectedCase.value.id, data)
    toast.success('Document uploaded successfully')
    
    await fetchDocuments(selectedCase.value.id)
  } catch (error) {
    console.error('Error uploading document:', error)
    toast.error('Failed to upload document')
  }
}

const handleDocumentDelete = async (documentId: string) => {
  toast.info('Delete functionality coming soon')
}

const currentDocuments = computed(() => {
  if (selectedFolder.value === 'client') {
    return clientDocuments.value
  } else if (selectedFolder.value === 'internal') {
    return internalDocuments.value
  } else if (selectedFolder.value === 'firm') {
    return firmDocuments.value
  }
  return []
})

const uploadFolderType = computed(() => {
  if (isClientScope.value) {
    return 'client'
  }
  if (selectedFolder.value === 'firm') {
    return 'internal'
  }
  return selectedFolder.value || 'client'
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

    <div v-if="!selectedCase" class="bg-white rounded-lg shadow-sm p-6">
      <Tabs v-model="activeTab">
        <TabsList class="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="registered">Registered</TabsTrigger>
        </TabsList>

        <div v-if="isLoadingCases" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="border border-gray-200 rounded-lg p-4">
            <div class="space-y-3">
              <div class="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        </div>

        <div v-else-if="cases.length === 0" class="text-center py-12">
          <Icon icon="mdi:folder-open-outline" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-600">No {{ activeTab }} cases found</p>
        </div>

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

    <div v-else class="bg-white rounded-lg shadow-sm p-6">
      <DocumentFolderView
        v-if="!selectedFolder && !isClientScope"
        :client-files-count="clientDocuments.length"
        :internal-files-count="internalDocuments.length"
        :firm-files-count="firmDocuments.length"
        :show-firm-folder="!isClientScope"
        @open-folder="handleFolderSelect"
      />

      <DocumentListView
        v-if="selectedFolder"
        :documents="currentDocuments"
        :folder-type="selectedFolder"
        :is-loading="isLoadingDocuments"
        @back="handleBack"
        @upload="handleUploadClick"
        @delete="handleDocumentDelete"
      />
    </div>

    <UploadDocumentDialog
      v-if="selectedFolder"
      :open="showUploadDialog"
      :folder-type="uploadFolderType"
      @update:open="showUploadDialog = $event"
      @uploaded="handleDocumentUploaded"
    />
  </div>
</template>
