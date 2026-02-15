import { URL } from "~/lib/constants/url"

export interface MediaUploadResponse {
  id: string
  url: string
  name: string
  size: number
  mime_type: string
}

export const mediaApi = {
  upload: (file: File): Promise<MediaUploadResponse> => {
    const apiFetch = useApiFetch()
    
    const formData = new FormData()
    formData.append('file', file)
    
    return apiFetch(URL.API.MEDIA.UPLOAD, {
      method: 'POST',
      body: formData,
    })
  },
}

export const useMediaUpload = () => {
  const isUploading = ref(false)
  const uploadError = ref<string | null>(null)
  const uploadProgress = ref(0)

  const uploadFile = async (file: File): Promise<string | null> => {
    isUploading.value = true
    uploadError.value = null
    uploadProgress.value = 0

    try {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Allowed: JPEG, PNG, GIF, WebP, PDF')
      }

      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit')
      }

      uploadProgress.value = 50

      const response = await mediaApi.upload(file)

      uploadProgress.value = 100
      return response.id
    } catch (error: any) {
      uploadError.value = error?.message || 'Failed to upload file'
      console.error('Upload error:', error)
      return null
    } finally {
      isUploading.value = false
    }
  }

  const handleFileInput = async (event: Event): Promise<string | null> => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (!file) {
      uploadError.value = 'No file selected'
      return null
    }

    return uploadFile(file)
  }

  const clearError = () => {
    uploadError.value = null
  }

  const reset = () => {
    isUploading.value = false
    uploadError.value = null
    uploadProgress.value = 0
  }

  return {
    isUploading,
    uploadError,
    uploadProgress,
    uploadFile,
    handleFileInput,
    clearError,
    reset,
  }
}
