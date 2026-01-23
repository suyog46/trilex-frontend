<script setup lang="ts">
withDefaults(defineProps<{
  basis?: string
}>(), {
  basis: '25%',
})
</script>

<template>
  <div class="min-w-0 shrink-0 grow-0" :style="{ flexBasis: basis }">
    <slot />
  </div>
</template>
