<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { lawyersApi, type Lawyer } from '~/composables/api/lawyers.api'
import { addressApi, type Province, type District } from '~/composables/api/address.api'
import { casesApi, type Category } from '~/composables/api/cases.api'
import LawyerCard from '~/components/cards/LawyerCard.vue'
import LawyerCardSkeleton from '~/components/cards/LawyerCardSkeleton.vue'
import { Button } from '~/components/ui/button'
import { toast } from 'vue-sonner'

definePageMeta({
  middleware: ['auth', 'client'],
})

const lawyers = ref<Lawyer[]>([])
const isLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(12)
const totalCount = ref(0)
const hasNext = ref(false)
const hasPrevious = ref(false)

// Filter states
const searchQuery = ref('')
const selectedProvince = ref<number | null>(null)
const selectedDistrict = ref<number | null>(null)
const selectedService = ref<string | null>(null)

// Filter options
const provinces = ref<Province[]>([])
const districts = ref<District[]>([])
const services = ref<Category[]>([])

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

const fetchLawyers = async () => {
  isLoading.value = true
  try {
    const response = await lawyersApi.getLawyers({
      page: currentPage.value,
      page_size: pageSize.value,
      search: searchQuery.value || undefined,
      province: selectedProvince.value || undefined,
      district: selectedDistrict.value || undefined,
      services: selectedService.value || undefined,
    })
    
    lawyers.value = response.results || []
    totalCount.value = response.count || 0
    hasNext.value = !!response.next
    hasPrevious.value = !!response.previous
  } catch (error: any) {
    console.error('Error fetching lawyers:', error)
    toast.error('Failed to load lawyers')
  } finally {
    isLoading.value = false
  }
}

const fetchProvinces = async () => {
  try {
    provinces.value = await addressApi.getProvinces()
  } catch (error) {
    console.error('Error fetching provinces:', error)
  }
}

const fetchDistricts = async (provinceId: number) => {
  try {
    districts.value = await addressApi.getDistricts(provinceId)
  } catch (error) {
    console.error('Error fetching districts:', error)
  }
}

const fetchServices = async () => {
  try {
    const response = await casesApi.getCategories({ active: true })
    services.value = response.results || []
  } catch (error) {
    console.error('Error fetching services:', error)
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextPage = () => {
  if (hasNext.value) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const prevPage = () => {
  if (hasPrevious.value) {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedProvince.value = null
  selectedDistrict.value = null
  selectedService.value = null
  districts.value = []
  currentPage.value = 1
}

// Watch for filter changes
watch([searchQuery, selectedProvince, selectedDistrict, selectedService], () => {
  currentPage.value = 1
  fetchLawyers()
})

watch(selectedProvince, (newVal) => {
  selectedDistrict.value = null
  districts.value = []
  if (newVal) {
    fetchDistricts(newVal)
  }
})

watch(currentPage, () => {
  fetchLawyers()
})

onMounted(() => {
  fetchLawyers()
  fetchProvinces()
  fetchServices()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-20 px-7">
    <div class="w-full mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Find Lawyers</h1>
        <p class="text-gray-600">Browse verified lawyers and find the right one for your legal needs</p>
      </div>

      <div class="flex gap-6">
        <!-- Sidebar Filters -->
        <aside class="w-64 flex-shrink-0 hidden lg:block">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                @click="resetFilters"
                class="text-sm text-primary-normal hover:text-primary-dark"
              >
                Reset
              </button>
            </div>

            <!-- Search -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div class="relative">
                <Icon
                  icon="mdi:magnify"
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search lawyers..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal"
                />
              </div>
            </div>

            <!-- Province Filter -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Province
              </label>
              <select
                v-model="selectedProvince"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal focus:border-transparent bg-white cursor-pointer hover:border-gray-400 transition-colors"
              >
                <option :value="null">All Provinces</option>
                <option
                  v-for="province in provinces"
                  :key="province.id"
                  :value="province.id"
                >
                  {{ province.title }}
                </option>
              </select>
            </div>

            <!-- District Filter -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <select
                v-model="selectedDistrict"
                :disabled="!selectedProvince"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal focus:border-transparent bg-white cursor-pointer hover:border-gray-400 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed disabled:hover:border-gray-300"
              >
                <option :value="null">All Districts</option>
                <option
                  v-for="district in districts"
                  :key="district.id"
                  :value="district.id"
                >
                  {{ district.title }}
                </option>
              </select>
            </div>

            <!-- Service Filter -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Service Category
              </label>
              <select
                v-model="selectedService"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal focus:border-transparent bg-white cursor-pointer hover:border-gray-400 transition-colors"
              >
                <option :value="null">All Services</option>
                <option
                  v-for="service in services"
                  :key="service.id"
                  :value="service.id"
                >
                  {{ service.name }}
                </option>
              </select>
            </div>

            <!-- Active Filters -->
            <div v-if="searchQuery || selectedProvince || selectedDistrict || selectedService" class="pt-4 border-t border-gray-200">
              <p class="text-sm font-medium text-gray-700 mb-2">Active Filters:</p>
              <div class="space-y-2">
                <div v-if="searchQuery" class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Search: {{ searchQuery }}</span>
                  <button @click="searchQuery = ''" class="text-red-500 hover:text-red-700">
                    <Icon icon="mdi:close" class="w-4 h-4" />
                  </button>
                </div>
                <div v-if="selectedProvince" class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Province selected</span>
                  <button @click="selectedProvince = null" class="text-red-500 hover:text-red-700">
                    <Icon icon="mdi:close" class="w-4 h-4" />
                  </button>
                </div>
                <div v-if="selectedDistrict" class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">District selected</span>
                  <button @click="selectedDistrict = null" class="text-red-500 hover:text-red-700">
                    <Icon icon="mdi:close" class="w-4 h-4" />
                  </button>
                </div>
                <div v-if="selectedService" class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Service selected</span>
                  <button @click="selectedService = null" class="text-red-500 hover:text-red-700">
                    <Icon icon="mdi:close" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="flex-1">
          <!-- Results Header -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-600">
                <span class="font-semibold text-gray-900">{{ totalCount }}</span> lawyers found
              </p>
              <div class="flex items-center gap-2">
                <label class="text-sm text-gray-600">Per page:</label>
                <select
                  v-model="pageSize"
                  @change="currentPage = 1; fetchLawyers()"
                  class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-normal focus:border-transparent bg-white cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <option :value="12">12</option>
                  <option :value="24">24</option>
                  <option :value="36">36</option>
                  <option :value="48">48</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
            <LawyerCardSkeleton v-for="n in pageSize" :key="n" />
          </div>

          <!-- Empty State -->
          <div v-else-if="lawyers.length === 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Icon icon="mdi:account-search" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-xl font-semibold text-gray-700 mb-2">No Lawyers Found</h3>
            <p class="text-gray-500 mb-4">Try adjusting your filters or search criteria</p>
            <Button @click="resetFilters" variant="outline">
              Reset Filters
            </Button>
          </div>

          <!-- Lawyers Grid -->
          <div v-else>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
              <LawyerCard 
                v-for="lawyer in lawyers" 
                :key="lawyer.id" 
                :lawyer="lawyer" 
              />
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                <!-- Page Info -->
                <div class="text-sm text-gray-600">
                  Page <span class="font-semibold text-gray-900">{{ currentPage }}</span> of 
                  <span class="font-semibold text-gray-900">{{ totalPages }}</span>
                </div>

                <!-- Page Numbers -->
                <div class="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    :disabled="!hasPrevious"
                    @click="prevPage"
                  >
                    <Icon icon="mdi:chevron-left" class="w-5 h-5" />
                  </Button>

                  <div class="flex items-center gap-1">
                    <template v-if="totalPages <= 7">
                      <button
                        v-for="page in totalPages"
                        :key="page"
                        @click="goToPage(page)"
                        class="w-10 h-10 rounded-lg font-medium transition-colors text-sm"
                        :class="page === currentPage 
                          ? 'bg-primary-normal text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'"
                      >
                        {{ page }}
                      </button>
                    </template>
                    <template v-else>
                      <button
                        @click="goToPage(1)"
                        class="w-10 h-10 rounded-lg font-medium transition-colors text-sm"
                        :class="1 === currentPage 
                          ? 'bg-primary-normal text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'"
                      >
                        1
                      </button>
                      <span v-if="currentPage > 3" class="px-2 text-gray-400">...</span>
                      <button
                        v-for="page in [currentPage - 1, currentPage, currentPage + 1].filter(p => p > 1 && p < totalPages)"
                        :key="page"
                        @click="goToPage(page)"
                        class="w-10 h-10 rounded-lg font-medium transition-colors text-sm"
                        :class="page === currentPage 
                          ? 'bg-primary-normal text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'"
                      >
                        {{ page }}
                      </button>
                      <span v-if="currentPage < totalPages - 2" class="px-2 text-gray-400">...</span>
                      <button
                        @click="goToPage(totalPages)"
                        class="w-10 h-10 rounded-lg font-medium transition-colors text-sm"
                        :class="totalPages === currentPage 
                          ? 'bg-primary-normal text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'"
                      >
                        {{ totalPages }}
                      </button>
                    </template>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    :disabled="!hasNext"
                    @click="nextPage"
                  >
                    <Icon icon="mdi:chevron-right" class="w-5 h-5" />
                  </Button>
                </div>

                <!-- Results Info -->
                <div class="text-sm text-gray-600">
                  Showing {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, totalCount) }} of {{ totalCount }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
