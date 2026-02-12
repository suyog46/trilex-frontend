<script setup lang="ts">
import DocumentsView from '~/components/cases/DocumentsView.vue'

definePageMeta({
  layout: 'client',
  middleware: ['auth', 'client'],
})
</script>

<template>
  <DocumentsView scope="client" />
</template>