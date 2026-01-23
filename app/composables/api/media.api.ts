import { URL } from "~/lib/constants/url"

export interface MediaUploadResponse {
  id: string
  url: string
  name: string
  size: number
  mime_type: string
}

export const mediaApi = {
  /**
   * Upload a media file (image, document, etc.)
   * POST /api/media/upload/
   * @param file - The file to upload
   * @returns Promise with upload response containing the media ID
   */
  upload: (file: File): Promise<MediaUploadResponse> => {
    const apiFetch = useApiFetch()
    
    // Create FormData for file upload
    const formData = new FormData()
    formData.append('file', file)
    
    return apiFetch(URL.API.MEDIA.UPLOAD, {
      method: 'POST',
      body: formData,
    })
  },
}

/**
 * Composable for handling image uploads
 * Manages file selection, upload progress, and error handling
 */
export const useMediaUpload = () => {
  const isUploading = ref(false)
  const uploadError = ref<string | null>(null)
  const uploadProgress = ref(0)

  /**
   * Upload a single file and return its ID
   * @param file - The file to upload
   * @returns Promise with the uploaded media ID
   */
  const uploadFile = async (file: File): Promise<string | null> => {
    isUploading.value = true
    uploadError.value = null
    uploadProgress.value = 0

    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Allowed: JPEG, PNG, GIF, WebP, PDF')
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit')
      }

      uploadProgress.value = 50 // Simulate progress

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

  /**
   * Handle file input change and upload
   * @param event - File input change event
   * @returns Promise with the uploaded media ID
   */
  const handleFileInput = async (event: Event): Promise<string | null> => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (!file) {
      uploadError.value = 'No file selected'
      return null
    }

    return uploadFile(file)
  }

  /**
   * Clear upload error
   */
  const clearError = () => {
    uploadError.value = null
  }

  /**
   * Reset upload state
   */
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
