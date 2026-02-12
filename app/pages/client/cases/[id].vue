<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { casesApi, type CaseDetail } from '~/composables/api/cases.api'
import { toast } from 'vue-sonner'
import CaseDetailView from '~/components/cases/CaseDetailView.vue'

definePageMeta({
  layout: 'client',
  middleware: ['auth', 'client'],
})

const route = useRoute()
const caseId = route.params.id as string

const caseDetail = ref<CaseDetail | null>(null)
const isLoading = ref(true)

const fetchCaseDetail = async () => {
  console.log('Client - Starting fetch, isLoading:', isLoading.value)
  isLoading.value = true
  try {
    const data = await casesApi.getCaseDetail(caseId)
    console.log('Client - Data received:', !!data, data)
    caseDetail.value = data
    console.log('Client - caseDetail.value set:', !!caseDetail.value)
  } catch (error) {
    console.error('Error fetching case detail:', error)
    toast.error('Failed to load case details')
  } finally {
    isLoading.value = false
    console.log('Client - isLoading set to false:', isLoading.value)
    console.log('Client - Final state:', { isLoading: isLoading.value, hasCaseDetail: !!caseDetail.value })
  }
}

const goBack = () => {
  navigateTo('/client/cases')
}

onMounted(() => {
  console.log('Client - Component mounted, starting fetch')
  fetchCaseDetail()
})

// Watch for changes
watch(isLoading, (newVal) => {
  console.log('Client page - isLoading watch triggered:', newVal)
})

watch(caseDetail, (newVal) => {
  console.log('Client page - caseDetail watch triggered:', !!newVal)
})
</script>

<template>
  <CaseDetailView
    :case-detail="caseDetail"
    :is-loading="isLoading"
    :can-edit="false"
    :can-assign-lawyer="false"
    :on-back="goBack"
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
</template>
