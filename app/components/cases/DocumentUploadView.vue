<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'

const props = defineProps<{
  folderType: 'client' | 'internal'
  documents: Array<{
    id: string
    file: File
    preview: string
    title: string
    description: string
    uploadedId: string
  }>
  isUploading: boolean
}>()

const emit = defineEmits<{
  'upload': [event: Event]
  'remove': [id: string]
  'update-title': [id: string, title: string]
  'update-description': [id: string, description: string]
  'back': []
}>()

const folderInfo = computed(() => {
  return props.folderType === 'client'
    ? {
        name: 'Client Files',
        description: 'Documents visible to the client',
        icon: 'mdi:account-file',
        color: 'blue',
      }
    : {
        name: 'My Files',
        description: 'Internal documents (private)',
        icon: 'mdi:file-lock',
        color: 'green',
      }
})

const handleFileUpload = (event: Event) => {
  emit('upload', event)
}

const handleRemove = (id: string) => {
  emit('remove', id)
}

const updateDocTitle = (id: string, title: string) => {
  emit('update-title', id, title)
}

const updateDocDescription = (id: string, description: string) => {
  emit('update-description', id, description)
}
</script>

<template>
  <div>
    <div class="mb-6">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        @click="emit('back')"
        class="mb-4 -ml-2"
      >
        <Icon icon="mdi:arrow-left" class="w-5 h-5 mr-2" />
        Back to Folders
      </Button>

      <div class="flex items-center gap-4">
        <div
          :class="[
            'w-14 h-14 rounded-lg flex items-center justify-center bg-primary-light',
           
          ]"
        >
          <Icon
            :icon="folderInfo.icon"
            :class="[
              'w-7 h-7 text-primary-normal',
              
            ]"
          />
        </div>
        <div>
          <h3 class="text-xl font-semibold text-gray-900">{{ folderInfo.name }}</h3>
          <p class="text-sm text-gray-600">{{ folderInfo.description }}</p>
        </div>
      </div>
    </div>

    <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors mb-6">
      <Icon icon="mdi:cloud-upload" class="w-14 h-14 mx-auto text-gray-400 mb-4" />
      <label class="cursor-pointer">
        <span class="text-primary-normal hover:text-primary-normal/80 font-semibold text-lg">
          Click to upload
        </span>
        <span class="text-gray-600 text-lg"> or drag and drop</span>
        <input
          type="file"
          class="hidden"
          accept="image/*,application/pdf"
          @change="handleFileUpload"
          :disabled="isUploading"
        />
      </label>
      <p class="text-sm text-gray-500 mt-3">PDF, PNG, JPG, GIF, WebP up to 10MB</p>
      
      <div v-if="isUploading" class="mt-4 flex items-center justify-center gap-2 text-primary-normal">
        <Icon icon="mdi:loading" class="w-5 h-5 animate-spin" />
        <span class="text-sm font-medium">Uploading...</span>
      </div>
    </div>

    <div v-if="documents.length > 0" class="space-y-4">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-base font-semibold text-gray-900">
          Uploaded Documents ({{ documents.length }})
        </h4>
      </div>

      <div class="space-y-3">
        <div
          v-for="doc in documents"
          :key="doc.id"
          class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start gap-4">
            <div class="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img 
                v-if="doc.preview && doc.file.type.includes('image')" 
                :src="doc.preview" 
                class="w-full h-full object-cover" 
                :alt="doc.title"
              />
              <Icon 
                v-else-if="doc.file.type.includes('pdf')" 
                icon="mdi:file-pdf-box" 
                class="w-10 h-10 text-red-500" 
              />
              <Icon 
                v-else 
                icon="mdi:file-document" 
                class="w-10 h-10 text-gray-400" 
              />
            </div>

            <div class="flex-1 min-w-0 space-y-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Document Title <span class="text-red-500">*</span>
                </label>
                <Input
                  :model-value="doc.title"
                  @update:model-value="(val) => updateDocTitle(doc.id, val as string)"
                  placeholder="Enter document title"
                  class="text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <Input
                  :model-value="doc.description"
                  @update:model-value="(val) => updateDocDescription(doc.id, val as string)"
                  placeholder="Add description"
                  class="text-sm"
                />
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <Icon icon="mdi:file" class="w-4 h-4" />
                <span>{{ doc.file.name }}</span>
                <span class="text-gray-400">•</span>
                <span>{{ (doc.file.size / 1024).toFixed(2) }} KB</span>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              @click="handleRemove(doc.id)"
              class="text-gray-400 hover:text-red-500 flex-shrink-0"
            >
              <Icon icon="mdi:delete" class="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <Icon icon="mdi:folder-open" class="w-16 h-16 mx-auto text-gray-300 mb-4" />
      <h4 class="text-lg font-medium text-gray-900 mb-2">No documents yet</h4>
      <p class="text-sm text-gray-600">Upload your first document to get started</p>
    </div>
  </div>
</template>
