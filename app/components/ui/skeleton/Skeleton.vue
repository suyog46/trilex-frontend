<script setup lang="ts">
defineProps<{
  class?: string
}>()
</script>

<template>
  <div 
    :class="['animate-pulse rounded-md bg-primary-light/60', $props.class]"
  />
</template>
