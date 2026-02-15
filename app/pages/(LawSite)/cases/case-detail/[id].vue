<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { casesApi, type CaseDetail } from '~/composables/api/cases.api'
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Button } from "~/components/ui/button"
import { toast } from 'vue-sonner'
import AssignLawyerDialog from '~/components/dialogs/AssignLawyerDialog.vue'
import { useAuthStore } from '~/stores/auth'
import CaseDetailView from '~/components/cases/CaseDetailView.vue'

definePageMeta({
  layout: "lawyer",
})

const route = useRoute()
const caseId = route.params.id as string
const authStore = useAuthStore()

const caseDetail = ref<CaseDetail | null>(null)
const isLoading = ref(true)
const showAssignLawyerDialog = ref(false)
const isAddingDate = ref(false)
const showTarikForm = ref(false)
const tarikDateForm = ref({
  date: '',
  remark: '',
  assigned_to_name: '',
})

const canAssignLawyer = computed(() => authStore.user?.role !== 'lawyer')
const isFirm = computed(() => authStore.user?.role === 'firm')

const fetchCaseDetail = async () => {
  console.log('Lawyer - Starting fetch, isLoading:', isLoading.value)
  isLoading.value = true
  try {
    const data = await casesApi.getCaseDetail(caseId)
    console.log('Lawyer - Data received:', !!data, data)
    caseDetail.value = data
    console.log('Lawyer - caseDetail.value set:', !!caseDetail.value)
  } catch (error) {
    console.error('Error fetching case detail:', error)
    toast.error('Failed to load case details')
  } finally {
    isLoading.value = false
    console.log('Lawyer - isLoading set to false:', isLoading.value)
    console.log('Lawyer - Final state:', { isLoading: isLoading.value, hasCaseDetail: !!caseDetail.value })
  }
}

const goBack = () => {
  navigateTo(`/cases/${caseDetail.value?.status}`)
}

const handleEdit = () => {
  navigateTo(`/cases/edit/${caseId}`)
}

const handleAssignLawyer = () => {
  showAssignLawyerDialog.value = true
}

const handleLawyerAssigned = () => {
  fetchCaseDetail()
}

const addTarikDate = async () => {
  if (!tarikDateForm.value.date) {
    toast.error('Please select a date')
    return
  }

  isAddingDate.value = true
  try {
    await casesApi.createCaseDate(caseId, {
      date_type: 'tarik',
      date: tarikDateForm.value.date,
      remark: tarikDateForm.value.remark || '',
      assigned_to_name: tarikDateForm.value.assigned_to_name || '',
    })
    toast.success('Tarik date added successfully')
    tarikDateForm.value = {
      date: '',
      remark: '',
      assigned_to_name: '',
    }
    showTarikForm.value = false
    fetchCaseDetail()
  } catch (error) {
    console.error('Failed to add tarik date:', error)
    toast.error('Failed to add tarik date')
  } finally {
    isAddingDate.value = false
  }
}

onMounted(() => {
  console.log('Lawyer - Component mounted, starting fetch')
  fetchCaseDetail()
})

// Watch for changes
watch(isLoading, (newVal) => {
  console.log('Lawyer page - isLoading watch triggered:', newVal)
})

watch(caseDetail, (newVal) => {
  console.log('Lawyer page - caseDetail watch triggered:', !!newVal)
})
</script>

<template>
  <div>
    <CaseDetailView
      :case-detail="caseDetail"
      :is-loading="isLoading"
      :can-edit="true"
      :can-assign-lawyer="canAssignLawyer"
      :on-back="goBack"
      :on-edit="handleEdit"
      :on-assign-lawyer="handleAssignLawyer"
    >
      <template #tarik-form>
        <div class="flex justify-end">
          <Button
            v-if="!showTarikForm"
            type="button"
            class="bg-primary-normal text-white"
            :disabled="isFirm"
            @click="!isFirm && (showTarikForm = true)"
          >
            Add Tarik Date
          </Button>
        </div>

        <div v-if="showTarikForm" class="border border-gray-200 rounded-lg p-4 space-y-3">
          <div class="flex flex-col gap-3">
            <div class="flex gap-3 items-center">
                  <div class="w-full">
                <label class="block text-sm font-medium mb-1">Assigned To</label>
                <Input
                  v-model="tarikDateForm.assigned_to_name"
                  placeholder="Name of person assigned"
                  :disabled="isAddingDate"
                />
              </div>
              <div class="w-full">
                <label class="block text-sm font-medium mb-1">Date *</label>
                <Input v-model="tarikDateForm.date" type="date" :disabled="isAddingDate" />
              </div>
          

            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Remark</label>
              <Textarea
                v-model="tarikDateForm.remark"
                placeholder="Add any remarks"
                rows="2"
                :disabled="isAddingDate"
              />
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              :disabled="isAddingDate"
              @click="showTarikForm = false"
            >
              Cancel
            </Button>
            <Button type="button" :disabled="isAddingDate" @click="addTarikDate">
              {{ isAddingDate ? 'Adding...' : 'Add Tarik Date' }}
            </Button>
          </div>
        </div>
      </template>
      <template #error-action>
        <button
          @click="fetchCaseDetail"
          class="mt-4 px-4 py-2 bg-primary-normal text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Try Again
        </button>
      </template>
    </CaseDetailView>

    <AssignLawyerDialog
      v-if="caseDetail"
      :open="showAssignLawyerDialog"
      :case-id="caseDetail.id"
      :case-title="caseDetail.title"
      @update:open="showAssignLawyerDialog = $event"
      @assigned="handleLawyerAssigned"
    />
  </div>
</template>
