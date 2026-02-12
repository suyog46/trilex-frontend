<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { DocumentItem } from '~/composables/api/cases.api'

const props = defineProps<{
  documents: DocumentItem[]
  folderType: 'client' | 'internal'
  isLoading?: boolean
}>()

const emit = defineEmits<{
  'back': []
  'upload': []
  'delete': [documentId: string]
}>()

const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case 'pdf':
      return 'mdi:file-pdf-box'
    case 'image':
      return 'mdi:file-image'
    case 'document':
      return 'mdi:file-document'
    default:
      return 'mdi:file'
  }
}

const getFileIconColor = (fileType: string) => {
  switch (fileType) {
    case 'pdf':
      return 'text-red-600 bg-red-100'
    case 'image':
      return 'text-blue-600 bg-blue-100'
    case 'document':
      return 'text-green-600 bg-green-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const downloadDocument = (doc: DocumentItem) => {
  window.open(doc.file.url, '_blank')
}
</script>

<template>
  <div class="py-8">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <button
          @click="emit('back')"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Icon icon="mdi:arrow-left" class="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">
            {{ folderType === 'client' ? 'Client Files' : 'My Files' }}
          </h3>
          <p class="text-sm text-gray-600">
            {{ folderType === 'client' ? 'Documents shared with client' : 'Internal documents' }}
          </p>
        </div>
      </div>

      <button
        @click="emit('upload')"
        class="flex items-center gap-2 px-4 py-2 bg-primary-normal text-white rounded-lg hover:bg-primary-dark transition-colors"
      >
        <Icon icon="mdi:upload" class="w-5 h-5" />
        <span>Upload Document</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="space-y-4">
          <div class="h-12 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="documents.length === 0" class="text-center py-12">
      <Icon icon="mdi:file-document-outline" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-600 mb-4">No documents found</p>
      <button
        @click="emit('upload')"
        class="px-4 py-2 bg-primary-normal text-white rounded-lg hover:bg-primary-dark transition-colors"
      >
        Upload First Document
      </button>
    </div>

    <!-- Documents Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between mb-4">
          <div :class="['w-12 h-12 rounded-lg flex items-center justify-center', getFileIconColor(doc.file_type)]">
            <Icon :icon="getFileIcon(doc.file_type)" class="w-6 h-6" />
          </div>
          <div class="relative group">
            <button class="text-gray-400 hover:text-gray-600 p-1">
              <Icon icon="mdi:dots-vertical" class="w-5 h-5" />
            </button>
            <div class="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
              <button
                @click="downloadDocument(doc)"
                class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
              >
                <Icon icon="mdi:download" class="w-4 h-4" />
                Download
              </button>
              <button
                @click="emit('delete', doc.id)"
                class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-red-600"
              >
                <Icon icon="mdi:delete" class="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <h3 class="font-semibold text-gray-900 mb-2 truncate" :title="doc.title">
          {{ doc.title }}
        </h3>
        <p v-if="doc.description" class="text-sm text-gray-600 mb-2 line-clamp-2">
          {{ doc.description }}
        </p>
        <p class="text-xs text-gray-500 mb-4">
          {{ formatDate(doc.created_at) }} • {{ doc.uploaded_by_type }}
        </p>

        <div class="flex gap-2">
          <button
            @click="downloadDocument(doc)"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Download
          </button>
          <a
            :href="doc.file.url"
            target="_blank"
            class="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary-normal hover:bg-primary-dark transition-colors text-center"
          >
            View
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
