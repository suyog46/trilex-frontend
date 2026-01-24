<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useMediaUpload } from '~/composables/api/media.api'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { toast } from 'vue-sonner'
import { Input } from '~/components/ui/input'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '~/components/ui/form'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import StepNavigation from '../shared/StepNavigation.vue'
import PhotoUpload from '../shared/PhotoUpload.vue'

const props = defineProps<{
  verificationStatus?: any
  isResubmitting?: boolean
}>()

const emit = defineEmits(['submitted'])
const authStore = useAuthStore()
const { uploadFile } = useMediaUpload()
const { handleFormErrors } = useErrorHandler()

const currentStep = ref(1)
const steps = [
  { id: 1, label: 'Personal Info' },
  { id: 2, label: 'ID Type' },
  { id: 3, label: 'Photos' },
]

// Photo State
const passportPhotoFile = ref<File | null>(null)
const passportPhotoPreview = ref<string>('')
const passportPhotoId = ref<string>('')
const passportPhotoUploading = ref(false)

const photoFrontFile = ref<File | null>(null)
const photoFrontPreview = ref<string>('')
const photoFrontId = ref<string>('')
const photoFrontUploading = ref(false)

const photoBackFile = ref<File | null>(null)
const photoBackPreview = ref<string>('')
const photoBackId = ref<string>('')
const photoBackUploading = ref(false)

// Schema
const schema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  idType: z.string().min(1, 'ID type is required'),
})

const formContext = useForm({
  validationSchema: toTypedSchema(schema),
})
const { handleSubmit, setFieldValue, setFieldError, errors, validateField } = formContext

// Computed properties to check if each step is valid
const step1Fields = ['fullName', 'dateOfBirth']
const step2Fields = ['idType']

const canProceedStep1 = computed(() => {
  const hasErrors = step1Fields.some(field => errors.value[field as keyof typeof errors.value])
  console.log('Step 1 Errors Object:', errors.value)
  console.log('Step 1 Has Errors:', hasErrors)
  return !hasErrors
})

const canProceedStep2 = computed(() => {
  const hasErrors = step2Fields.some(field => errors.value[field as keyof typeof errors.value])
  console.log('Step 2 Has Errors:', hasErrors)
  return !hasErrors
})

// Validate step before proceeding
const validateStep = async (stepNumber: number) => {
  const fieldsToValidate = stepNumber === 1 ? step1Fields : step2Fields
  console.log(`Validating step ${stepNumber} fields:`, fieldsToValidate)
  
  for (const field of fieldsToValidate) {
    await validateField(field as 'fullName' | 'dateOfBirth' | 'idType')
  }
  
  console.log('Errors after validation:', errors.value)
}

// Prefill logic
onMounted(async () => {
    // Wait for the next tick to ensure hydration if needed, or immediate if props available
    if (props.verificationStatus?.status === 'REJECTED') {
      // Prefill form fields
      await setFieldValue('fullName', props.verificationStatus.full_name || '')
      await setFieldValue('dateOfBirth', props.verificationStatus.date_of_birth || '')
      await setFieldValue('idType', props.verificationStatus.id_type || '')
      
      // Prefill photos if available
      if (props.verificationStatus.passport_size_photo) {
        passportPhotoId.value = props.verificationStatus.passport_size_photo.id || ''
        passportPhotoPreview.value = props.verificationStatus.passport_size_photo.url || ''
      }
      if (props.verificationStatus.photo_front) {
        photoFrontId.value = props.verificationStatus.photo_front.id || ''
        photoFrontPreview.value = props.verificationStatus.photo_front.url || ''
      }
      if (props.verificationStatus.photo_back) {
        photoBackId.value = props.verificationStatus.photo_back.id || ''
        photoBackPreview.value = props.verificationStatus.photo_back.url || ''
      }
    }
})


const handlePhotoChange = async (event: Event, type: 'passport' | 'front' | 'back') => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    toast.error('Invalid file type. Allowed: JPEG, PNG, GIF, WebP')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.error('File size exceeds 5MB limit')
    return
  }

  // Set file and preview
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    if (type === 'passport') {
        passportPhotoFile.value = file
        passportPhotoPreview.value = result
        passportPhotoUploading.value = true
    } else if (type === 'front') {
        photoFrontFile.value = file
        photoFrontPreview.value = result
        photoFrontUploading.value = true
    } else if (type === 'back') {
        photoBackFile.value = file
        photoBackPreview.value = result
        photoBackUploading.value = true
    }
  }
  reader.readAsDataURL(file)
  
  // Upload
  try {
      const uploadedId = await uploadFile(file)
      if (uploadedId) {
          if (type === 'passport') passportPhotoId.value = uploadedId
          else if (type === 'front') photoFrontId.value = uploadedId
          else if (type === 'back') photoBackId.value = uploadedId
          toast.success('Photo uploaded')
      } else {
          toast.error('Failed to upload photo')
          handleDeletePhoto(type)
      }
  } catch (e) {
      toast.error('Error uploading photo')
      handleDeletePhoto(type)
  } finally {
      if (type === 'passport') passportPhotoUploading.value = false
      else if (type === 'front') photoFrontUploading.value = false
      else if (type === 'back') photoBackUploading.value = false
  }
}

const handleDeletePhoto = (type: 'passport' | 'front' | 'back') => {
    if (type === 'passport') {
        passportPhotoFile.value = null
        passportPhotoPreview.value = ''
        passportPhotoId.value = ''
    } else if (type === 'front') {
        photoFrontFile.value = null
        photoFrontPreview.value = ''
        photoFrontId.value = ''
    } else if (type === 'back') {
        photoBackFile.value = null
        photoBackPreview.value = ''
        photoBackId.value = ''
    }
}

const allPhotosUploaded = computed(() => {
    return !!passportPhotoId.value && !!photoFrontId.value && !!photoBackId.value
})

const isSubmitting = ref(false)

const onSubmit = handleSubmit(async (values) => {
    if (!allPhotosUploaded.value) {
        toast.error('Please upload all photos')
        return
    }
    
    isSubmitting.value = true
    try {
        const result = await authStore.submitClientVerification({
            full_name: values.fullName,
            date_of_birth: values.dateOfBirth,
            id_type: values.idType,
            passport_size_photo: passportPhotoId.value,
            photo_front: photoFrontId.value,
            photo_back: photoBackId.value,
        })
        
        if (result.success) {
            toast.success('Verification submitted successfully')
            emit('submitted')
        } else {
            toast.error('Failed to submit')
        }
    } catch (error: any) {
        // Use error handler to parse Django errors
        const generalErrors = handleFormErrors(
            error,
            formContext,
            (generalError) => {
                toast.error(generalError)
            }
        )
        
        // If no general errors, show generic message
        if (generalErrors.length === 0) {
            toast.error(error?.message || 'Failed to submit verification')
        }
    } finally {
        isSubmitting.value = false
    }
})

const nextStep = async () => {
  if (currentStep.value < 3) {
    // Validate current step fields
    await validateStep(currentStep.value)
    
    // Check if there are any errors
    const fieldsToCheck = currentStep.value === 1 ? step1Fields : step2Fields
    const hasErrors = fieldsToCheck.some(field => errors.value[field as keyof typeof errors.value])
    
    if (hasErrors) {
      console.log('Cannot proceed - validation errors present:', errors.value)
      toast.error('Please fix all errors before proceeding')
      return
    }
    
    console.log('No errors - proceeding to next step')
    currentStep.value++
  }
}

const prevStep = () => {
    if (currentStep.value > 1) currentStep.value--
}

// Computed for tab value
const activeTab = computed({
  get: () => `step-${currentStep.value}`,
  set: (val: string) => {
    const step = parseInt(val.replace('step-', ''))
    if (!isNaN(step)) currentStep.value = step
  }
})

</script>

<template>
  <Tabs v-model="activeTab" class="w-full">
    <TabsList class="grid w-full grid-cols-3 mb-8">
      <TabsTrigger
        v-for="step in steps"
        :key="step.id"
        :value="`step-${step.id}`"
        disabled
        class="cursor-default"
      >
        <span class="text-xs sm:text-sm">{{ step.label }}</span>
      </TabsTrigger>
    </TabsList>

    <!-- Step 1 -->
    <TabsContent value="step-1" forceMount :class="['space-y-6', activeTab !== 'step-1' && 'hidden']">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <p class="text-sm text-gray-600 mb-6">Enter your basic details</p>
      </div>

       <form @submit.prevent="nextStep" id="step1-form">
        <FormField v-slot="{ componentField }" name="fullName">
            <FormItem>
            <FormLabel class="text-gray-700 font-semibold">Full Name <span class="text-red-500">*</span></FormLabel>
            <FormControl>
                <Input v-bind="componentField" type="text" placeholder="Enter full name" />
            </FormControl>
            <FormMessage />
            </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="dateOfBirth">
            <FormItem class="mt-4">
            <FormLabel class="text-gray-700 font-semibold">Date of Birth <span class="text-red-500">*</span></FormLabel>
            <FormControl>
                <Input v-bind="componentField" type="date" />
            </FormControl>
            <FormMessage />
            </FormItem>
        </FormField>
      </form>
       <StepNavigation 
            :current-step="1" 
            :total-steps="3" 
            :can-next="true"
             @next="nextStep"
        />
    </TabsContent>

    <!-- Step 2 -->
    <TabsContent value="step-2" forceMount :class="['space-y-6', activeTab !== 'step-2' && 'hidden']">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">ID Type</h3>
        <p class="text-sm text-gray-600 mb-6">Select your identification type</p>
      </div>

       <FormField v-slot="{ componentField }" name="idType">
        <FormItem>
          <FormLabel class="text-gray-700 font-semibold">ID Type <span class="text-red-500">*</span></FormLabel>
          <FormControl>
            <select
              v-bind="componentField"
              class="w-full p-2 ring-1 ring-gray-300 rounded-md bg-white"
            >
              <option value="">Select ID type</option>
              <option value="CITIZENSHIP">Citizenship</option>
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

       <StepNavigation 
            :current-step="2" 
            :total-steps="3" 
            :can-next="true"
            @previous="prevStep"
             @next="nextStep"
        />
    </TabsContent>

    <!-- Step 3 -->
    <TabsContent value="step-3" forceMount :class="['space-y-6', activeTab !== 'step-3' && 'hidden']">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Upload Photos</h3>
        <p class="text-sm text-gray-600 mb-6">Upload clear photos of your documents</p>
      </div>
      
      <div class="space-y-6">
        <PhotoUpload 
            name="citizenshipPhoto" 
            label="Citizenship Size Photo" 
            :preview="passportPhotoPreview"
            :loading="passportPhotoUploading"
            required
            @change="(e) => handlePhotoChange(e, 'passport')"
            @remove="handleDeletePhoto('passport')"
        />

        <PhotoUpload 
            name="photoFront" 
            label="Citizenship Front" 
            :preview="photoFrontPreview"
            :loading="photoFrontUploading"
            required
            @change="(e) => handlePhotoChange(e, 'front')"
            @remove="handleDeletePhoto('front')"
        />

        <PhotoUpload 
            name="photoBack" 
            label="Citizenship Back" 
            :preview="photoBackPreview"
            :loading="photoBackUploading"
            required
            @change="(e) => handlePhotoChange(e, 'back')"
            @remove="handleDeletePhoto('back')"
        />
      </div>

       <StepNavigation 
            :current-step="3" 
            :total-steps="3" 
            :can-next="allPhotosUploaded"
            :is-submitting="isSubmitting"
            @previous="prevStep"
            @submit="onSubmit"
        />
    </TabsContent>
  </Tabs>
</template>
