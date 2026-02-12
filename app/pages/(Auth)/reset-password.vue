<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { resetPasswordSchema, type ResetPasswordInput } from "~/lib/validations/auth";
import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod";
import { toast } from "vue-sonner";
import { useErrorHandler } from "~/composables/useErrorHandler";

const route = useRoute()
const authStore = useAuthStore()
const { parseError } = useErrorHandler()

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const resetToken = ref<string | null>(null)
const isTokenValid = ref(false)
const isResettingPassword = ref(false)

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(resetPasswordSchema),
})

const isLoading = computed(() => authStore.isLoading || isResettingPassword.value)

onMounted(() => {
  const token = route.query.token as string
  
  if (!token) {
    toast.error('Invalid request. Please request a new password reset.')
    setTimeout(() => {
      navigateTo('/forgot-password')
    }, 2000)
    return
  }
  
  resetToken.value = token
  isTokenValid.value = true
})

const onSubmit = handleSubmit(async (values: ResetPasswordInput) => {
  if (!resetToken.value) {
    toast.error('Invalid reset token')
    return
  }

  try {
    isResettingPassword.value = true
    console.log("Reset password submitted with token");
    
    const res = await authStore.resetPassword({
      token: resetToken.value,
      new_password: values.new_password,
      confirm_password: values.confirm_password,
    });
    
    if (res.success) {
      toast.success('Password reset successfully! Redirecting to login...')
      
      setTimeout(() => {
        navigateTo('/login')
      }, 2000)
    } else {
      const errorMessage = authStore.error?.message || 'Failed to reset password'
      toast.error(errorMessage)
    }
  } catch (error: any) {
    console.error("Password reset error:", error);
    const { generalErrors } = parseError(error)
    const errorMessage = generalErrors.length > 0 ? generalErrors[0] : 'An unexpected error occurred'
    toast.error(errorMessage || 'An unexpected error occurred')
  } finally {
    isResettingPassword.value = false
  }
});

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const handleBackToLogin = () => {
  navigateTo('/forgot-password')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
    <div class="w-full max-w-md">
      <div v-if="!isTokenValid" class="text-center">
        <div class="mb-6 flex justify-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Icon name="mdi:alert-circle" class="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
        <p class="text-gray-600 mb-6">
          The password reset request is invalid or has expired. Please request a new password reset.
        </p>
        
        <Button
          @click="handleBackToLogin"
          class="w-full px-4 py-3 font-semibold text-white text-lg bg-primary-normal hover:bg-primary-normal/90 rounded-md cursor-pointer"
        >
          Back to Forgot Password
        </Button>
      </div>

      <div v-else class="w-full flex flex-col gap-y-6 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h1 class="text-3xl font-bold text-primary-normal mb-2">
            Reset Password
          </h1>
          <p class="text-gray-600">
            Enter your new password below.
          </p>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-4">
          <FormField v-slot="{ componentField }" name="new_password">
            <FormItem>
              <FormLabel class="text-lg text-gray-700 font-semibold">
                New Password
              </FormLabel>
              <FormControl>
                <div class="relative">
                  <Input
                    v-bind="componentField"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Enter your new password"
                    :disabled="isLoading"
                    class="w-full p-2 ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal pr-12"
                  />
                  <button
                    type="button"
                    @click="togglePasswordVisibility"
                    class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600"
                  >
                    <Icon v-if="showPassword" name="mdi:eye" class="w-5 h-5" />
                    <Icon v-else name="mdi:eye-off" class="w-5 h-5" />
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="confirm_password">
            <FormItem>
              <FormLabel class="text-lg text-gray-700 font-semibold">
                Confirm Password
              </FormLabel>
              <FormControl>
                <div class="relative">
                  <Input
                    v-bind="componentField"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="Confirm your new password"
                    :disabled="isLoading"
                    class="w-full p-2 ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal pr-12"
                  />
                  <button
                    type="button"
                    @click="toggleConfirmPasswordVisibility"
                    class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600"
                  >
                    <Icon v-if="showConfirmPassword" name="mdi:eye" class="w-5 h-5" />
                    <Icon v-else name="mdi:eye-off" class="w-5 h-5" />
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <div class="w-full pt-3">
            <Button
              type="submit"
              :disabled="isLoading"
              class="w-full px-4 py-3 font-semibold text-white text-lg bg-primary-normal hover:bg-primary-normal/90 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon v-if="isLoading" name="mdi:loading" class="w-5 h-5 animate-spin" />
              {{ isLoading ? "Resetting..." : "Reset Password" }}
            </Button>
          </div>
        </form>

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
