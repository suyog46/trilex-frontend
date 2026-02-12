<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { useMediaUpload } from '~/composables/api/media.api'
import { toast } from 'vue-sonner'
import type { UploadDocumentInput } from '~/composables/api/cases.api'

const props = defineProps<{
  open: boolean
  folderType: 'client' | 'internal'
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'uploaded': [data: UploadDocumentInput]
}>()

const { uploadFile, isUploading } = useMediaUpload()

const title = ref('')
const description = ref('')
const selectedFile = ref<File | null>(null)
const filePreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const fileType = computed(() => {
  if (!selectedFile.value) return 'document'
  
  const type = selectedFile.value.type
  if (type.startsWith('image/')) return 'image'
  if (type === 'application/pdf') return 'pdf'
  return 'document'
})

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    toast.error('File size must be less than 10MB')
    return
  }
  
  selectedFile.value = file
  
  // Create preview for images
  if (file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      filePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  } else {
    filePreview.value = null
  }
}

const removeFile = () => {
  selectedFile.value = null
  filePreview.value = null
}

const resetForm = () => {
  title.value = ''
  description.value = ''
  selectedFile.value = null
  filePreview.value = null
}

const handleUpload = async () => {
  if (!selectedFile.value) {
    toast.error('Please select a file')
    return
  }
  
  if (!title.value.trim()) {
    toast.error('Please enter a document title')
    return
  }
  
  try {
    const uploadedFileId = await uploadFile(selectedFile.value)
    
    if (!uploadedFileId) {
      toast.error('Failed to upload file')
      return
    }
    
    // Emit the upload event with necessary data
    emit('uploaded', {
      title: title.value,
      description: description.value,
      file: uploadedFileId,
      file_type: fileType.value,
      document_scope: props.folderType === 'client' ? 'client' : 'internal',
    })
    
    resetForm()
    emit('update:open', false)
  } catch (error) {
    console.error('Upload error:', error)
    toast.error('Failed to upload document')
  }
}

const handleClose = () => {
  emit('update:open', false)
  resetForm()
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="sm:max-w-[500px] bg-white">
      <DialogHeader>
        <DialogTitle>Upload Document</DialogTitle>
        <p class="text-sm text-gray-600">
          Upload to {{ folderType === 'client' ? 'Client Files' : 'My Files' }}
        </p>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <!-- File Upload Area -->
        <div
          v-if="!selectedFile"
          class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-normal transition-colors cursor-pointer"
          @click="() => fileInput?.click()"
        >
          <Icon icon="mdi:cloud-upload" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-600 mb-2">Click to upload or drag and drop</p>
          <p class="text-sm text-gray-500">PDF, Images, Documents (max 10MB)</p>
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            @change="handleFileSelect"
          />
        </div>

        <!-- Selected File Preview -->
        <div v-else class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-start gap-4">
            <!-- Preview -->
            <div v-if="filePreview" class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img :src="filePreview" :alt="selectedFile.name" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:file-document" class="w-8 h-8 text-gray-400" />
            </div>

            <!-- File Info -->
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 truncate">{{ selectedFile.name }}</p>
              <p class="text-sm text-gray-500">
                {{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB
              </p>
            </div>

            <!-- Remove Button -->
            <button
              @click="removeFile"
              class="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <Icon icon="mdi:close" class="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <!-- Title Input -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">
            Title <span class="text-red-500">*</span>
          </label>
          <Input
            v-model="title"
            placeholder="Enter document title"
            :disabled="isUploading"
          />
        </div>

        <!-- Description Input -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Description</label>
          <Textarea
            v-model="description"
            placeholder="Enter document description (optional)"
            rows="3"
            :disabled="isUploading"
          />
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          @click="handleClose"
          :disabled="isUploading"
        >
          Cancel
        </Button>
        <Button
          type="button"
          @click="handleUpload"
          :disabled="!selectedFile || !title || isUploading"
          class="bg-primary-normal hover:bg-primary-dark text-white"
        >
          <Icon v-if="isUploading" icon="mdi:loading" class="w-4 h-4 mr-2 animate-spin" />
          {{ isUploading ? 'Uploading...' : 'Upload' }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
