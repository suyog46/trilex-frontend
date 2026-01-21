<template>
  <div id="app" class="min-h-screen bg-white">
    <!-- Page announcer for accessibility -->
    <NuxtRouteAnnouncer />
    
    <ClientOnly>
      <Toaster position="top-right" :rich-colors="true" />
    </ClientOnly>
    
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { Toaster } from '~/components/ui/sonner'
import 'sonner/dist/styles.css'

useHead({
  htmlAttrs: {
    lang: 'en',
  },
  titleTemplate: '%s | Trilex',
  meta: [
    { 
      name: 'viewport', 
      content: 'width=device-width, initial-scale=1' 
    },
    { 
      name: 'description', 
      content: 'Trilex - Your gateway to seamless experiences' 
    },
    {
      name: 'theme-color',
      content: '#ffffff'
    }
  ],
})
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
}

/* Ensure toasts render above all content */
:deep(.sonner-toaster) {
  z-index: 9999 !important;
  position: fixed !important;
}

:deep(.sonner-toast) {
  z-index: 9999 !important;
}
</style>
