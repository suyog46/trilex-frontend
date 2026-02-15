<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { casesApi, type FirmMember } from '~/composables/api/cases.api'
import { toast } from 'vue-sonner'

interface Props {
  open: boolean
  caseId: string
  caseTitle: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  'assigned': []
}>()

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const lawyers = ref<FirmMember[]>([])
const totalCount = ref(0)
const isLoading = ref(false)
const isAssigning = ref(false)
const selectedLawyerId = ref<string | null>(null)

let searchTimeout: NodeJS.Timeout | null = null

const fetchLawyers = async () => {
  isLoading.value = true
  try {
    const response = await casesApi.getFirmMembers({
      page: currentPage.value,
      page_size: pageSize.value,
      search: searchQuery.value || undefined,
    })
    lawyers.value = response.results
    totalCount.value = response.count
  } catch (error) {
    console.error('Error fetching lawyers:', error)
    toast.error('Failed to load lawyers')
  } finally {
    isLoading.value = false
  }
}

const handleSearch = (value: string) => {
  searchQuery.value = value
  
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchLawyers()
  }, 500)
}

const selectLawyer = (lawyerId: string) => {
  selectedLawyerId.value = lawyerId
}

const handleAssign = async () => {
  if (!selectedLawyerId.value) {
    toast.error('Please select a lawyer')
    return
  }
  
  isAssigning.value = true
  try {
    await casesApi.assignLawyer(props.caseId, selectedLawyerId.value)
    toast.success('Lawyer assigned successfully')
    emit('assigned')
    emit('update:open', false)
  } catch (error: any) {
    console.error('Error assigning lawyer:', error)
    const errorMessage = error?.data?.message || error?.message || 'Failed to assign lawyer'
    toast.error(errorMessage)
  } finally {
    isAssigning.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchLawyers()
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    selectedLawyerId.value = null
    currentPage.value = 1
    searchQuery.value = ''
    fetchLawyers()
  }
})

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="emit('update:open', false)"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
      <div class="flex items-center justify-between p-6 border-b">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Assign Lawyer</h2>
          <p class="text-sm text-gray-600 mt-1">{{ caseTitle }}</p>
        </div>
        <button 
          @click="emit('update:open', false)"
          class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Icon icon="mdi:close" class="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <div class="p-6 border-b">
        <div class="relative">
          <Icon icon="mdi:magnify" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            :value="searchQuery"
            @input="handleSearch(($event.target as HTMLInputElement).value)"
            placeholder="Search lawyers by name or email..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="isLoading" class="flex items-center justify-center py-12">
          <Icon icon="mdi:loading" class="w-8 h-8 animate-spin text-primary-normal" />
        </div>

        <div v-else-if="lawyers.length === 0" class="text-center py-12">
          <Icon icon="mdi:account-search" class="w-16 h-16 mx-auto mb-3 text-gray-400" />
          <p class="text-gray-600">No lawyers found</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="member in lawyers"
            :key="member.id"
            @click="selectLawyer(member.lawyer.id)"
            class="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            :class="{ 'border-primary-normal bg-primary-normal/5': selectedLawyerId === member.lawyer.id }"
          >
            <div class="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              <img
                v-if="member.lawyer.verification?.passport_size_photo?.url"
                :src="member.lawyer.verification.passport_size_photo.url"
                :alt="member.lawyer.verification?.full_name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <Icon icon="mdi:account" class="w-6 h-6 text-gray-500" />
              </div>
            </div>

            <div class="flex-1">
              <p class="font-semibold text-gray-900">
                {{ member.lawyer.verification?.full_name || member.lawyer.user.full_name }}
              </p>
              <p class="text-sm text-gray-600">{{ member.lawyer.user.email }}</p>
              <p class="text-xs text-gray-500 mt-1">Role: {{ member.role }}</p>
            </div>

            <div v-if="selectedLawyerId === member.lawyer.id" class="flex-shrink-0">
              <Icon icon="mdi:check-circle" class="w-6 h-6 text-primary-normal" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1 && !isLoading" class="px-6 py-3 border-t flex items-center justify-center gap-2">
        <button
          @click="handlePageChange(currentPage - 1)"
          :disabled="currentPage === 1"
          class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="mdi:chevron-left" class="w-5 h-5" />
        </button>
        <span class="text-sm text-gray-600">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button
          @click="handlePageChange(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="mdi:chevron-right" class="w-5 h-5" />
        </button>
      </div>

      <div class="flex gap-3 p-6 border-t">
        <button
          @click="emit('update:open', false)"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleAssign"
          :disabled="!selectedLawyerId || isAssigning"
          class="flex-1 px-4 py-2 bg-primary-normal text-white rounded-lg hover:bg-primary-normal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon v-if="isAssigning" icon="mdi:loading" class="w-5 h-5 inline-block mr-2 animate-spin" />
          {{ isAssigning ? 'Assigning...' : 'Assign Lawyer' }}
        </button>
      </div>
    </div>
  </div>
</template>
