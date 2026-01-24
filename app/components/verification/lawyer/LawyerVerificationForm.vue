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
  { id: 2, label: 'Bar Info' },
  { id: 3, label: 'License Photo' },
]

// License Photo State
const licensePhotoFile = ref<File | null>(null)
const licensePhotoPreview = ref<string>('')
const licensePhotoId = ref<string>('')
const licensePhotoUploading = ref(false)

// Schema
const schema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  barId: z.string().min(1, 'Bar ID is required'),
  gender: z.string().min(1, 'Gender is required'),
})

const formContext = useForm({
  validationSchema: toTypedSchema(schema),
})
const { handleSubmit, setFieldValue, setFieldError, errors, validateField } = formContext

// Computed properties to check if each step is valid
const step1Fields = ['fullName', 'dateOfBirth', 'gender']
const step2Fields = ['barId']

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
    await validateField(field as keyof typeof schema.shape)
  }
  
  console.log('Errors after validation:', errors.value)
}

// Prefill logic
onMounted(async () => {
  if (props.verificationStatus?.status === 'REJECTED') {
  
    await setFieldValue('fullName', props.verificationStatus.full_name || '')
    await setFieldValue('dateOfBirth', props.verificationStatus.date_of_birth || '')
    await setFieldValue('barId', props.verificationStatus.bar_id || '')
    await setFieldValue('gender', props.verificationStatus.gender || '')
    
    // Prefill license photo if available
    if (props.verificationStatus.license_photo) {
      licensePhotoId.value = props.verificationStatus.license_photo.id || ''
      licensePhotoPreview.value = props.verificationStatus.license_photo.url || ''
    }
  }
})

const handlePhotoChange = async (event: Event) => {
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

  licensePhotoFile.value = file
  licensePhotoUploading.value = true

  const reader = new FileReader()
  reader.onload = (e) => {
    licensePhotoPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)

  try {
    const uploadedId = await uploadFile(file)
    if (uploadedId) {
      licensePhotoId.value = uploadedId
      toast.success('License photo uploaded')
    } else {
      toast.error('Failed to upload photo')
      handleDeletePhoto()
    }
  } catch (e) {
    toast.error('Error uploading photo')
    handleDeletePhoto()
  } finally {
    licensePhotoUploading.value = false
  }
}

const handleDeletePhoto = () => {
  licensePhotoFile.value = null
  licensePhotoPreview.value = ''
  licensePhotoId.value = ''
}

const photoUploaded = computed(() => !!licensePhotoId.value)

const isSubmitting = ref(false)

const onSubmit = handleSubmit(async (values) => {
  if (!photoUploaded.value) {
    toast.error('Please upload a license photo')
    return
  }

  isSubmitting.value = true
  try {
    const result = await authStore.submitLawyerVerification({
      full_name: values.fullName,
      date_of_birth: values.dateOfBirth,
      bar_id: values.barId,
      gender: values.gender,
      license_photo: licensePhotoId.value,
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

    console.log(generalErrors);
    
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

    <!-- Step 1: Personal Info -->
    <TabsContent value="step-1" forceMount :class="['space-y-6', activeTab !== 'step-1' && 'hidden']">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <p class="text-sm text-gray-600 mb-6">Enter your basic details</p>
      </div>

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

      <FormField v-slot="{ componentField }" name="gender">
        <FormItem class="mt-4">
          <FormLabel class="text-gray-700 font-semibold">Gender <span class="text-red-500">*</span></FormLabel>
          <FormControl>
            <select
              v-bind="componentField"
              class="w-full p-2 ring-1 ring-gray-300 rounded-md bg-white"
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <StepNavigation
        :current-step="1"
        :total-steps="3"
        :can-next="canProceedStep1"
        @next="nextStep"
      />
    </TabsContent>

    <!-- Step 2: Bar Info -->
    <TabsContent value="step-2" forceMount :class="['space-y-6', activeTab !== 'step-2' && 'hidden']">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Bar Information</h3>
        <p class="text-sm text-gray-600 mb-6">Enter your bar details</p>
      </div>

      <FormField v-slot="{ componentField }" name="barId">
        <FormItem>
          <FormLabel class="text-gray-700 font-semibold">Bar ID <span class="text-red-500">*</span></FormLabel>
          <FormControl>
            <Input v-bind="componentField" type="text" placeholder="Enter bar ID" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <StepNavigation
        :current-step="2"
        :total-steps="3"
        :can-next="canProceedStep2"
        @previous="prevStep"
        @next="nextStep"
      />
    </TabsContent>

    <!-- Step 3: License Photo -->
    <TabsContent value="step-3" forceMount :class="['space-y-6', activeTab !== 'step-3' && 'hidden']">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Upload License Photo</h3>
        <p class="text-sm text-gray-600 mb-6">Upload your bar license photo</p>
      </div>

      <div class="space-y-6">
        <PhotoUpload
          name="licensePhoto"
          label="License Photo"
          :preview="licensePhotoPreview"
          :loading="licensePhotoUploading"
          required
          @change="handlePhotoChange"
          @remove="handleDeletePhoto"
        />
      </div>

      <StepNavigation
        :current-step="3"
        :total-steps="3"
        :can-next="photoUploaded"
        :is-submitting="isSubmitting"
        @previous="prevStep"
        @submit="onSubmit"
      />
    </TabsContent>
  </Tabs>
</template>
