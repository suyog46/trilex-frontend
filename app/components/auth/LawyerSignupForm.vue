<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { lawyerSignupSchema, lawFirmSignupSchema, type LawyerSignupInput as ValidationLawyerSignupInput } from "~/lib/validations/auth"
import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { useAuthStore } from "~/stores/auth"
import { useMediaUpload } from "~/composables/api/media.api"
import { toast } from 'vue-sonner'
import StepTabs from '~/components/ui/tabs/StepTabs.vue'
import { TabsContent } from '~/components/ui/tabs'
import { addressApi, type Province, type District, type Municipality, type Ward, type Category, casesApi } from '~/composables/api/address.api'
import type { LawyerSignupInput, LawFirmSignupInput } from "~/types/auth"

const props = defineProps<{
  mode: 'lawyer' | 'firm'
}>()

const activeStep = ref("step1")
const authStore = useAuthStore()
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const { uploadFile, isUploading: isUploadingMedia } = useMediaUpload()

const provinces = ref<Province[]>([])
const districts = ref<District[]>([])
const municipalities = ref<Municipality[]>([])
const wards = ref<Ward[]>([])
const categories = ref<Category[]>([])

const loadingProvinces = ref(false)
const loadingDistricts = ref(false)
const loadingMunicipalities = ref(false)
const loadingWards = ref(false)
const loadingCategories = ref(false)

// License photo upload state
const licensePhotoFile = ref<File | null>(null)
const licensePhotoPreview = ref<string>("")
const licensePhotoId = ref<string>("")

// Firm license photo upload state
const firmLicenseFile = ref<File | null>(null)
const firmLicensePreview = ref<string>("")
const firmLicenseId = ref<string>("")

// Schema based on mode
const validationSchema = computed(() => {
  return toTypedSchema(props.mode === 'lawyer' ? lawyerSignupSchema : lawFirmSignupSchema)
})

const { handleSubmit, values, setFieldValue } = useForm({
  validationSchema: validationSchema,
  initialValues: {
    email: "",
    password: "",
    confirmPassword: "",
    province: 0,
    district: 0,
    municipality: 0,
    ward: 0,
    services: [],
    // Lawyer specific fields
    fullName: "",
    dateOfBirth: "",
    barId: "",
    gender: "",
    licensePhoto: "",
    // Firm specific fields
    firmName: "",
    ownerName: "",
    firmId: "",
    firmLicense: "",
  },
})

// Fetch provinces on component mount
onMounted(async () => {
  await fetchProvinces()
  await fetchCategories()
})

const fetchProvinces = async () => {
  loadingProvinces.value = true
  try {
    const data = await addressApi.getProvinces()
    provinces.value = data
  } catch (error) {
    console.error("Failed to fetch provinces:", error)
    toast.error("Failed to load provinces")
  } finally {
    loadingProvinces.value = false
  }
}

// Fetch districts when province changes
const fetchDistricts = async (provinceId: number) => {
  if (provinceId === 0) {
    districts.value = []
    municipalities.value = []
    await setFieldValue("district", 0)
    await setFieldValue("municipality", 0)
    return
  }

  loadingDistricts.value = true
  try {
    const data = await addressApi.getDistricts(provinceId)
    districts.value = data
    municipalities.value = []
    await setFieldValue("district", 0)
    await setFieldValue("municipality", 0)
  } catch (error) {
    console.error("Failed to fetch districts:", error)
    toast.error("Failed to load districts")
  } finally {
    loadingDistricts.value = false
  }
}

// Fetch municipalities when district changes
const fetchMunicipalities = async (districtId: number) => {
  if (districtId === 0) {
    municipalities.value = []
    wards.value = []
    await setFieldValue("municipality", 0)
    await setFieldValue("ward", 0)
    return
  }

  loadingMunicipalities.value = true
  try {
    const data = await addressApi.getMunicipalities(districtId)
    municipalities.value = data
    wards.value = []
    await setFieldValue("municipality", 0)
    await setFieldValue("ward", 0)
  } catch (error) {
    console.error("Failed to fetch municipalities:", error)
    toast.error("Failed to load municipalities")
  } finally {
    loadingMunicipalities.value = false
  }
}

// Fetch wards when municipality changes
const fetchWards = async (municipalityId: number) => {
  if (municipalityId === 0) {
    wards.value = []
    await setFieldValue("ward", 0)
    return
  }

  loadingWards.value = true
  try {
    const data = await addressApi.getWards(municipalityId)
    wards.value = data
    await setFieldValue("ward", 0)
  } catch (error) {
    console.error("Failed to fetch wards:", error)
    toast.error("Failed to load wards")
  } finally {
    loadingWards.value = false
  }
}

// Fetch categories/services
const fetchCategories = async () => {
  loadingCategories.value = true
  try {
    const response = await casesApi.getCategories({ active: true, page: 1, page_size: 100 })
    categories.value = response.results || []
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    toast.error("Failed to load services")
  } finally {
    loadingCategories.value = false
  }
}

// Watch province changes
watch(() => values.province, (newValue) => {
  if (newValue !== undefined && newValue !== null && newValue !== 0) {
    fetchDistricts(newValue)
  }
})

// Watch district changes
watch(() => values.district, (newValue) => {
  if (newValue !== undefined && newValue !== null && newValue !== 0) {
    fetchMunicipalities(newValue)
  }
})

// Watch municipality changes
watch(() => values.municipality, (newValue) => {
  if (newValue !== undefined && newValue !== null && newValue !== 0) {
    fetchWards(newValue)
  }
})

// Handle service selection
const toggleService = (serviceId: string) => {
  const currentServices = values.services || []
  const updatedServices = currentServices.includes(serviceId)
    ? currentServices.filter(id => id !== serviceId)
    : [...currentServices, serviceId]
  setFieldValue("services", updatedServices)
}

// Handle license photo upload
const handleLicensePhotoChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    toast.error('Invalid file type. Allowed: JPEG, PNG, GIF, WebP')
    return
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    toast.error('File size exceeds 5MB limit')
    return
  }

  licensePhotoFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    licensePhotoPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)

  // Upload file immediately
  const uploadedId = await uploadFile(file)
  if (uploadedId) {
    licensePhotoId.value = uploadedId
    await setFieldValue("licensePhoto", uploadedId)
    toast.success('License photo uploaded successfully')
  } else {
    toast.error('Failed to upload license photo')
    licensePhotoFile.value = null
    licensePhotoPreview.value = ""
  }
}

// Handle firm license upload
const handleFirmLicenseChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    toast.error('Invalid file type. Allowed: JPEG, PNG, GIF, WebP')
    return
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    toast.error('File size exceeds 5MB limit')
    return
  }

  firmLicenseFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    firmLicensePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)

  // Upload file immediately
  const uploadedId = await uploadFile(file)
  if (uploadedId) {
    firmLicenseId.value = uploadedId
    await setFieldValue("firmLicense", uploadedId)
    toast.success('Firm license uploaded successfully')
  } else {
    toast.error('Failed to upload firm license')
    firmLicenseFile.value = null
    firmLicensePreview.value = ""
  }
}

// Handle form submission
const onSubmit = handleSubmit(async (formValues: any) => {
  try {
    // Validate license photo is uploaded (for lawyer mode)
    if (props.mode === 'lawyer' && !licensePhotoId.value) {
      toast.error('Please upload a license photo')
      activeStep.value = "step3"
      return
    }

    // Validate firm license is uploaded (for firm mode)
    if (props.mode === 'firm' && !firmLicenseId.value) {
      toast.error('Please upload a firm license')
      activeStep.value = "step3"
      return
    }

    let payload: LawyerSignupInput | LawFirmSignupInput

    if (props.mode === 'lawyer') {
      payload = {
        email: formValues.email,
        password: formValues.password,
        client_type: "web",
        services: formValues.services,
        address: {
          province: Number(formValues.province),
          district: Number(formValues.district),
          municipality: Number(formValues.municipality),
          ward: Number(formValues.ward),
        },
        verification: {
          full_name: formValues.fullName,
          date_of_birth: formValues.dateOfBirth,
          bar_id: formValues.barId,
          gender: formValues.gender,
          license_photo: licensePhotoId.value,
        },
      } as LawyerSignupInput
    } else {
      payload = {
        email: formValues.email,
        password: formValues.password,
        client_type: "web",
        services: formValues.services,
        address: {
          province: Number(formValues.province),
          district: Number(formValues.district),
          municipality: Number(formValues.municipality),
          ward: Number(formValues.ward),
        },
        verification: {
          firm_name: formValues.firmName,
          owner_name: formValues.ownerName,
          firm_id: formValues.firmId,
          firm_license: firmLicenseId.value,
        },
      } as LawFirmSignupInput
    }

    const result = props.mode === 'lawyer'
      ? await authStore.registerLawyerSignup(payload as LawyerSignupInput)
      : await authStore.registerLawFirmSignup(payload as LawFirmSignupInput)

    if (result.success) {
      toast.success('Registration successful! Check your email to verify your account.')
      setTimeout(() => {
        navigateTo({
          path: '/check-your-email',
          query: { email: formValues.email, role: props.mode === 'lawyer' ? 'lawyer' : 'firm' }
        })
      }, 500)
    } else {
      toast.error(authStore.error?.message || 'Registration failed')
    }
  } catch (error: any) {
    toast.error( 'An error occurred during registration')
    console.error('Registration error:', error)
  }
})

// Toggle password visibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

// Navigate to next step
const goToNextStep = async () => {
  // Validate current step before proceeding
  const stepFields = activeStep.value === "step1" 
    ? ["email", "password", "confirmPassword"]
    : activeStep.value === "step2"
    ? ["province", "district", "municipality", "ward"]
    : []

  // Basic validation - check if fields have values
  const hasErrors = stepFields.some(field => {
    const value = (values as Record<string, any>)[field]
    return !value || value === 0 || value === ""
  })
  
  if (hasErrors) {
    toast.error("Please fill all required fields")
    return
  }

  if (activeStep.value === "step1") {
    activeStep.value = "step2"
  } else if (activeStep.value === "step2") {
    activeStep.value = "step3"
  }
}

// Navigate to previous step
const goToPreviousStep = () => {
  if (activeStep.value === "step2") {
    activeStep.value = "step1"
  } else if (activeStep.value === "step3") {
    activeStep.value = "step2"
  }
}

const isLoading = computed(() => authStore.isLoading || isUploadingMedia.value)

const steps = [
  { key: "step1", label: "Account" },
  { key: "step2", label: "Address" },
  { key: "step3", label: props.mode === 'lawyer' ? "Lawyer Info" : "Firm Info" },
]

const title = computed(() => props.mode === "lawyer" ? "Lawyer Registration" : "Law Firm Registration")
</script>

<template>
  <div class="w-2/5 flex flex-col gap-y-8 justify-start">
    <h1 class="text-primary-normal font-bold text-center mobile:text-left text-[30px] mobile:text-[35px] lg:text-[38px] mb-3">
      {{ title }}
    </h1>

    <form @submit="onSubmit" class="space-y-4">
      <StepTabs
        v-model="activeStep"
        :steps="steps"
        width="full"
      >
        <!-- STEP 1: Account -->
        <TabsContent value="step1" class="space-y-5" force-mount v-show="activeStep === 'step1'">
          <!-- Email Field -->
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel class="text-lg text-gray-700 font-semibold">
                Email Address <span class="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="email"
                  placeholder="Enter your email"
                  :disabled="isLoading"
                  class="w-full p-2 ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Password Field -->
          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel class="text-lg text-gray-700 font-semibold">
                Password <span class="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div class="relative">
                  <Input
                    v-bind="componentField"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Enter your password"
                    :disabled="isLoading"
                    class="w-full p-2 ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal pr-12"
                  />
                  <button
                    type="button"
                    @click="togglePasswordVisibility"
                    class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600"
                  >
                    <Icon v-if="showPassword" icon="mdi:eye" class="w-5 h-5" />
                    <Icon v-else icon="mdi:eye-off" class="w-5 h-5" />
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Confirm Password Field -->
          <FormField v-slot="{ componentField }" name="confirmPassword">
            <FormItem>
              <FormLabel class="text-lg text-gray-700 font-semibold">
                Confirm Password <span class="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div class="relative">
                  <Input
                    v-bind="componentField"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="Confirm your password"
                    :disabled="isLoading"
                    class="w-full p-2 ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal pr-12"
                  />
                  <button
                    type="button"
                    @click="toggleConfirmPasswordVisibility"
                    class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600"
                  >
                    <Icon v-if="showConfirmPassword" icon="mdi:eye" class="w-5 h-5" />
                    <Icon v-else icon="mdi:eye-off" class="w-5 h-5" />
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Next Button -->
          <div class="w-full pt-5">
            <Button
              type="button"
              @click="goToNextStep"
              class="w-full px-4 py-6 font-semibold text-white text-lg bg-primary-normal hover:bg-primary-normal/90 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Next Step
            </Button>
          </div>
        </TabsContent>

        <!-- STEP 2: Address -->
        <TabsContent value="step2" class="space-y-5" force-mount v-show="activeStep === 'step2'">
          <!-- Province Dropdown -->
          <FormField v-slot="{ componentField }" name="province">
            <FormItem>
              <FormLabel class="text-lg text-gray-700 font-semibold">
                Province <span class="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  v-bind="componentField"
                  :disabled="isLoading || loadingProvinces"
                  class="w-full p-2  ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal bg-white"
                >
                  <option value="0">Select a province</option>
                  <option v-for="province in provinces" :key="province.id" :value="province.id">
                    {{ province.title }} ({{ province.title_nepali }})
                  </option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- District Dropdown -->
          <FormField v-slot="{ componentField }" name="district">
            <FormItem>
              <FormLabel class="text-lg text-gray-700 font-semibold">
                District <span class="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  v-bind="componentField"
                  :disabled="isLoading || loadingDistricts || values.province === 0"
                  class="w-full p-2 ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="0">Select a district</option>
                  <option v-for="district in districts" :key="district.id" :value="district.id">
                    {{ district.title }} ({{ district.title_nepali }})
                  </option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Municipality Dropdown -->
          <FormField v-slot="{ componentField }" name="municipality">
            <FormItem>
              <FormLabel class="text-lg text-gray-700 font-semibold">
                Municipality <span class="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  v-bind="componentField"
                  :disabled="isLoading || loadingMunicipalities || values.district === 0"
                  class="w-full p-2 ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="0">Select a municipality</option>
                  <option v-for="municipality in municipalities" :key="municipality.id" :value="municipality.id">
                    {{ municipality.title }} ({{ municipality.title_nepali }})
                  </option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Ward Number Field -->
          <FormField v-slot="{ componentField }" name="ward">
            <FormItem>
              <FormLabel class="text-lg text-gray-700 font-semibold">
                Ward Number <span class="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  v-bind="componentField"
                  :disabled="isLoading || loadingWards || values.municipality === 0"
                  class="w-full p-2 ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="0">Select a ward</option>
                  <option v-for="ward in wards" :key="ward.id" :value="ward.id">
                    Ward {{ ward.number }} ({{ ward.number_nepali }})
                  </option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Navigation Buttons -->
          <div class="w-full pt-5 flex gap-4">
            <Button
              type="button"
              @click="goToPreviousStep"
              class="w-1/3 px-4 py-6 font-semibold text-gray-700 text-lg bg-gray-200 hover:bg-gray-300 rounded-md cursor-pointer flex items-center justify-center gap-2"
            >
              Previous
            </Button>
            <Button
              type="button"
              @click="goToNextStep"
              class="w-2/3 px-4 py-6 font-semibold text-white text-lg bg-primary-normal hover:bg-primary-normal/90 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Next Step
            </Button>
          </div>
        </TabsContent>

        <!-- STEP 3: Lawyer or Firm Information -->
        <TabsContent value="step3" class="space-y-5" force-mount v-show="activeStep === 'step3'">
          <!-- Services Selection -->
          <FormField name="services">
            <FormItem>
              <FormLabel class="text-lg text-gray-700 font-semibold">
                Services <span class="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div class="space-y-2 border border-gray-200 rounded-md p-4 max-h-48 overflow-y-auto">
                  <div v-if="loadingCategories" class="text-center text-gray-500 py-4">
                    Loading services...
                  </div>
                  <div v-else-if="categories.length === 0" class="text-center text-gray-500 py-4">
                    No services available
                  </div>
                  <label
                    v-for="category in categories"
                    :key="category.id"
                    class="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      :checked="(values.services || []).includes(category.id)"
                      @change="() => toggleService(category.id)"
                      class="w-4 h-4 cursor-pointer"
                    />
                    <span class="text-base text-gray-700">{{ category.name }}</span>
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- LAWYER MODE FIELDS -->
          <template v-if="mode === 'lawyer'">
            <!-- Full Name Field -->
            <FormField v-slot="{ componentField }" name="fullName">
              <FormItem>
                <FormLabel class="text-lg text-gray-700 font-semibold">
                  Full Name <span class="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="text"
                    placeholder="Enter your full name"
                    :disabled="isLoading"
                    class="w-full p-2 ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Date of Birth Field -->
            <FormField v-slot="{ componentField }" name="dateOfBirth">
              <FormItem>
                <FormLabel class="text-lg text-gray-700 font-semibold">
                  Date of Birth <span class="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="date"
                    :disabled="isLoading"
                    class="w-full p-2 ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Bar ID Field -->
            <FormField v-slot="{ componentField }" name="barId">
              <FormItem>
                <FormLabel class="text-lg text-gray-700 font-semibold">
                  Bar ID <span class="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="text"
                    placeholder="Enter your bar ID"
                    :disabled="isLoading"
                    class="w-full p-2 ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Gender Field -->
            <FormField v-slot="{ componentField }" name="gender">
              <FormItem>
                <FormLabel class="text-lg text-gray-700 font-semibold">
                  Gender <span class="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <select
                    v-bind="componentField"
                    :disabled="isLoading"
                    class="w-full p-2 ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal bg-white"
                  >
                    <option value="">Select your gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- License Photo Upload -->
            <FormField name="licensePhoto">
              <FormItem>
                <FormLabel class="text-lg text-gray-700 font-semibold">
                  License Photo <span class="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div class="space-y-4">
                    <div class="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-primary-normal transition">
                      <input
                        type="file"
                        accept="image/*"
                        @change="handleLicensePhotoChange"
                        :disabled="isLoading"
                        class="hidden"
                        id="license-photo-input"
                      />
                      <label for="license-photo-input" class="cursor-pointer block">
                        <div v-if="!licensePhotoPreview" class="space-y-2">
                          <Icon icon="mdi:cloud-upload-outline" class="w-10 h-10 mx-auto text-gray-400" />
                          <p class="text-gray-600 font-medium">Click to upload or drag & drop</p>
                          <p class="text-sm text-gray-500">PNG, JPG, GIF, WebP up to 5MB</p>
                        </div>
                        <div v-else class="space-y-2">
                          <img :src="licensePhotoPreview" alt="Preview" class="w-full h-[200px] object-cover mx-auto rounded" />
                          <p class="text-sm text-green-600 font-medium">✓ Photo uploaded</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </template>

          <!-- FIRM MODE FIELDS -->
          <template v-else>
            <!-- Firm Name Field -->
            <FormField v-slot="{ componentField }" name="firmName">
              <FormItem>
                <FormLabel class="text-lg text-gray-700 font-semibold">
                  Firm Name <span class="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="text"
                    placeholder="Enter firm name"
                    :disabled="isLoading"
                    class="w-full p-2 ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Owner Name Field -->
            <FormField v-slot="{ componentField }" name="ownerName">
              <FormItem>
                <FormLabel class="text-lg text-gray-700 font-semibold">
                  Owner/Principal Name <span class="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="text"
                    placeholder="Enter owner/principal name"
                    :disabled="isLoading"
                    class="w-full p-2 ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Firm ID Field -->
            <FormField v-slot="{ componentField }" name="firmId">
              <FormItem>
                <FormLabel class="text-lg text-gray-700 font-semibold">
                  Firm/Registration ID <span class="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="text"
                    placeholder="Enter firm ID"
                    :disabled="isLoading"
                    class="w-full p-2 ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Firm License Field -->
            <FormField name="firmLicense">
              <FormItem>
                <FormLabel class="text-lg text-gray-700 font-semibold">
                  License/Certificate Image <span class="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div class="space-y-4">
                    <div class="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-primary-normal transition">
                      <input
                        type="file"
                        accept="image/*"
                        @change="handleFirmLicenseChange"
                        :disabled="isLoading"
                        class="hidden"
                        id="firm-license-input"
                      />
                      <label for="firm-license-input" class="cursor-pointer block">
                        <div v-if="!firmLicensePreview" class="space-y-2">
                          <Icon icon="mdi:cloud-upload-outline" class="w-10 h-10 mx-auto text-gray-400" />
                          <p class="text-gray-600 font-medium">Click to upload or drag & drop</p>
                          <p class="text-sm text-gray-500">PNG, JPG, GIF, WebP up to 5MB</p>
                        </div>
                        <div v-else class="space-y-2">
                          <img :src="firmLicensePreview" alt="Preview" class="w-full h-[200px] object-cover mx-auto rounded" />
                          <p class="text-sm text-green-600 font-medium">✓ License uploaded</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </template>

          <!-- Navigation Buttons -->
          <div class="w-full pt-5 flex gap-4">
            <Button
              type="button"
              @click="goToPreviousStep"
              class="w-1/3 px-4 py-6 font-semibold text-gray-700 text-lg bg-gray-200 hover:bg-gray-300 rounded-md cursor-pointer flex items-center justify-center gap-2"
            >
              Previous
            </Button>
            <Button
              type="submit"
              :disabled="isLoading"
              class="w-2/3 px-4 py-6 font-semibold text-white text-lg bg-primary-normal hover:bg-primary-normal/90 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon v-if="isLoading" icon="mdi:loading" class="w-5 h-5 animate-spin" />
              {{ isLoading ? "Registering..." : "Complete Registration" }}
            </Button>
          </div>
        </TabsContent>
      </StepTabs>
    </form>
  </div>
</template>
