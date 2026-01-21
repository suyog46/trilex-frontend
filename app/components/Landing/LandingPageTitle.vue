<template>
  <div class="w-full space-y-2 text-center py-8">
    <h1 class="text-4xl leading-relaxed text-primary-normal font-bold">
      {{ heading }}
    </h1>
    <p class="text-lg text-gray-600 leading-relaxed">
      {{ subheading }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  heading: string
  subheading: string
}>()
</script>
