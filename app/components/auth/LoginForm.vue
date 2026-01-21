<template>
  <div class="w-2/5 flex flex-col gap-y-8 justify-start  ">
    <h1 class="text-primary-normal font-bold text-center mobile:text-left text-[30px] mobile:text-[35px] lg:text-[38px] mb-3">
      Welcome Back!
    </h1>

    <Form :submit="onSubmit"  class="space-y-4">
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

      <!-- Password Field -->
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
                <Icon v-if="showPassword" name="mdi:eye" class="w-5 h-5" />
                <Icon v-else name="mdi:eye-off" class="w-5 h-5" />
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Submit Button -->
      <div class="w-full pt-3">
        <Button
          type="submit"
          :disabled="isLoading"
          class="w-full px-4 py-6 font-semibold text-white text-lg bg-primary-normal hover:bg-primary-normal/90 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Icon v-if="isLoading" name="mdi:loading" class="w-5 h-5 animate-spin" />
          {{ isLoading ? "Loading..." : "Login Now" }}
        </Button>
      </div>
    </Form>

    <!-- Register Link -->
    <p class="text-slate-600 w-full text-center">
      Don't have an account?
      <span
        @click="navigateTo('/user-register')"
        class="text-primary-normal font-semibold cursor-pointer underline"
      >
        Register Now
      </span>
    </p>

    <!-- Divider -->
    <div class="w-full relative flex justify-center items-center">
      <div class="w-[80px] h-1 border-b-2 border-primary-normal" />
      <span class="px-2 absolute text-lg text-primary-normal font-semibold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2] bg-white">
        OR
      </span>
    </div>

    <!-- Google Sign-In Button -->
    <Button
      @click="handleGoogleSignIn"
      type="button"
      class="w-full px-4 py-2 flex items-center justify-center gap-x-2 bg-[#f2f2f2] hover:bg-[#e8e8e8] border-2 border-gray-200 rounded-md font-semibold"
    >
      <Icon name="mdi:google" class="w-6 h-6" />
      <span>Continue with Google</span>
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { loginSchema, type LoginInput } from "~/lib/validations/auth";
import { useForm } from "vee-validate"


const showPassword = ref(false);

const { handleSubmit } = useForm({
  validationSchema: loginSchema,
})

// Use the auth queries composable
const { loginMutation } = useAuthQueries();

// Handle login form submission
const onSubmit = handleSubmit((values: any) => {
  console.log("Form submitted with values:", values);
  // loginMutation.mutate(values as LoginInput);
});

// Handle Google Sign-In
const handleGoogleSignIn = async () => {
  try {
    // Replace with your actual Google OAuth implementation
    console.log("Google sign-in initiated");
    // Implementation depends on your auth setup
  } catch (error) {
    console.error("Google sign-in error:", error);
  }
};

// Toggle password visibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

// Computed property for loading state
const isLoading = computed(() => loginMutation.isPending.value);
</script>
