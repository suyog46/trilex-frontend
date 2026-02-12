<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { casesApi, type CaseDetail } from '~/composables/api/cases.api'
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

const canAssignLawyer = computed(() => authStore.user?.role !== 'lawyer')

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
