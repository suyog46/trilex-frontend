<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { userRegisterSchema, type UserRegisterInput } from "~/lib/validations/auth"
import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { useAuthStore } from "~/stores/auth"
import { toast } from 'vue-sonner'

const showPassword = ref(false)
const authStore = useAuthStore()

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(userRegisterSchema),
})

// Test toast on component mount

// Handle registration form submission
const onSubmit = handleSubmit(async (values: UserRegisterInput) => {
  const result = await authStore.registerUser({
    email: values.email,
    password: values.password,
  })

  if (result.success) {
    toast.success('Registration successful! Redirecting...')
    // Use a small delay before navigation to ensure toast is shown
    setTimeout(() => {
      navigateTo("/")
    }, 500)
  } else {
    toast.error(authStore.error?.message || 'Registration failed')
  }
})

// Handle Google Sign-In
const handleGoogleSignIn = async () => {
  try {
    console.log("Google sign-in initiated")

  } catch (error) {
    console.error("Google sign-in error:", error)
  }
}

// Toggle password visibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Computed property for loading state
const isLoading = computed(() => authStore.isLoading)
</script>

<template>
  <div class="w-2/5 flex flex-col gap-y-8 justify-start  ">
    <h1 class="text-primary-normal font-bold text-center mobile:text-left text-[30px] mobile:text-[35px] lg:text-[38px] mb-3">
      Welcome To Trilex!
    </h1>



    <form @submit="onSubmit" class="space-y-4">
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

      <FormField v-slot="{ componentField }" name="password">
        <FormItem>
          <FormLabel class="text-lg text-gray-700 font-semibold">
            Password
          </FormLabel>
          <FormControl>
            <div class="relative">
              <Input
                v-bind="componentField"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                :disabled="isLoading"
                class="w-full p-2 ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal pr-12"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600"
              >
                <Icon v-if="showPassword" icon="mdi:eye" class="w-5 h-5" />
                <Icon v-else icon="mdi:eye-off" class="w-5 h-5" />
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

         <FormField v-slot="{ componentField }" name="confirmPassword">
        <FormItem>
          <FormLabel class="text-lg text-gray-700 font-semibold">
            Re-enter Password
          </FormLabel>
          <FormControl>
            <div class="relative">
              <Input
                v-bind="componentField"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Re-enter your password"
                :disabled="isLoading"
                class="w-full p-2 ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal pr-12"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600"
              >
                <Icon v-if="showPassword" icon="mdi:eye" class="w-5 h-5" />
                <Icon v-else icon="mdi:eye-off" class="w-5 h-5" />
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
          class="w-full px-4 py-6 font-semibold text-white text-lg bg-primary-normal hover:bg-primary-normal/90 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Icon v-if="isLoading" name="mdi:loading" class="w-5 h-5 animate-spin" />
          {{ isLoading ? "Loading..." : "Register Now" }}
        </Button>
      </div>
    </form>

    <p class="text-slate-600 w-full text-center">
      Already have an account?
      <span
        @click="navigateTo('/login')"
        class="text-primary-normal font-semibold cursor-pointer underline"
      >
        Login Now
      </span>
    </p>

    <div class="w-full relative flex justify-center items-center">
      <div class="w-[80px] h-1 border-b-2 border-primary-normal" />
      <span class="px-2 absolute text-lg text-primary-normal font-semibold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2] bg-white">
        OR
      </span>
    </div>

    <Button
      @click="handleGoogleSignIn"
      type="button"
      class="w-full px-4 py-2 flex items-center justify-center gap-x-2 bg-[#f2f2f2] hover:bg-[#e8e8e8] border-2 border-gray-200 rounded-md font-semibold"
    >
      <Icon name="mdi:google" class="w-6 h-6" />
      <span>Continue with Google</span>
    </Button>

    <!-- Lawyer Registration Option -->
    <p class="text-slate-600 w-full text-center">
      Want to register as a lawyer?
      <span
        @click="navigateTo('/lawyer-register')"
        class="text-primary-normal font-semibold cursor-pointer underline"
      >
        Register Here
      </span>
    </p>
  </div>
</template>

