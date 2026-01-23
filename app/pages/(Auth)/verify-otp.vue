<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { OtpInput } from "~/components/ui/otp-input";
import { Button } from "~/components/ui/button";
import { toast } from "vue-sonner";

const route = useRoute()
const authStore = useAuthStore()

const userEmail = ref<string | null>(null)
const resetToken = ref<string | null>(null)
const resendCountdown = ref(0)
const otpValue = ref("")

const isLoading = computed(() => authStore.isLoading)

onMounted(() => {
  // Get email from URL query params
  const email = route.query.email as string
  
  if (!email) {
    toast.error('Email not found. Please start again.')
    setTimeout(() => {
      navigateTo('/forgot-password')
    }, 2000)
    return
  }
  
  userEmail.value = email
})

const handleSubmit = async () => {
  if (!userEmail.value || !otpValue.value) {
    toast.error('Please enter OTP')
    return
  }

  if (otpValue.value.length < 4) {
    toast.error('OTP must be at least 4 characters')
    return
  }

  try {
    console.log("OTP verification submitted");
    
    const res = await authStore.verifyForgotPasswordOtp({
      email: userEmail.value,
      otp: otpValue.value,
    });
    
    if (res.success) {
      toast.success('OTP verified! Redirecting to reset password...')
      resetToken.value = res.reset_token || null
      
      setTimeout(() => {
        navigateTo({
          path: '/reset-password',
          query: { token: res.reset_token }
        })
      }, 2000)
    } else {
      toast.error(authStore.error?.message || 'Invalid OTP')
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    toast.error('An unexpected error occurred')
  }
};

const handleResendOtp = async () => {
  if (!userEmail.value) return
  
  try {
    const res = await authStore.forgotPassword({ email: userEmail.value })
    
    if (res.success) {
      toast.success('OTP resent to your email!')
      resendCountdown.value = 60
      
      const interval = setInterval(() => {
        resendCountdown.value--
        if (resendCountdown.value <= 0) {
          clearInterval(interval)
        }
      }, 1000)
    } else {
      toast.error('Failed to resend OTP')
    }
  } catch (error) {
    console.error("Resend OTP error:", error);
    toast.error('An unexpected error occurred')
  }
};

const handleBackToLogin = () => {
  navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
    <div class="w-full max-w-md">
      <div class="w-full flex flex-col gap-y-6 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h1 class="text-3xl font-bold text-primary-normal mb-2">
            Verify OTP
          </h1>
          <p class="text-gray-600">
            Enter the OTP sent to your email
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- OTP Field -->
          <div>
            <label class="text-lg text-gray-700 font-semibold block mb-4">
              One-Time Password
            </label>
            <div class="flex justify-center">
              <OtpInput
                v-model="otpValue"
                :length="6"
                placeholder="0"
                :disabled="isLoading"
              />
            </div>
            <p class="text-sm text-gray-500 mt-4 text-center">
              Sent to: <span class="font-semibold text-gray-700">{{ userEmail }}</span>
            </p>
          </div>

          <!-- Submit Button -->
          <div class="w-full pt-3">
            <Button
              type="submit"
              :disabled="isLoading || otpValue.length < 4"
              class="w-full px-4 py-3 font-semibold text-white text-lg bg-primary-normal hover:bg-primary-normal/90 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon v-if="isLoading" name="mdi:loading" class="w-5 h-5 animate-spin" />
              {{ isLoading ? "Verifying..." : "Verify OTP" }}
            </Button>
          </div>
        </form>

        <!-- Resend OTP Section -->
        <div class="text-center border-t pt-4">
          <p class="text-sm text-gray-600 mb-3">
            Didn't receive the OTP?
          </p>
          <Button
            v-if="resendCountdown === 0"
            @click="handleResendOtp"
            type="button"
            :disabled="isLoading"
            class="w-full px-4 py-2 font-medium text-primary-normal text-lg border-2 border-primary-normal hover:bg-primary-normal/10 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Resend OTP
          </Button>
          <div v-else class="text-primary-normal font-semibold">
            Resend in {{ resendCountdown }}s
          </div>
        </div>

        <!-- Back to Login Link -->
        <div class="text-center">
          <p class="text-slate-600">
            <span
              @click="handleBackToLogin"
              class="text-primary-normal font-semibold cursor-pointer underline hover:text-primary-normal/90"
            >
              Back to Login
            </span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
