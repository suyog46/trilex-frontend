<script setup lang="ts">
import { ref, computed } from "vue";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { forgotPasswordSchema, type ForgotPasswordInput } from "~/lib/validations/auth";
import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod";
import { toast } from "vue-sonner";
import { useErrorHandler } from "~/composables/useErrorHandler";

const authStore = useAuthStore()
// const { parseError } = useErrorHandler()

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(forgotPasswordSchema),
})

const isLoading = computed(() => authStore.isLoading)
const emailSent = ref(false)
const userEmail = ref("")

const onSubmit = handleSubmit(async (values: ForgotPasswordInput) => {
  try {
    console.log("Forgot password submitted with email:", values.email);
    const res = await authStore.forgotPassword(values);
    console.log("Forgot password response:", res);
    if (res.success) {
      toast.success('OTP sent to your email!')
      userEmail.value = values.email
      emailSent.value = true
      console.log("Forgot password successful, OTP sent to:", values.email);
      // setTimeout(() => {
        navigateTo(`/verify-otp?email=${encodeURIComponent(values.email)}`)
      // }, 2000)
    } 
    else {
      // Handle error from auth store
      console.error("Forgot password error 1:", authStore.error);
      const errorMessage = authStore.error?.message || 'Failed to send OTP'
      console.error("Forgot password error:", errorMessage);
      toast.error(errorMessage)
    }
  } catch (error: any) {
    console.error("Forgot password error:", error);
    // const { generalErrors } = parseError(error)
    // const errorMessage = generalErrors.length > 0 ? generalErrors[0] : error?.response?.data?.error || error?.message || 'An unexpected error occurred'
    // toast.error(errorMessage)
    toast.error('Failed to send OTP. Please try again.')
  }
});

const handleBackToLogin = () => {
  navigateTo('/login')
}
const handleToOTP = () => {
  navigateTo(`/verify-otp?email=${encodeURIComponent(userEmail.value)}`)
}

</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
    <div class="w-full max-w-md">
      <!-- Success State -->
      <div v-if="emailSent" class="text-center">
        <div class="mb-6 flex justify-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Icon name="mdi:check-circle" class="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
        <p class="text-gray-600 mb-4">
          We've sent an OTP to
          <span class="font-semibold text-gray-900">{{ userEmail }}</span>
        </p>
        <p class="text-sm text-gray-500 mb-6">
          Please check your email for the OTP code. The code will expire in 10 minutes.
        </p>
        
        <Button
          @click="handleToOTP"
          class="w-full px-4 py-3 font-semibold text-white text-lg bg-primary-normal hover:bg-primary-normal/90 rounded-md cursor-pointer"
        >
          Enter OTP
        </Button>
      </div>

      <!-- Form State -->
      <div v-else class="w-full flex flex-col gap-y-6 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h1 class="text-3xl font-bold text-primary-normal mb-2">
            Forgot Password?
          </h1>
          <p class="text-gray-600">
            No worries! Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-4">
          <!-- Email Field -->
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel class="text-lg text-gray-700 font-semibold">
                Email Address
              </FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="email"
                  placeholder="Enter your email"
                  :disabled="isLoading"
                  class="w-full p-2 ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Submit Button -->
          <div class="w-full pt-3">
            <Button
              type="submit"
              :disabled="isLoading"
              class="w-full px-4 py-3 font-semibold text-white text-lg bg-primary-normal hover:bg-primary-normal/90 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon v-if="isLoading" name="mdi:loading" class="w-5 h-5 animate-spin" />
              {{ isLoading ? "Sending..." : "Send Reset Link" }}
            </Button>
          </div>
        </form>

        <!-- Back to Login Link -->
        <div class="text-center">
          <p class="text-slate-600">
            Remember your password?
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
