<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import StepTabs from '~/components/ui/tabs/StepTabs.vue'
import { TabsContent } from '~/components/ui/tabs'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Textarea } from "~/components/ui/textarea"
import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { createCaseSchema } from "~/lib/validations/case"
import { type Category, casesApi, type CreateCaseInput, type RegisteredClient } from "~/composables/api/cases.api"
import { useMediaUpload } from "~/composables/api/media.api"
import { toast } from 'vue-sonner'
import SelectClientDialog from '~/components/dialogs/SelectClientDialog.vue'
import DocumentFolderView from '~/components/cases/DocumentFolderView.vue'
import DocumentUploadView from '~/components/cases/DocumentUploadView.vue'

definePageMeta({
  layout: "lawyer",
})

const activeStep = ref("general")
const showClientDialog = ref(false)
const selectedClient = ref<RegisteredClient | null>(null)

// Media upload
const { uploadFile, isUploading: isUploadingMedia } = useMediaUpload()

// Form submission state
const isSubmitting = ref(false)

// Categories
const categories = ref<Category[]>([])
const loadingCategories = ref(false)

// Documents state
const clientDocuments = ref<Array<{
  id: string
  file: File
  preview: string
  title: string
  description: string
  uploadedId: string
}>>([])

const internalDocuments = ref<Array<{
  id: string
  file: File
  preview: string
  title: string
  description: string
  uploadedId: string
}>>([])

const activeDocumentFolder = ref<'client' | 'internal' | null>(null)

const caseDates = ref<Array<{
  id: string
  date: string
  remark: string
  assigned_to_name: string
}>>([])

const { handleSubmit, values, setFieldValue, resetForm, errors } = useForm({
  validationSchema: toTypedSchema(createCaseSchema),
  initialValues: {
    title: "",
    case_category: "",
    court_type: "district",
    description: "",
    status: "draft",
    client: undefined,
    client_details: {
      full_name: "",
      address: "",
      email: "",
      phone: "",
      date_of_birth: "",
      citizenship_number: "",
      gender: "male",
    },
    waris: {
      full_name: "",
      email: "",
      address: "",
      phone: "",
      date_of_birth: "",
      citizenship_number: "",
      gender: "male",
    },
    documents: [],
    dates: [],
  },
})

const steps = [
  { key: "general", label: "General Information" },
  { key: "client", label: "Client Details" },
  { key: "documents", label: "Documents" },
  { key: "waris", label: "Waris Details" },
  { key: "progress", label: "Progress" },
]

const fetchCategories = async () => {
  loadingCategories.value = true
  try {
    const response = await casesApi.getCategories({ active: true, page: 1, page_size: 100 })
    categories.value = response.results || []
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    toast.error("Failed to load categories")
  } finally {
    loadingCategories.value = false
  }
}

onMounted(() => {
  fetchCategories()
})

const handleClientSelect = (client: RegisteredClient) => {
  selectedClient.value = client
  setFieldValue('client', client.id)
  
  if (client.verification) {
    setFieldValue('client_details.full_name', client.verification.full_name || '')
    setFieldValue('client_details.email', client.user.email || '')
    setFieldValue('client_details.phone', client.profile?.phone_number || '')
  }
  
  toast.success('Client linked and details pre-filled successfully')
}

const removeLinkedClient = () => {
  selectedClient.value = null
  setFieldValue('client', undefined)
  toast.info('Registered client unlinked')
}

const openDocumentFolder = (folder: 'client' | 'internal') => {
  activeDocumentFolder.value = folder
}

const closeDocumentFolder = () => {
  activeDocumentFolder.value = null
}

const updateDocumentTitle = (id: string, title: string) => {
  const docs = activeDocumentFolder.value === 'client' ? clientDocuments.value : internalDocuments.value
  const doc = docs.find(d => d.id === id)
  if (doc) {
    doc.title = title
  }
}

const updateDocumentDescription = (id: string, description: string) => {
  const docs = activeDocumentFolder.value === 'client' ? clientDocuments.value : internalDocuments.value
  const doc = docs.find(d => d.id === id)
  if (doc) {
    doc.description = description
  }
}

const handleDocumentUpload = async (event: Event, scope: 'client' | 'internal') => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
  if (!allowedTypes.includes(file.type)) {
    toast.error('Invalid file type. Allowed: JPEG, PNG, GIF, WebP, PDF')
    return
  }

  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    toast.error('File size exceeds 10MB limit')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const preview = e.target?.result as string
    const id = Math.random().toString(36).substring(7)
    
    const document = {
      id,
      file,
      preview,
      title: file.name,
      description: '',
      uploadedId: '',
    }

    if (scope === 'client') {
      clientDocuments.value.push(document)
    } else {
      internalDocuments.value.push(document)
    }
  }
  reader.readAsDataURL(file)

  const uploadedId = await uploadFile(file)
  if (uploadedId) {
    const docs = scope === 'client' ? clientDocuments.value : internalDocuments.value
    const doc = docs[docs.length - 1]
    if (doc) {
      doc.uploadedId = uploadedId
    }
    toast.success('Document uploaded successfully')
  } else {
    toast.error('Failed to upload document')
    if (scope === 'client') {
      clientDocuments.value.pop()
    } else {
      internalDocuments.value.pop()
    }
  }

  input.value = ''
}

const removeDocument = (id: string, scope: 'client' | 'internal') => {
  if (scope === 'client') {
    clientDocuments.value = clientDocuments.value.filter(doc => doc.id !== id)
  } else {
    internalDocuments.value = internalDocuments.value.filter(doc => doc.id !== id)
  }
  toast.success('Document removed')
}

const addDate = () => {
  const id = Math.random().toString(36).substring(7)
  caseDates.value.push({
    id,
    date: '',
    remark: '',
    assigned_to_name: '',
  })
}

const removeDate = (id: string) => {
  caseDates.value = caseDates.value.filter(date => date.id !== id)
}

const onSubmit = handleSubmit(async (formValues: any) => {
  isSubmitting.value = true
  try {
    console.log('=== FORM SUBMISSION START ===')
    console.log('Form values:', JSON.stringify(formValues, null, 2))
    console.log('Current errors:', errors.value)

    const documents = [
      ...clientDocuments.value.map(doc => {
        const fileType: 'image' | 'pdf' | 'document' = doc.file.type.includes('pdf') ? 'pdf' : doc.file.type.includes('image') ? 'image' : 'document'
        return {
          title: doc.title,
          description: doc.description,
          file: doc.uploadedId,
          file_type: fileType,
          document_scope: 'client' as const,
        }
      }),
      ...internalDocuments.value.map(doc => {
        const fileType: 'image' | 'pdf' | 'document' = doc.file.type.includes('pdf') ? 'pdf' : doc.file.type.includes('image') ? 'image' : 'document'
        return {
          title: doc.title,
          description: doc.description,
          file: doc.uploadedId,
          file_type: fileType,
          document_scope: 'internal' as const,
        }
      }),
    ]

    const dates = caseDates.value
      .filter(d => d.date) 
      .map(d => ({
        date_type: 'tarik' as const,
        date: d.date,
        remark: d.remark || '',
        assigned_to_name: d.assigned_to_name || '',
      }))

    const payload: CreateCaseInput = {
      title: formValues.title,
      case_category: formValues.case_category,
      court_type: formValues.court_type,
      description: formValues.description,
      status: formValues.status,
      client_details: formValues.client_details, // Send client details as part of the main payload
    }
    
    if (formValues.client) {
      payload.client = formValues.client
    }

    if (formValues.waris?.full_name) {
      payload.waris = formValues.waris
    }

    if (documents.length > 0) {
      payload.documents = documents
    }

    if (dates.length > 0) {
      payload.dates = dates
    }

    await casesApi.createCase(payload)
    toast.success('Case created successfully!')
    
    resetForm()
    clientDocuments.value = []
    internalDocuments.value = []
    caseDates.value = []
    selectedClient.value = null
    activeDocumentFolder.value = null
    activeStep.value = 'general'
    
    setTimeout(() => {
      navigateTo(`/cases/${payload.status || ''}`)
    }, 1000)
  } catch (error: any) {
    console.error('Failed to create case:', error)
    const errorMessage = error?.data?.message || error?.message || 'Failed to create case'
    toast.error(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}, (validationErrors) => {
  console.log('=== VALIDATION ERRORS ===')
  console.log('Validation errors:', JSON.stringify(validationErrors, null, 2))
  console.log('Form values at error time:', JSON.stringify(values, null, 2))
  
  const errorMessages = Object.entries(validationErrors.errors).map(([field, messages]) => {
    const fieldName = field.split('.').pop()?.replace(/_/g, ' ') || field
    const message = Array.isArray(messages) ? messages[0] : messages
    return `${fieldName}: ${message}`
  })
  
  if (errorMessages.length > 0) {
    const errorMessage: string = errorMessages.length === 1 
      ? (errorMessages[0] || 'Validation error') 
      : `Please fix the following errors:\n${errorMessages.slice(0, 3).join('\n')}${errorMessages.length > 3 ? `\n... and ${errorMessages.length - 3} more` : ''}`
    
    toast.error(errorMessage)
  } else {
    toast.error('Please fill in all required fields correctly')
  }
})

const isLoading = computed(() => isUploadingMedia.value || isSubmitting.value)

const goToNextStep = () => {
  const currentIndex = steps.findIndex(s => s.key === activeStep.value)
  if (currentIndex < steps.length - 1 && currentIndex !== -1) {
    const nextStep = steps[currentIndex + 1]
    if (nextStep) {
      if (activeStep.value === 'documents') {
        activeDocumentFolder.value = null
      }
      activeStep.value = nextStep.key
    }
  }
}

const goToPreviousStep = () => {
  const currentIndex = steps.findIndex(s => s.key === activeStep.value)
  if (currentIndex > 0) {
    const prevStep = steps[currentIndex - 1]
    if (prevStep) {
      if (activeStep.value === 'documents') {
        activeDocumentFolder.value = null
      }
      activeStep.value = prevStep.key
    }
  }
}
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="w-full">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Create New Case</h1>
      
      <form @submit="onSubmit">
        <StepTabs
          v-model="activeStep"
          :steps="steps"
          width="full"
        >
          <TabsContent value="general" class="space-y-6" force-mount v-show="activeStep === 'general'">
            <div class="bg-white rounded-lg shadow p-6 space-y-10">
              <FormField v-slot="{ componentField }" name="title">
                <FormItem>
                  <FormLabel class="text-lg font-semibold">
                    Case Title <span class="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      v-bind="componentField"
                      placeholder="Enter case title"
                      :disabled="isLoading"
                      class="border border-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

                  <FormField v-slot="{ componentField }" name="description">
                <FormItem>
                  <FormLabel class="text-lg font-semibold">
                    Description <span class="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      v-bind="componentField"
                      placeholder="Enter case description"
                      :disabled="isLoading"
                      rows="6"
                      class="resize-none border border-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
              <div class="grid grid-cols-2 gap-5">
                <FormField v-slot="{ componentField }" name="case_category" class="w-full" >
                  <FormItem>
                    <FormLabel class="text-lg font-semibold">
                      Case Category <span class="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <select
                        v-bind="componentField"
                        :disabled="isLoading || loadingCategories"
                        class="w-full h-13 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 transition-all duration-200 ease-in-out hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-normal/20 focus:border-primary-normal disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm hover:shadow"
                      >
                        <option value="">Select a category</option>
                        <option v-for="category in categories" :key="category.id" :value="category.id">
                          {{ category.name }}
                        </option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
  
                <FormField v-slot="{ componentField }" name="court_type">
                  <FormItem>
                    <FormLabel class="text-lg font-semibold">
                      Court Type <span class="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <select
                        v-bind="componentField"
                        :disabled="isLoading"
                        class="w-full h-13 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 transition-all duration-200 ease-in-out hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-normal/20 focus:border-primary-normal disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm hover:shadow"
                      >
                        <option value="district">District Court</option>
                        <option value="high">High Court</option>
                        <option value="supreme">Supreme Court</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

              </div>

          
            </div>

            <div class="flex justify-end">
              <Button
                type="button"
                @click="goToNextStep"
                class="px-6 py-2 bg-primary-normal text-white"
              >
                Next Step
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="client" class="space-y-6" force-mount v-show="activeStep === 'client'">
            <div class="bg-white rounded-lg shadow p-6 space-y-6">
              <div class="mb-6">
                <div class="flex items-center justify-between mb-3">
                  <div>
                    <h3 class="text-base font-semibold text-gray-900">Link to Registered Client (Optional)</h3>
                    <p class="text-sm text-gray-600">Link this case to an existing client in your system</p>
                  </div>
                  <Button
                    v-if="!selectedClient"
                    type="button"
                    variant="outline"
                    @click="showClientDialog = true"
                    size="sm"
                  >
                    <Icon icon="mdi:link-variant" class="w-4 h-4 mr-2" />
                    Link Client
                  </Button>
                </div>

                <!-- Linked Client Display -->
                <div v-if="selectedClient" class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      <img
                        v-if="selectedClient.verification?.passport_size_photo?.url"
                        :src="selectedClient.verification.passport_size_photo.url"
                        :alt="selectedClient.verification?.full_name"
                        class="w-full h-full object-cover"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <Icon icon="mdi:account" class="w-6 h-6 text-gray-500" />
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        <Icon icon="mdi:link-variant" class="w-4 h-4 text-green-600" />
                        <span class="text-sm font-medium text-green-800">Linked to:</span>
                      </div>
                      <p class="font-semibold text-gray-900">{{ selectedClient.verification?.full_name || 'N/A' }}</p>
                      <p class="text-sm text-gray-600">{{ selectedClient.user.email }}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      @click="removeLinkedClient"
                    >
                      <Icon icon="mdi:link-variant-off" class="w-5 h-5 text-gray-500" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-base font-semibold text-gray-900 mb-4">Client Information <span class="text-red-500">*</span></h3>
                <div class="grid grid-cols-2 gap-5">
                <FormField v-slot="{ componentField }" name="client_details.full_name">
                  <FormItem>
                    <FormLabel>Full Name <span class="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input v-bind="componentField" placeholder="Enter full name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="client_details.email">
                  <FormItem>
                    <FormLabel>Email <span class="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input v-bind="componentField" type="email" placeholder="Enter email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="client_details.phone">
                  <FormItem>
                    <FormLabel>Phone <span class="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input v-bind="componentField" placeholder="Enter phone number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <!-- Address -->
                <FormField v-slot="{ componentField }" name="client_details.address">
                  <FormItem>
                    <FormLabel>Address <span class="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input v-bind="componentField" placeholder="Enter address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="client_details.date_of_birth">
                  <FormItem>
                    <FormLabel>Date of Birth <span class="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input v-bind="componentField" type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="client_details.citizenship_number">
                  <FormItem>
                    <FormLabel>Citizenship Number <span class="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input v-bind="componentField" placeholder="Enter citizenship number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="client_details.gender">
                  <FormItem>
                    <FormLabel>Gender <span class="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <select v-bind="componentField" class="w-full h-13 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 transition-all duration-200 ease-in-out hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-normal/20 focus:border-primary-normal shadow-sm hover:shadow">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
              </div>
            </div>

            <div class="flex justify-between">
              <Button type="button" variant="outline" @click="goToPreviousStep">
                Previous
              </Button>
              <Button type="button" @click="goToNextStep" class="bg-primary-normal text-white">
                Next Step
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="documents" class="space-y-6" force-mount v-show="activeStep === 'documents'">
            <div class="bg-white rounded-lg shadow p-6">
              <DocumentFolderView
                v-if="!activeDocumentFolder"
                :client-files-count="clientDocuments.length"
                :internal-files-count="internalDocuments.length"
                @open-folder="openDocumentFolder"
              />

              <DocumentUploadView
                v-else
                :folder-type="activeDocumentFolder"
                :documents="activeDocumentFolder === 'client' ? clientDocuments : internalDocuments"
                :is-uploading="isUploadingMedia"
                @upload="handleDocumentUpload($event, activeDocumentFolder)"
                @remove="removeDocument($event, activeDocumentFolder)"
                @update-title="updateDocumentTitle"
                @update-description="updateDocumentDescription"
                @back="closeDocumentFolder"
              />
            </div>

            <div class="flex justify-between">
              <Button type="button" variant="outline" @click="goToPreviousStep">
                Previous
              </Button>
              <Button type="button" @click="goToNextStep">
                Next Step
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="waris" class="space-y-6" force-mount v-show="activeStep === 'waris'">
            <div class="bg-white rounded-lg shadow p-6  grid grid-cols-2 gap-5">
              <!-- <p class="text-gray-600 mb-4">Enter the opponent/waris details (optional)</p> -->

              <FormField v-slot="{ componentField }" name="waris.full_name">
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" placeholder="Enter full name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="waris.email">
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" type="email" placeholder="Enter email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="waris.phone">
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" placeholder="Enter phone number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="waris.address">
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" placeholder="Enter address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="waris.date_of_birth">
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="waris.citizenship_number">
                <FormItem>
                  <FormLabel>Citizenship Number</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" placeholder="Enter citizenship number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="waris.gender">
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <select v-bind="componentField" class="w-full h-13 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 transition-all duration-200 ease-in-out hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-normal/20 focus:border-primary-normal shadow-sm hover:shadow">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>

            <div class="flex justify-between">
              <Button type="button" variant="outline" @click="goToPreviousStep">
                Previous
              </Button>
              <Button type="button" @click="goToNextStep">
                Next Step
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="progress" class="space-y-6" force-mount v-show="activeStep === 'progress'">
            <div class="bg-white rounded-lg shadow p-6 space-y-6">
              <FormField v-slot="{ componentField }" name="status">
                <FormItem>
                  <FormLabel class="text-lg font-semibold">Case Status <span class="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <div class="space-y-3">
                      <label class="flex items-center gap-3 cursor-pointer p-3 \ rounded-lg hover:bg-gray-50">
                        <input
                          type="radio"
                          v-bind="componentField"
                          value="draft"
                          class="w-4 h-4"
                        />
                        <div>
                          <div class="font-medium">Draft</div>
                          <div class="text-sm text-gray-600">Case is in draft mode</div>
                        </div>
                      </label>
                      <label class="flex items-center gap-3 cursor-pointer p-3 
                       rounded-lg hover:bg-gray-50">
                        <input
                          type="radio"
                          v-bind="componentField"
                          value="registered"
                          class="w-4 h-4"
                        />
                        <div>
                          <div class="font-medium">Registered</div>
                          <div class="text-sm text-gray-600">Case has been registered</div>
                        </div>
                      </label>
                      <label class="flex items-center gap-3 cursor-pointer p-3  rounded-lg hover:bg-gray-50">
                        <input
                          type="radio"
                          v-bind="componentField"
                          value="ongoing"
                          class="w-4 h-4"
                        />
                        <div>
                          <div class="font-medium">Ongoing</div>
                          <div class="text-sm text-gray-600">Case is currently ongoing</div>
                        </div>
                      </label>
                      <label class="flex items-center gap-3 cursor-pointer p-3  rounded-lg hover:bg-gray-50">
                        <input
                          type="radio"
                          v-bind="componentField"
                          value="completed"
                          class="w-4 h-4"
                        />
                        <div>
                          <div class="font-medium">Completed</div>
                          <div class="text-sm text-gray-600">Case has been completed</div>
                        </div>
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <div class="border-t pt-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold">Tarik Dates</h3>
                  <Button type="button" size="sm" @click="addDate">
                    <Icon icon="mdi:plus" class="w-4 h-4 mr-2" />
                    Add Date
                  </Button>
                </div>

                <div v-if="caseDates.length === 0" class="text-center py-8 text-gray-500">
                  <Icon icon="mdi:calendar-blank" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No dates added yet</p>
                </div>

                <div v-else class="space-y-4">
                  <div
                    v-for="date in caseDates"
                    :key="date.id"
                    class="border rounded-lg p-4 space-y-3"
                  >
                    <div class="flex items-start gap-4">
                      <div class="flex-1 space-y-3">
                        <div>
                          <label class="block text-sm font-medium mb-1">Date *</label>
                          <Input
                            v-model="date.date"
                            type="date"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium mb-1">Assigned To</label>
                          <Input
                            v-model="date.assigned_to_name"
                            placeholder="Name of person assigned"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium mb-1">Remark</label>
                          <Textarea
                            v-model="date.remark"
                            placeholder="Add any remarks"
                            rows="2"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        @click="removeDate(date.id)"
                      >
                        <Icon icon="mdi:delete" class="w-5 h-5 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-between">
              <Button type="button" variant="outline" @click="goToPreviousStep">
                Previous
              </Button>
              <Button
                type="submit"
                :disabled="isLoading"
                class="bg-primary-normal hover:bg-primary-normal/90 text-white"
              >
                <Icon v-if="isLoading" icon="mdi:loading" class="w-5 h-5 mr-2 animate-spin" />
                {{ isLoading ? 'Creating...' : 'Create Case' }}
              </Button>
            </div>
          </TabsContent>
        </StepTabs>
      </form>
    </div>

    <!-- Client Selection Dialog -->
    <SelectClientDialog
      :open="showClientDialog"
      @update:open="showClientDialog = $event"
      @select="handleClientSelect"
    />
  </div>
</template>