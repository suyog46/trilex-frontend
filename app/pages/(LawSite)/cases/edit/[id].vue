<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { Icon } from '@iconify/vue'
import StepTabs from '~/components/ui/tabs/StepTabs.vue'
import { TabsContent } from '~/components/ui/tabs'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Textarea } from "~/components/ui/textarea"
import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { createCaseSchema } from "~/lib/validations/case"
import { type Category, casesApi, type UpdateCaseInput, type CaseDetail } from "~/composables/api/cases.api"
import { toast } from 'vue-sonner'
import SelectClientDialog from '~/components/dialogs/SelectClientDialog.vue'
import type { RegisteredClient } from "~/composables/api/cases.api"

definePageMeta({
  layout: "lawyer",
})

const route = useRoute()
const caseId = route.params.id as string

const activeStep = ref("general")
const showClientDialog = ref(false)
const selectedClient = ref<RegisteredClient | null>(null)
const isLoadingCase = ref(true)
const isUpdating = ref(false)
const caseDetail = ref<CaseDetail | null>(null)

// Categories
const categories = ref<Category[]>([])
const loadingCategories = ref(false)

// Form setup
const { handleSubmit, values, setFieldValue, resetForm, errors, setValues } = useForm({
  validationSchema: toTypedSchema(createCaseSchema),
  initialValues: {
    title: "",
    case_category: "",
    court_type: "district" as "district" | "high" | "supreme",
    description: "",
    status: "draft" as "draft" | "registered" | "ongoing" | "completed",
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
  },
})

const steps = [
  { key: "general", label: "General Information" },
  { key: "client", label: "Client Details" },
  { key: "waris", label: "Waris Details" },
]

// Fetch case details
const fetchCaseDetail = async () => {
  isLoadingCase.value = true
  try {
    const data = await casesApi.getCaseDetail(caseId)
    caseDetail.value = data

    console.log('Fetched case detail:', data)
    
    // Pre-fill form with existing data
    resetForm({
      values: {
        title: data.title,
        case_category: data.case_category.id,
        court_type: data.court_type,
        description: data.description,
        status: data.status,
        client: data.client?.id,
        client_details: {
          full_name: data.client_details.full_name,
          address: data.client_details.address,
          email: data.client_details.email || "",
          phone: data.client_details.phone,
          date_of_birth: data.client_details.date_of_birth,
          citizenship_number: data.client_details.citizenship_number,
          gender: (data.client_details.gender || "male") as "male" | "female" | "other",
        },
        waris: data.waris ? {
          full_name: data.waris.full_name || "",
          email: data.waris.email || "",
          address: data.waris.address || "",
          phone: data.waris.phone || "",
          date_of_birth: data.waris.date_of_birth || "",
          citizenship_number: data.waris.citizenship_number || "",
          gender: (data.waris.gender || "male") as "male" | "female" | "other",
        } : {
          full_name: "",
          email: "",
          address: "",
          phone: "",
          date_of_birth: "",
          citizenship_number: "",
          gender: "male",
        },
      }
    })
    await nextTick()

    console.log('Form values after reset:', values)
    // Set selected client if exists
    if (data.client) {
      selectedClient.value = data.client as any
    }
  } catch (error) {
    console.error('Error fetching case detail:', error)
    toast.error('Failed to load case details')
  } finally {
    isLoadingCase.value = false
  }
}

// Fetch categories
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


const currentStepIndex = computed(() => {
  return steps.findIndex(step => step.key === activeStep.value)
})

const isFirstStep = computed(() => currentStepIndex.value === 0)
const isLastStep = computed(() => currentStepIndex.value === steps.length - 1)

const nextStep = () => {
  const nextStepData = steps[currentStepIndex.value + 1]
  if (!isLastStep.value && nextStepData) {
    activeStep.value = nextStepData.key
  }
}

const previousStep = () => {
  const prevStepData = steps[currentStepIndex.value - 1]
  if (!isFirstStep.value && prevStepData) {
    activeStep.value = prevStepData.key
  }
}

const handleClientSelect = (client: RegisteredClient) => {
  selectedClient.value = client
  setFieldValue('client', client.id)
  showClientDialog.value = false
  toast.success(`Linked to client: ${client.verification.full_name}`)
}

const removeClientLink = () => {
  selectedClient.value = null
  setFieldValue('client', undefined)
  toast.info('Client link removed')
}

const onSubmit = handleSubmit(async (formValues) => {
  console.log('Form submitted with values:', JSON.stringify(formValues, null, 2))
  console.log('Form errors:', JSON.stringify(errors.value, null, 2))
  
  isUpdating.value = true
  try {
    const payload: UpdateCaseInput = {
      title: formValues.title,
      case_category: formValues.case_category,
      court_type: formValues.court_type,
      description: formValues.description,
      status: formValues.status,
      client_details: formValues.client_details,
    }

    if (formValues.client) {
      payload.client = formValues.client
    }

    const hasWarisData = formValues.waris?.full_name || 
                        formValues.waris?.email || 
                        formValues.waris?.address || 
                        formValues.waris?.phone ||
                        formValues.waris?.date_of_birth ||
                        formValues.waris?.citizenship_number

    if (hasWarisData && formValues.waris) {
      payload.waris = {
        full_name: formValues.waris.full_name || "",
        email: formValues.waris.email || "",
        address: formValues.waris.address || "",
        phone: formValues.waris.phone || "",
        date_of_birth: formValues.waris.date_of_birth || "",
        citizenship_number: formValues.waris.citizenship_number || "",
        gender: formValues.waris.gender || "male",
      }
    }

    console.log('Update payload:', JSON.stringify(payload, null, 2))

    const response = await casesApi.updateCase(caseId, payload)
    
    toast.success("Case updated successfully!")
    
    navigateTo(`/cases/case-detail/${caseId}`)
  } catch (error: any) {
    console.error("Failed to update case:", error)
    toast.error(error?.data?.message || "Failed to update case. Please try again.")
  } finally {
    isUpdating.value = false
  }
}, ({ errors }) => {
  console.log('Validation errors:', JSON.stringify(errors, null, 2))
  
  const errorMessages = Object.entries(errors).map(([field, error]) => {
    const fieldName = field.split('.').pop() || field
    return `${fieldName}: ${Array.isArray(error) ? error.join(', ') : error}`
  })

  if (errorMessages.length > 0) {
    toast.error('Please fix the following errors:', {
      description: errorMessages.join('\n'),
      duration: 5000,
    })
  }
})

const goBack = () => {
  navigateTo(`/cases/case-detail/${caseId}`)
}

onMounted(() => {
  fetchCaseDetail()
  fetchCategories()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          @click="goBack"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Icon icon="mdi:arrow-left" class="w-6 h-6 text-gray-600" />
        </button>
        <h1 class="text-2xl font-bold text-primary-normal">
          Edit Case
        </h1>
      </div>
    </div>

    <div v-if="isLoadingCase" class="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <div class="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
      <div class="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
      <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
    </div>

    <div v-else class="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <form @submit.prevent="onSubmit">
        <StepTabs :steps="steps" v-model="activeStep">
          <TabsContent :value="'general'" :force-mount="true" v-show="activeStep === 'general'">
          <div class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">General Information</h2>
            
            <FormField v-slot="{ componentField }" name="title">
              <FormItem>
                <FormLabel>Case Title <span class="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input 
                    type="text" 
                    placeholder="Enter case title" 
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="case_category">
              <FormItem>
                <FormLabel>Case Category <span class="text-red-500">*</span></FormLabel>
                <FormControl>
                  <select
                    class="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-normal focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                    v-bind="componentField"
                    :disabled="loadingCategories"
                  >
                    <option value="" disabled>Select a category</option>
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
                <FormLabel>Court Type <span class="text-red-500">*</span></FormLabel>
                <FormControl>
                  <select
                    class="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-normal focus:border-transparent"
                    v-bind="componentField"
                  >
                    <option value="district">District Court</option>
                    <option value="high">High Court</option>
                    <option value="supreme">Supreme Court</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="status">
              <FormItem>
                <FormLabel>Status <span class="text-red-500">*</span></FormLabel>
                <FormControl>
                  <select
                    class="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-normal focus:border-transparent"
                    v-bind="componentField"
                  >
                    <option value="draft">Draft</option>
                    <option value="registered">Registered</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="description">
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter case description"
                    v-bind="componentField"
                    rows="5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <div class="flex justify-end">
              <Button type="button" @click="nextStep">
                Next Step
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent :value="'client'" :force-mount="true" v-show="activeStep === 'client'">
          <div class="space-y-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-900">Client Details</h2>
              <Button 
                type="button" 
                variant="outline"
                @click="showClientDialog = true"
              >
                <Icon icon="mdi:link-variant" class="w-4 h-4 mr-2" />
                {{ selectedClient ? 'Change Linked Client' : 'Link Registered Client' }}
              </Button>
            </div>

            <div v-if="selectedClient" class="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <img 
                    v-if="selectedClient.verification.passport_size_photo"
                    :src="selectedClient.verification.passport_size_photo.url" 
                    alt="Client photo"
                    class="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p class="font-medium text-gray-900">{{ selectedClient.verification.full_name }}</p>
                    <p class="text-sm text-gray-600">{{ selectedClient.user.email }}</p>
                  </div>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  @click="removeClientLink"
                >
                  <Icon icon="mdi:close" class="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField v-slot="{ componentField }" name="client_details.full_name">
                <FormItem>
                  <FormLabel>Full Name <span class="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter full name"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="client_details.email">
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter email"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="client_details.phone">
                <FormItem>
                  <FormLabel>Phone <span class="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter phone number"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="client_details.address">
                <FormItem>
                  <FormLabel>Address <span class="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter address"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="client_details.date_of_birth">
                <FormItem>
                  <FormLabel>Date of Birth <span class="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="client_details.citizenship_number">
                <FormItem>
                  <FormLabel>Citizenship Number <span class="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter citizenship number"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="client_details.gender">
                <FormItem>
                  <FormLabel>Gender <span class="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <select
                      class="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-normal focus:border-transparent"
                      v-bind="componentField"
                    >
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
              <Button type="button" variant="outline" @click="previousStep">
                Previous
              </Button>
              <Button type="button" @click="nextStep">
                Next Step
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent :value="'waris'" :force-mount="true" v-show="activeStep === 'waris'">
          <div class="space-y-6">
            <div class="mb-4">
              <h2 class="text-xl font-semibold text-gray-900">Waris Details</h2>
              <p class="text-sm text-gray-500 mt-1">Optional - Leave blank if not applicable</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField v-slot="{ componentField }" name="waris.full_name">
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter full name"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="waris.email">
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter email"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="waris.phone">
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter phone number"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="waris.address">
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter address"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="waris.date_of_birth">
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="waris.citizenship_number">
                <FormItem>
                  <FormLabel>Citizenship Number</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter citizenship number"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="waris.gender">
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <select
                      class="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-normal focus:border-transparent"
                      v-bind="componentField"
                    >
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
              <Button type="button" variant="outline" @click="previousStep" :disabled="isUpdating">
                Previous
              </Button>
              <Button 
              type="button" class="bg-primary-normal hover:bg-primary-dark text-white"
               @click="onSubmit" :disabled="isUpdating">
                <Icon v-if="isUpdating" icon="mdi:loading" class="w-4 h-4 mr-2 animate-spin" />
                {{ isUpdating ? 'Updating...' : 'Update Case' }}
              </Button>
            </div>
          </div>
        </TabsContent>
        </StepTabs>
      </form>
    </div>

    <SelectClientDialog
      :open="showClientDialog"
      @update:open="showClientDialog = $event"
      @select="handleClientSelect"
    />
  </div>
</template>
