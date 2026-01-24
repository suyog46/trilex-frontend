<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { authApi } from '~/composables/api/auth.api'
import { useErrorHandler } from '~/composables/useErrorHandler'

const { parseError } = useErrorHandler()

const route = useRoute()
const router = useRouter()

const userEmail = computed(() => {
  return route.query.email as string || 'your@email.com'
})

const isFromLogin = computed(() => {
  return route.query.fromLogin === 'true'
})

const userRole = computed(() => {
  return route.query.role as string || 'client'
})

const roleDisplayName = computed(() => {
  switch (userRole.value) {
    case 'lawyer':
      return 'Lawyer'
    case 'firm':
      return 'Law Firm'
    case 'client':
    default:
      return 'User'
  }
})

const expirationMinutes = ref(15) 
const isResending = ref(false)
const resendCooldown = ref(0)

const formattedExpiration = computed(() => {
  const hours = Math.floor(expirationMinutes.value / 60)
  const minutes = expirationMinutes.value % 60
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`
  }
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`
})

onMounted(() => {
  const interval = setInterval(() => {
    if (expirationMinutes.value > 0) {
      expirationMinutes.value-- 
    }
  }, 60000) 

  // Auto-resend verification link if coming from login attempt
  if (isFromLogin.value) {
    console.log('Auto-resending verification link for:', userEmail.value)
    handleResendEmail()
  }

  return () => clearInterval(interval)
})

const handleResendEmail = async () => {
  if (resendCooldown.value > 0) {
    toast.info(`Please wait ${resendCooldown.value} seconds before resending`)
    return
  }

  isResending.value = true
  
  try {
    await authApi.resendVerificationLink({ email: userEmail.value })
    toast.success('Verification link sent! Check your email.')
    
    resendCooldown.value = 60
    const cooldownInterval = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0) {
        clearInterval(cooldownInterval)
      }
    }, 1000)
  } catch (error: any) {
    const { generalErrors } = parseError(error)
    const errorMessage = generalErrors.length > 0 ? generalErrors[0] : 'Failed to resend verification link'
    console.error('Resend verification error:', error)
    
    // Only show error toast if manually triggered (not auto-resend on page load)
    if (!isFromLogin.value) {
      toast.error(errorMessage || 'Failed to resend verification link')
    } else {
      // For auto-resend, just log and don't show error to avoid alerting user
      console.warn('Auto-resend failed:', errorMessage)
      // Remove fromLogin flag so manual resend will work without cooldown
      resendCooldown.value = 0
    }
  } finally {
    isResending.value = false
  }
}

const handleGoBack = () => {
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-lg shadow-lg p-8 space-y-6">
        
        <div class="flex justify-center">
          <div class="relative">
            <div class="relative bg-primary-light rounded-full p-4">
              <Icon icon="mdi:email-check-outline" class="w-12 h-12 text-primary-normal" />
            </div>
          </div>
        </div>

        <div class="text-center space-y-2">
          <h1 class="text-2xl font-bold text-primary-normal">
            Check Your Email
          </h1>
          <p class="text-gray-600">
            We've sent a verification link to your inbox
          </p>
          <p v-if="userRole !== 'client'" class="text-sm text-primary-normal font-medium">
            Registering as: {{ roleDisplayName }}
          </p>
        </div>

        <div class="bg-primary-normal/80 border border-primary-normal rounded-lg p-4 text-center">
          <p class="text-gray-700">
            <span class="font-semibold text-white">{{ userEmail }}</span>
          </p>
        </div>

        <div class="space-y-3 bg-gray-50 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <Icon icon="mdi:clock-outline" class="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <p class="text-sm font-medium text-gray-700">
                Link expires in
              </p>
              <p class="text-sm text-gray-600">
                {{ formattedExpiration }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <Icon icon="mdi:inbox-multiple" class="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <p class="text-sm font-medium text-gray-700">
                Check spam folder
              </p>
              <p class="text-sm text-gray-600">
                If you don't see it in your inbox
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <Icon icon="mdi:link-variant" class="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <p class="text-sm font-medium text-gray-700">
                Click the verification link
              </p>
              <p class="text-sm text-gray-600">
                In the email to verify your account
              </p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <!-- Resend Button -->
          <button
            @click="handleResendEmail"
            :disabled="isResending || resendCooldown > 0"
            class="w-full px-4 py-3 bg-primary-normal hover:bg-primary-normal/90 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Icon v-if="isResending" icon="mdi:loading" class="w-5 h-5 animate-spin" />
            <Icon v-else icon="mdi:email-send" class="w-5 h-5" />
            {{ isResending ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Email' }}
          </button>

          <!-- Back Button -->
          <button
            @click="handleGoBack"
            class="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors duration-200"
          >
            Go Back
          </button>
        </div>

        <!-- Footer Message -->
        <div class="pt-4 border-t border-gray-200">
          <p class="text-center text-sm text-gray-600">
            Already verified?
            <NuxtLink
              to="/login"
              class="text-primary-normal font-semibold hover:text-primary-dark underline"
            >
              Go to login
            </NuxtLink>
          </p>
        </div>
      </div>

      <!-- Security Note -->
      <div class="mt-6 text-center">
        <p class="text-xs text-gray-500">
          Your email verification link is secure and will only work once
        </p>
      </div>
    </div>
  </div>
</template>
