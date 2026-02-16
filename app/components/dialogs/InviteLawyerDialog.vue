<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { lawyersApi, type Lawyer, type Province, type District } from '~/composables/api/lawyers.api'
import { addressApi, type Category } from '~/composables/api/address.api'
import { casesApi } from '~/composables/api/cases.api'
import { firmsApi } from '~/composables/api/firms.api'
import { toast } from 'vue-sonner'

interface Props {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'lawyer-invited': [lawyerId: string]
}>()

// State
const searchQuery = ref('')
const selectedLawyer = ref<Lawyer | null>(null)
const isSearching = ref(false)
const searchResults = ref<Lawyer[]>([])
const isInviting = ref(false)

// Filter states
const provinces = ref<Province[]>([])
const districts = ref<District[]>([])
const categories = ref<Category[]>([])
const selectedProvince = ref<number>(0)
const selectedDistrict = ref<number>(0)
const selectedServices = ref<string[]>([])

// Loading states
const isLoadingProvinces = ref(false)
const isLoadingDistricts = ref(false)
const isLoadingCategories = ref(false)

// Pagination
const currentPage = ref(1)
const pageSize = ref(5)
const totalCount = ref(0)

// Search debounce
let searchTimeout: NodeJS.Timeout

// Fetch provinces on mount
onMounted(async () => {
  await fetchProvinces()
  await fetchCategories()
})

const fetchProvinces = async () => {
  isLoadingProvinces.value = true
  try {
    const data = await addressApi.getProvinces()
    provinces.value = data
  } catch (error) {
    console.error("Failed to fetch provinces:", error)
    toast.error("Failed to load provinces")
  } finally {
    isLoadingProvinces.value = false
  }
}

const fetchDistricts = async (provinceId: number) => {
  if (provinceId === 0) {
    districts.value = []
    selectedDistrict.value = 0
    return
  }

  isLoadingDistricts.value = true
  try {
    const data = await addressApi.getDistricts(provinceId)
    districts.value = data
    selectedDistrict.value = 0
  } catch (error) {
    console.error("Failed to fetch districts:", error)
    toast.error("Failed to load districts")
  } finally {
    isLoadingDistricts.value = false
  }
}

const fetchCategories = async () => {
  isLoadingCategories.value = true
  try {
    const response = await casesApi.getCategories({ active: true, page: 1, page_size: 100 })
    categories.value = response.results || []
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    toast.error("Failed to load services")
  } finally {
    isLoadingCategories.value = false
  }
}

// Perform lawyer search
const performSearch = async () => {
  isSearching.value = true
  try {
    const result = await lawyersApi.getLawyers({
      search: searchQuery.value || undefined,
      province: selectedProvince.value || undefined,
      district: selectedDistrict.value || undefined,
      services: selectedServices.value.length > 0 ? selectedServices.value.join(',') : undefined,
      page: currentPage.value,
      page_size: pageSize.value,
      has_firm:false
    })
    
    searchResults.value = result.results || []
    totalCount.value = result.count || 0
  } catch (error) {
    console.error("Failed to search lawyers:", error)
    toast.error("Failed to search lawyers")
  } finally {
    isSearching.value = false
  }
}

// Handle search input with debounce
const handleSearchInput = (value: string) => {
  searchQuery.value = value
  currentPage.value = 1
  
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    performSearch()
  }, 500) // 500ms debounce
}

// Watch province changes
watch(() => selectedProvince.value, (newValue) => {
  if (newValue !== 0) {
    fetchDistricts(newValue)
  }
  currentPage.value = 1
  performSearch()
})

// Watch district changes
watch(() => selectedDistrict.value, () => {
  currentPage.value = 1
  performSearch()
})

// Watch service selection
watch(() => selectedServices.value, () => {
  currentPage.value = 1
  performSearch()
}, { deep: true })

// Toggle service selection
const toggleService = (serviceId: string) => {
  const index = selectedServices.value.indexOf(serviceId)
  if (index > -1) {
    selectedServices.value.splice(index, 1)
  } else {
    selectedServices.value.push(serviceId)
  }
}

// Handle lawyer selection
const handleSelectLawyer = (lawyer: Lawyer) => {
  selectedLawyer.value = lawyer
}

// Handle lawyer invitation
const handleInviteLawyer = async () => {
  if (!selectedLawyer.value?.id) return

  isInviting.value = true
  try {
    console.log("Inviting lawyer with ID:", selectedLawyer.value.id)
    await firmsApi.addMember(selectedLawyer.value.id)
    const lawyerName = selectedLawyer.value.verification?.full_name || 'Lawyer'
    toast.success(`${lawyerName} has been invited to your firm`)
    emit('lawyer-invited', selectedLawyer.value.id)
    handleClose()
  } catch (error: any) {
    const errorMsg = error?.data?.detail || error?.message || 'Failed to invite lawyer'
    toast.error(errorMsg)
    console.error('Error inviting lawyer:', error)
  } finally {
    isInviting.value = false
  }
}

// Handle close
const handleClose = () => {
  emit('update:open', false)
  selectedLawyer.value = null
  searchQuery.value = ''
  searchResults.value = []
  selectedProvince.value = 0
  selectedDistrict.value = 0
  selectedServices.value = []
}

// Handle pagination change
const handlePageChange = (page: number) => {
  currentPage.value = page
  performSearch()
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="handleClose"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200 p-6 flex items-center justify-between">
        <div class="text-center flex-1">
          <h2 class="text-2xl font-bold text-primary-normal">Invite the Lawyer</h2>
          <p class="text-sm text-gray-600 mt-1">Search and select lawyers to add to your firm</p>
        </div>
        <button 
          @click="handleClose"
          class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Icon icon="mdi:close" class="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-6 space-y-6">
          <!-- Search Box -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search Lawyer</label>
            <div class="relative">
              <Icon icon="mdi:magnify" class="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                :value="searchQuery"
                @input="(e) => handleSearchInput((e.target as HTMLInputElement).value)"
                placeholder="Search by name, email, or services..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal"
              />
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="text-sm font-medium text-gray-700">Filters</h3>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Province</label>
                <select
                  v-model.number="selectedProvince"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal"
                  :disabled="isLoadingProvinces"
                >
                  <option value="0">All Provinces</option>
                  <option v-for="province in provinces" :key="province.id" :value="province.id">
                    {{ province.title }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">District</label>
                <select
                  v-model.number="selectedDistrict"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal"
                  :disabled="isLoadingDistricts || selectedProvince === 0"
                >
                  <option value="0">All Districts</option>
                  <option v-for="district in districts" :key="district.id" :value="district.id">
                    {{ district.title }}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Services</label>
              <div class="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto">
                <label v-for="service in categories" :key="service.id" class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="selectedServices.includes(service.id)"
                    @change="toggleService(service.id)"
                    class="w-4 h-4 rounded border-gray-300 text-primary-normal focus:ring-primary-normal"
                  />
                  <span class="text-sm text-gray-700">{{ service.name }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-3 border-r border-gray-200 pr-6">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-medium text-gray-700">
                  Available Lawyers <span class="text-gray-600">({{ totalCount }})</span>
                </h3>
                <span v-if="isSearching" class="text-xs text-gray-500 flex items-center gap-1">
                  <Icon icon="mdi:loading" class="w-3 h-3 animate-spin" />
                  Searching...
                </span>
              </div>

              <div v-if="searchResults.length > 0" class="space-y-2 max-h-[500px] overflow-y-auto">
                <button
                  v-for="lawyer in searchResults"
                  :key="lawyer.id"
                  @click="handleSelectLawyer(lawyer)"
                  :class="[
                    'w-full flex items-center gap-3 p-3 border rounded-lg transition-colors text-left',
                    selectedLawyer?.id === lawyer.id
                      ? 'border-primary-normal bg-blue-50'
                      : 'border-gray-200 hover:border-primary-normal hover:bg-blue-50'
                  ]"
                >
                  <div class="flex-shrink-0">
                    <img
                      :src="lawyer.verification?.license_photo?.url"
                      :alt="lawyer.verification?.full_name"
                      class="w-10 h-10 rounded-full object-cover bg-gray-200"
                      @error="(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40'"
                    />
                  </div>

                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-gray-900 text-sm">{{ lawyer.verification?.full_name }}</p>
                    <p class="text-xs text-gray-600 truncate">{{ lawyer.user?.email }}</p>
                  </div>
                </button>
              </div>

              <div v-else-if="!isSearching && searchResults.length === 0" class="text-center py-8">
                <Icon icon="mdi:magnify" class="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p class="text-gray-500 text-sm">No lawyers found. Try adjusting your search filters.</p>
              </div>

              <div v-if="searchResults.length > 0" class="flex items-center justify-between pt-4 border-t border-gray-200">
                <span class="text-xs text-gray-600">
                  Page {{ currentPage }} of {{ Math.ceil(totalCount / pageSize) }}
                </span>
                <div class="flex gap-1">
                  <button
                    @click="handlePageChange(currentPage - 1)"
                    :disabled="currentPage <= 1 || isSearching"
                    class="px-2 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon icon="mdi:chevron-left" class="w-4 h-4" />
                  </button>
                  <button
                    @click="handlePageChange(currentPage + 1)"
                    :disabled="currentPage >= Math.ceil(totalCount / pageSize) || isSearching"
                    class="px-2 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon icon="mdi:chevron-right" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div class="space-y-4 pl-6">
              <h3 class="text-sm font-medium text-gray-700">Selected Lawyer</h3>
              
              <div v-if="selectedLawyer" class="bg-gray-50 rounded-lg p-4 space-y-4">
                <div class="flex flex-col items-center space-y-3">
                  <img
                    :src="selectedLawyer.verification?.license_photo?.url"
                    :alt="selectedLawyer.verification?.full_name"
                    class="w-20 h-20 rounded-full object-cover bg-gray-200"
                    @error="(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80'"
                  />
                  <div class="text-center">
                    <p class="font-semibold text-gray-900">{{ selectedLawyer.verification?.full_name }}</p>
                    <p class="text-sm text-gray-600">{{ selectedLawyer.user?.email }}</p>
                  </div>
                </div>

                <div class="space-y-3 text-sm">
                  <div v-if="selectedLawyer?.profile?.phone_number" class="flex items-start gap-3">
                    <Icon icon="mdi:phone" class="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p class="text-gray-600 font-medium">Phone</p>
                      <p class="text-gray-900">{{ selectedLawyer.profile?.phone_number }}</p>
                    </div>
                  </div>

                  <div v-if="selectedLawyer?.profile?.services && selectedLawyer.profile.services.length > 0">
                    <p class="text-gray-600 font-medium mb-2">Expertise</p>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="service in selectedLawyer.profile.services"
                        :key="service.id"
                        class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                      >
                        {{ service.name }}
                      </span>
                    </div>
                  </div>

                  <div v-if="selectedLawyer?.profile?.address" class="flex items-start gap-3">
                    <Icon icon="mdi:map-marker" class="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p class="text-gray-600 font-medium">Location</p>
                      <p class="text-gray-900">
                        {{ selectedLawyer.profile.address?.district?.title }}, {{ selectedLawyer.profile.address?.province?.title }}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  @click="handleInviteLawyer"
                  :disabled="isInviting"
                  class="w-full px-4 py-2 bg-primary-normal text-white rounded-lg hover:bg-primary-dark transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Icon v-if="isInviting" icon="mdi:loading" class="w-4 h-4 animate-spin" />
                  {{ isInviting ? 'Inviting...' : 'Invite to Firm' }}
                </button>
              </div>

              <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
                <Icon icon="mdi:account-search" class="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p class="text-gray-500">Select a lawyer from the list to view details</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
