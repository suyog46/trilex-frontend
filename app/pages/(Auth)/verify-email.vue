<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { authApi } from '~/composables/api/auth.api'
import { useErrorHandler } from '~/composables/useErrorHandler'

const route = useRoute()
const router = useRouter()
const { parseError } = useErrorHandler()

// States
const isVerifying = ref(false)
const isVerified = ref(false)
const verificationError = ref<string | null>(null)
const token = ref<string | null>(null)

onMounted(async () => {
  token.value = route.query.token as string

  if (!token.value) {
    verificationError.value = 'Verification token not found. Invalid link.'
    return
  }

  await verifyEmail()
})

// Verify email with token
const verifyEmail = async () => {
  if (!token.value) {
    verificationError.value = 'No token provided'
    return
  }

  isVerifying.value = true
  verificationError.value = null

  try {
    await authApi.verifyEmail({ token: token.value })
    isVerified.value = true
    toast.success('Email verified successfully! Redirecting to login...')

    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error: any) {
    const errorData = error?.data || error?.response?.data || error
    let errorMessage = 'Failed to verify email. The link may have expired.'
    
    if (typeof errorData === 'object' && errorData !== null) {
      if (errorData.error && typeof errorData.error === 'string') {
        errorMessage = errorData.error
      } else if (errorData.message && typeof errorData.message === 'string') {
        errorMessage = errorData.message
      } else if (errorData.detail && typeof errorData.detail === 'string') {
        errorMessage = errorData.detail
      }
    } else if (typeof errorData === 'string') {
      errorMessage = errorData
    }
    
    verificationError.value = errorMessage
    toast.error(errorMessage)
    console.error('Email verification error:', error)
  } finally {
    isVerifying.value = false
  }
}

// Handle retry
const handleRetry = () => {
  verificationError.value = null
  verifyEmail()
}

// Handle go to login
const handleGoToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Card Container -->
      <div class="bg-white rounded-lg shadow-lg p-8 space-y-6">
        
        <!-- Loading State -->
        <div v-if="isVerifying && !verificationError" class="space-y-6">
          <div class="flex justify-center">
            <div class="bg-blue-50 rounded-full p-4">
              <Icon icon="mdi:email-check-outline" class="w-12 h-12 text-blue-600 animate-spin" />
            </div>
          </div>
          
          <div class="text-center space-y-2">
            <h1 class="text-2xl font-bold text-gray-900">
              Verifying Email
            </h1>
            <p class="text-gray-600">
              Please wait while we verify your email...
            </p>
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
            <div class="bg-blue-600 h-full animate-pulse"></div>
          </div>
        </div>

        <!-- Success State -->
        <div v-else-if="isVerified" class="space-y-6">
          <div class="flex justify-center">
            <div class="bg-green-50 rounded-full p-4">
              <Icon icon="mdi:check-circle" class="w-12 h-12 text-green-600" />
            </div>
          </div>
          
          <div class="text-center space-y-2">
            <h1 class="text-2xl font-bold text-gray-900">
              Email Verified!
            </h1>
            <p class="text-gray-600">
              Your email has been successfully verified
            </p>
          </div>

          <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p class="text-sm text-green-700">
              ✓ Your account is now active
            </p>
          </div>

          <button
            @click="handleGoToLogin"
            class="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Go to Login
          </button>
        </div>

        <!-- Error State -->
        <div v-else class="space-y-6">
          <div class="flex justify-center">
            <div class="bg-red-50 rounded-full p-4">
              <Icon icon="mdi:alert-circle" class="w-12 h-12 text-red-600" />
            </div>
          </div>
          
          <div class="text-center space-y-2">
            <h1 class="text-2xl font-bold text-gray-900">
              Verification Failed
            </h1>
            <p class="text-gray-600">
              Unable to verify your email
            </p>
          </div>

          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-700 text-center">
              {{ verificationError || 'An unexpected error occurred' }}
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-3">
            <button
              @click="handleRetry"
              class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Icon icon="mdi:reload" class="w-5 h-5" />
              Try Again
            </button>

            <button
              @click="handleGoToLogin"
              class="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors duration-200"
            >
              Go to Login
            </button>
          </div>

          <!-- Support Message -->
          <div class="text-center">
            <p class="text-sm text-gray-600">
              Having trouble?
              <a href="#" class="text-blue-600 font-semibold hover:text-blue-700">
                Contact support
              </a>
            </p>
          </div>
        </div>

        <!-- Footer Note -->
        <div class="pt-4 border-t border-gray-200 text-center">
          <p class="text-xs text-gray-500">
            🔒 Secure verification process
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
