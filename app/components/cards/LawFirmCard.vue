<template>
  <div class="w-[340px] cursor-pointer rounded-lg flex flex-col p-6 bg-white border border-primary-light-active hover:shadow-xl transition-shadow duration-300">
    <!-- Image -->
    <div class="w-full h-48 bg-gradient-to-br from-primary-light-active to-primary-light rounded-lg mb-4 flex items-center justify-center">
      <Icon icon="mdi:building" class="w-16 h-16 text-primary-normal" />
    </div>

    <!-- Content -->
    <div class="flex flex-col gap-4">
      <!-- Firm Info -->
      <div>
        <h2 class="text-2xl font-semibold text-primary-normal mb-2">Firm Name</h2>
        <p class="text-gray-600">
          Specializing in corporate law and intellectual property rights.
        </p>
      </div>

      <!-- Stats -->
      <div class="flex flex-col gap-2 border-t border-primary-light-active pt-4">
        <div class="flex justify-between items-center">
          <p class="text-gray-500 font-medium">Experience</p>
          <p class="text-gray-700 font-semibold">10 years</p>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-gray-500 font-medium">Lawyers</p>
          <p class="text-gray-700 font-semibold">30+</p>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-gray-500 font-medium">Location</p>
          <p class="text-gray-700 font-semibold">Kathmandu, Lalitpur</p>
        </div>
      </div>

      <!-- View Button -->
      <NuxtLink
        to="/law-firm-detail"
        class="w-full py-2 mt-4 bg-primary-normal text-white font-semibold rounded-lg hover:bg-primary-normal-hover transition-colors text-center"
      >
        View Details
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
</script>
