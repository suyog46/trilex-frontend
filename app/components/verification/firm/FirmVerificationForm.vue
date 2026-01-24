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
  { id: 1, label: 'Firm Info' },
  { id: 2, label: 'Firm ID' },
  { id: 3, label: 'License' },
]

// Firm License State
const firmLicenseFile = ref<File | null>(null)
const firmLicensePreview = ref<string>('')
const firmLicenseId = ref<string>('')
const firmLicenseUploading = ref(false)

// Schema
const schema = z.object({
  firmName: z.string().min(1, 'Firm name is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  firmId: z.string().min(1, 'Firm ID is required'),
})

const formContext = useForm({
  validationSchema: toTypedSchema(schema),
})
const { handleSubmit, setFieldValue, setFieldError, errors, validateField } = formContext

// Computed properties to check if each step is valid
const step1Fields = ['firmName', 'ownerName']
const step2Fields = ['firmId']

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
    await validateField(field as 'firmName' | 'ownerName' | 'firmId')
  }
  
  console.log('Errors after validation:', errors.value)
}

// Prefill logic
onMounted(async () => {
  if (props.verificationStatus?.status === 'REJECTED') {
    // Prefill form fields
    await setFieldValue('firmName', props.verificationStatus.firm_name || '')
    await setFieldValue('ownerName', props.verificationStatus.owner_name || '')
    await setFieldValue('firmId', props.verificationStatus.firm_id || '')
    
    // Prefill firm license if available
    if (props.verificationStatus.firm_license) {
      firmLicenseId.value = props.verificationStatus.firm_license.id || ''
      firmLicensePreview.value = props.verificationStatus.firm_license.url || ''
    }
  }
})

const handleLicenseChange = async (event: Event) => {
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

  firmLicenseFile.value = file
  firmLicenseUploading.value = true

  const reader = new FileReader()
  reader.onload = (e) => {
    firmLicensePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)

  try {
    const uploadedId = await uploadFile(file)
    if (uploadedId) {
      firmLicenseId.value = uploadedId
      toast.success('License uploaded')
    } else {
      toast.error('Failed to upload license')
      handleDeleteLicense()
    }
  } catch (e) {
    toast.error('Error uploading license')
    handleDeleteLicense()
  } finally {
    firmLicenseUploading.value = false
  }
}

const handleDeleteLicense = () => {
  firmLicenseFile.value = null
  firmLicensePreview.value = ''
  firmLicenseId.value = ''
}

const licenseUploaded = computed(() => !!firmLicenseId.value)

const isSubmitting = ref(false)

const onSubmit = handleSubmit(async (values) => {
  if (!licenseUploaded.value) {
    toast.error('Please upload a firm license')
    return
  }

  isSubmitting.value = true
  try {
    const result = await authStore.submitFirmVerification({
      firm_name: values.firmName,
      owner_name: values.ownerName,
      firm_id: values.firmId,
      firm_license: firmLicenseId.value,
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

    <!-- Step 1: Firm Info -->
    <TabsContent value="step-1" forceMount :class="['space-y-6', activeTab !== 'step-1' && 'hidden']">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Firm Information</h3>
        <p class="text-sm text-gray-600 mb-6">Enter your firm's basic details</p>
      </div>

      <FormField v-slot="{ componentField }" name="firmName">
        <FormItem>
          <FormLabel class="text-gray-700 font-semibold">Firm Name <span class="text-red-500">*</span></FormLabel>
          <FormControl>
            <Input v-bind="componentField" type="text" placeholder="Enter firm name" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="ownerName">
        <FormItem class="mt-4">
          <FormLabel class="text-gray-700 font-semibold">Owner/Principal Name <span class="text-red-500">*</span></FormLabel>
          <FormControl>
            <Input v-bind="componentField" type="text" placeholder="Enter owner/principal name" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <StepNavigation
        :current-step="1"
        :total-steps="3"
        :can-next="true"
        @next="nextStep"
      />
    </TabsContent>

    <!-- Step 2: Firm ID -->
    <TabsContent value="step-2" forceMount :class="['space-y-6', activeTab !== 'step-2' && 'hidden']">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Firm Registration</h3>
        <p class="text-sm text-gray-600 mb-6">Enter your firm's registration details</p>
      </div>

      <FormField v-slot="{ componentField }" name="firmId">
        <FormItem>
          <FormLabel class="text-gray-700 font-semibold">Firm/Registration ID <span class="text-red-500">*</span></FormLabel>
          <FormControl>
            <Input v-bind="componentField" type="text" placeholder="Enter firm ID" />
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

    <!-- Step 3: License -->
    <TabsContent value="step-3" forceMount :class="['space-y-6', activeTab !== 'step-3' && 'hidden']">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Upload License</h3>
        <p class="text-sm text-gray-600 mb-6">Upload your firm's license or certificate</p>
      </div>

      <div class="space-y-6">
        <PhotoUpload
          name="firmLicense"
          label="License/Certificate"
          :preview="firmLicensePreview"
          :loading="firmLicenseUploading"
          required
          @change="handleLicenseChange"
          @remove="handleDeleteLicense"
        />
      </div>

      <StepNavigation
        :current-step="3"
        :total-steps="3"
        :can-next="licenseUploaded"
        :is-submitting="isSubmitting"
        @previous="prevStep"
        @submit="onSubmit"
      />
    </TabsContent>
  </Tabs>
</template>
