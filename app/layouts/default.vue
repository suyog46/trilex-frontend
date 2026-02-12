<template>
  <div class="flex flex-col min-h-screen bg-white border border-blue-400">
    <Navbar />
    
    <main class="flex-1 w-full">
      <slot />
    </main>
    
  
  </div>
</template>

<script setup lang="ts">
import Navbar from "~/components/layout/Navbar.vue"
</script>