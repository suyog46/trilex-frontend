<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { toast } from 'vue-sonner'

// Import verification components
import ClientVerificationLoading from '~/components/verification/client/ClientVerificationLoading.vue'
import ClientVerificationForm from '~/components/verification/client/ClientVerificationForm.vue'
import VerificationSuccess from '~/components/verification/shared/VerificationSuccess.vue'
import VerificationPending from '~/components/verification/shared/VerificationPending.vue'
import VerificationRejectedHeader from '~/components/verification/shared/VerificationRejectedHeader.vue'

definePageMeta({
  layout: 'client',
  middleware: ['auth', 'client'],
})

const authStore = useAuthStore()
const isLoading = ref(false)

// Computed properties for verification status
const verificationStatus = computed(() => authStore.clientVerificationStatus?.status)
const isVerified = computed(() => verificationStatus.value === 'VERIFIED')
const isPending = computed(() => verificationStatus.value === 'PENDING')
const isRejected = computed(() => verificationStatus.value === 'REJECTED')
const isNotSubmitted = computed(() => !verificationStatus.value || verificationStatus.value === 'NOT_SUBMITTED')

// Pending details for display
const pendingDetails = computed(() => {
  const status = authStore.clientVerificationStatus
  console.log('📋 Client Verification Status:', status)
  return {
    'Full Name': status?.full_name,
    'Date of Birth': status?.date_of_birth,
    'ID Type': status?.id_type,
  }
})

// Fetch verification status on mount
onMounted(async () => {
  isLoading.value = true
  try {
    // Ensure auth middleware has completed
    if (!authStore.isInitialized) {
      await authStore.initializeAuth()
    }
    
    const status = await authStore.getClientVerificationStatus()
    console.log('📦 Fetched Client Status:', status)
    
    if (!status) {
      toast.error('Failed to load verification status')
    }
  } catch (error: any) {
    console.error('Error fetching verification status:', error)
    toast.error(error?.message || 'Failed to load verification status')
  } finally {
    isLoading.value = false
  }
})

// If verified, redirect to dashboard
if (authStore.clientVerificationStatus?.status === 'VERIFIED') {
  navigateTo('/client/dashboard')
}

// Handle form submission callback
const handleFormSubmitted = async () => {
  await authStore.getClientVerificationStatus()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">ID Verification</h1>
        <p class="text-lg text-gray-600">Verify your identity to access all features</p>
      </div>

      <!-- Loading State -->
      <ClientVerificationLoading v-if="isLoading" />

      <!-- Verified Status -->
      <VerificationSuccess 
        v-else-if="isVerified" 
        dashboard-link="/client/dashboard" 
      />

      <VerificationPending 
        v-else-if="isPending" 
        :details="pendingDetails" 
      />

      <!-- Rejected Status -->
      <template v-else-if="isRejected">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <VerificationRejectedHeader 
            :reason="authStore.clientVerificationStatus?.rejection_reason ?? undefined" 
          />
          <ClientVerificationForm 
            :verification-status="authStore.clientVerificationStatus"
            :is-resubmitting="false"
            @submitted="handleFormSubmitted"
          />
        </div>
      </template>

      <!-- Not Submitted State -->
      <template v-else-if="isNotSubmitted">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <div class="text-center mb-8">
            <Icon icon="mdi:information" class="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 class="text-2xl font-bold text-blue-600 mb-2">Complete Your Verification</h2>
            <p class="text-gray-600 mb-6">Please submit your ID documents to continue</p>
          </div>
          <ClientVerificationForm 
            @submitted="handleFormSubmitted"
          />
        </div>
      </template>
    </div>
  </div>
</template>``
