<script setup lang="ts">
import { computed, watch, useSlots } from 'vue'
import { Icon } from '@iconify/vue'
import type { CaseDetail } from '~/composables/api/cases.api'

interface Props {
  caseDetail: CaseDetail | null
  isLoading: boolean
  canEdit?: boolean
  canAssignLawyer?: boolean
  onBack?: () => void
  onEdit?: () => void
  onAssignLawyer?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  canEdit: false,
  canAssignLawyer: false,
})

const getCourtTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    district: 'District Court',
    high: 'High Court',
    supreme: 'Supreme Court',
  }
  return labels[type] || type
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    registered: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

watch(() => props.isLoading, (newVal, oldVal) => {
  console.log('CaseDetailView - isLoading changed:', { old: oldVal, new: newVal })
})

watch(() => props.caseDetail, (newVal) => {
  console.log('CaseDetailView - caseDetail changed:', { exists: !!newVal, data: newVal })
})

const shouldShowLoading = computed(() => props.isLoading)
const shouldShowContent = computed(() => !props.isLoading && !!props.caseDetail)
const shouldShowError = computed(() => !props.isLoading && !props.caseDetail)

const slots = useSlots()
const hasTarikFormSlot = computed(() => !!slots['tarik-form'])

watch([shouldShowLoading, shouldShowContent, shouldShowError], ([loading, content, error]) => {
  console.log('CaseDetailView - Render state:', { loading, content, error })
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          v-if="onBack"
          @click="onBack"
          :disabled="isLoading || !caseDetail"
          class="p-2 rounded-lg transition-colors"
          :class="
            isLoading || !caseDetail
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-gray-100'
          "
        >
          <Icon icon="mdi:arrow-left" class="w-6 h-6 text-gray-600" />
        </button>
        <h1 class="text-2xl font-bold text-primary-normal">
          Case Details
        </h1>
      </div>
      
      <div v-if="caseDetail" class="flex items-center gap-3">
        <button
          v-if="canAssignLawyer && onAssignLawyer"
          @click="onAssignLawyer"
          class="flex items-center gap-2 px-4 py-2 border border-primary-normal rounded-lg hover:bg-primary-normal hover:text-white transition-colors"
        >
          <Icon icon="mdi:account-plus-outline" class="w-5 h-5" />
          <span>Assign Lawyer</span>
        </button>
        <button
          v-if="canEdit && onEdit"
          @click="onEdit"
          class="flex items-center gap-2 px-4 py-2 bg-primary-normal text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Icon icon="mdi:pencil-outline" class="w-5 h-5" />
          <span>Edit Case</span>
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div class="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
        <div class="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
        <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
      </div>
    </div>

    <div v-else-if="caseDetail" class="space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div class="flex items-start justify-between">
          <div class="space-y-2 flex-1">
            <h2 class="text-xl font-semibold text-gray-900">
              {{ caseDetail.title }}
            </h2>
            <div class="flex items-center gap-3 flex-wrap">
              <span :class="`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(caseDetail.status)}`">
                {{ caseDetail.status.charAt(0).toUpperCase() + caseDetail.status.slice(1) }}
              </span>
              <span class="flex items-center gap-2 text-sm text-gray-600">
                <Icon icon="mdi:gavel" class="w-4 h-4" />
                {{ getCourtTypeLabel(caseDetail.court_type) }}
              </span>
              <span class="flex items-center gap-2 text-sm text-gray-600">
                <Icon icon="mdi:folder-outline" class="w-4 h-4" />
                {{ caseDetail.case_category.name }}
              </span>
            </div>
          </div>
        </div>
        
        <div v-if="caseDetail.description" class="pt-4 border-t border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-2">Description</h3>
          <p class="text-gray-600 whitespace-pre-wrap">{{ caseDetail.description }}</p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div class="flex items-center gap-2 mb-4">
          <Icon icon="mdi:account" class="w-5 h-5 text-primary-normal" />
          <h3 class="text-lg font-semibold text-gray-900">Client Information</h3>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <p class="text-sm text-gray-500">Full Name</p>
            <p class="text-gray-900 font-medium">{{ caseDetail.client_details.full_name }}</p>
          </div>
          
          <div class="space-y-1">
            <p class="text-sm text-gray-500">Email</p>
            <p class="text-gray-900">{{ caseDetail.client_details.email || 'N/A' }}</p>
          </div>
          
          <div class="space-y-1">
            <p class="text-sm text-gray-500">Phone</p>
            <p class="text-gray-900">{{ caseDetail.client_details.phone }}</p>
          </div>
          
          <div class="space-y-1">
            <p class="text-sm text-gray-500">Address</p>
            <p class="text-gray-900">{{ caseDetail.client_details.address }}</p>
          </div>
          
          <div class="space-y-1">
            <p class="text-sm text-gray-500">Date of Birth</p>
            <p class="text-gray-900">{{ formatDate(caseDetail.client_details.date_of_birth) }}</p>
          </div>
          
          <div class="space-y-1">
            <p class="text-sm text-gray-500">Citizenship Number</p>
            <p class="text-gray-900">{{ caseDetail.client_details.citizenship_number }}</p>
          </div>
          
          <div class="space-y-1">
            <p class="text-sm text-gray-500">Gender</p>
            <p class="text-gray-900 capitalize">{{ caseDetail.client_details.gender }}</p>
          </div>
        </div>

        <div v-if="caseDetail.client" class="pt-4 border-t border-gray-200">
          <div class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div class="w-12 h-12 rounded-full bg-primary-normal text-white flex items-center justify-center font-semibold">
              {{ caseDetail.client.user.email.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1">
              <p class="text-sm text-gray-600">Linked to registered client</p>
              <p class="font-medium text-gray-900">{{ caseDetail.client_details.full_name }}</p>
              <p class="text-sm text-gray-600">{{ caseDetail.client.user.email }}</p>
            </div>
            <Icon icon="mdi:link-variant" class="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      <div v-if="caseDetail.waris" class="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div class="flex items-center gap-2 mb-4">
          <Icon icon="mdi:account-multiple" class="w-5 h-5 text-primary-normal" />
          <h3 class="text-lg font-semibold text-gray-900">Waris Information</h3>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <p class="text-sm text-gray-500">Full Name</p>
            <p class="text-gray-900 font-medium">{{ caseDetail.waris.full_name }}</p>
          </div>
          
          <div class="space-y-1">
            <p class="text-sm text-gray-500">Email</p>
            <p class="text-gray-900">{{ caseDetail.waris.email || 'N/A' }}</p>
          </div>
          
          <div class="space-y-1">
            <p class="text-sm text-gray-500">Phone</p>
            <p class="text-gray-900">{{ caseDetail.waris.phone }}</p>
          </div>
          
          <div class="space-y-1">
            <p class="text-sm text-gray-500">Address</p>
            <p class="text-gray-900">{{ caseDetail.waris.address }}</p>
          </div>
          
          <div class="space-y-1">
            <p class="text-sm text-gray-500">Date of Birth</p>
            <p class="text-gray-900">{{ formatDate(caseDetail.waris.date_of_birth) }}</p>
          </div>
          
          <div class="space-y-1">
            <p class="text-sm text-gray-500">Citizenship Number</p>
            <p class="text-gray-900">{{ caseDetail.waris.citizenship_number }}</p>
          </div>
          
          <div class="space-y-1">
            <p class="text-sm text-gray-500">Gender</p>
            <p class="text-gray-900 capitalize">{{ caseDetail.waris.gender }}</p>
          </div>
        </div>
      </div>

      <div v-if="caseDetail.dates.length > 0 || hasTarikFormSlot" class="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div class="flex items-center gap-2 mb-4">
          <Icon icon="mdi:calendar" class="w-5 h-5 text-primary-normal" />
          <h3 class="text-lg font-semibold text-gray-900">Tarik Dates</h3>
        </div>

        <div v-if="hasTarikFormSlot">
          <slot name="tarik-form"></slot>
        </div>
        
        <div v-if="caseDetail.dates.length > 0" class="space-y-3">
          <div 
            v-for="(dateItem, index) in caseDetail.dates" 
            :key="dateItem.id"
            class="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
          >
            <div class="flex-shrink-0">
              <div class="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                <span class="text-primary-normal font-semibold">{{ index + 1 }}</span>
              </div>
            </div>
            <div class="flex-1 space-y-2">
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                  <Icon icon="mdi:calendar-clock" class="w-4 h-4 text-gray-500" />
                  <span class="font-medium text-gray-900">{{ formatDate(dateItem.date) }}</span>
                </div>
                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {{ dateItem.date_type }}
                </span>
              </div>
              
              <div v-if="dateItem.assigned_to_name" class="flex items-center gap-2 text-sm text-gray-600">
                <Icon icon="mdi:account" class="w-4 h-4" />
                <span>Assigned to: {{ dateItem.assigned_to_name }}</span>
              </div>
              
              <div v-if="dateItem.remark" class="text-sm text-gray-600">
                <p class="font-medium text-gray-700">Remark:</p>
                <p>{{ dateItem.remark }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-6 text-gray-500">
          <Icon icon="mdi:calendar-blank" class="w-10 h-10 mx-auto mb-2 text-gray-400" />
          <p>No dates added yet</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div class="flex items-center gap-2 mb-4">
            <Icon icon="mdi:file-document-multiple" class="w-5 h-5 text-primary-normal" />
            <h3 class="text-lg font-semibold text-gray-900">Documents</h3>
          </div>
          
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center">
                <Icon icon="mdi:file-document" class="w-6 h-6 text-primary-normal" />
              </div>
              <div>
                <p class="text-sm text-gray-500">Total Documents</p>
                <p class="text-2xl font-bold text-gray-900">{{ caseDetail.total_documents }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div class="flex items-center gap-2 mb-4">
            <Icon icon="mdi:account-tie" class="w-5 h-5 text-primary-normal" />
            <h3 class="text-lg font-semibold text-gray-900">Assigned Lawyers</h3>
          </div>
          
          <div v-if="caseDetail.assigned_lawyers.length === 0" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <Icon icon="mdi:account-group" class="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p class="text-sm text-gray-500">No lawyers assigned yet</p>
              </div>
            </div>
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="lawyer in caseDetail.assigned_lawyers" 
              :key="lawyer.lawyer_id"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                  <Icon icon="mdi:account" class="w-5 h-5 text-primary-normal" />
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ lawyer.email }}</p>
                  <p class="text-sm text-gray-500 capitalize">{{ lawyer.role }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span v-if="lawyer.can_edit" class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  Can Edit
                </span>
                <span v-else class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  View Only
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div class="flex items-center gap-2 mb-4">
          <Icon icon="mdi:information" class="w-5 h-5 text-primary-normal" />
          <h3 class="text-lg font-semibold text-gray-900">Case Metadata</h3>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="space-y-1">
            <p class="text-sm text-gray-500">Case ID</p>
            <p class="text-gray-900 font-mono text-sm">{{ caseDetail.id }}</p>
          </div>
          
          <div class="space-y-1">
            <p class="text-sm text-gray-500">Owner Type</p>
            <p class="text-gray-900 capitalize">{{ caseDetail.owner_type }}</p>
          </div>
          
          <div class="space-y-1">
            <p class="text-sm text-gray-500">Created At</p>
            <p class="text-gray-900">{{ formatDate(caseDetail.created_at) }}</p>
          </div>
          
          <div class="space-y-1">
            <p class="text-sm text-gray-500">Last Updated</p>
            <p class="text-gray-900">{{ formatDate(caseDetail.updated_at) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bg-white rounded-lg shadow-sm p-12 text-center">
      <Icon icon="mdi:alert-circle" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-600">Failed to load case details</p>
      <slot name="error-action"></slot>
    </div>
  </div>
</template>
