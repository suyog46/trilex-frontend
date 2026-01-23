<script setup lang="ts">
import LawyerSignupForm from '~/components/auth/LawyerSignupForm.vue'

definePageMeta({
  middleware: ['guest'],
})
</script>

<template>
  <div class="min-h-screen w-full bg-gradient-to-b from-white to-gray-50 px-4 py-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-center">
        <LawyerSignupForm mode="lawyer" />
      </div>
    </div>
  </div>
</template>
