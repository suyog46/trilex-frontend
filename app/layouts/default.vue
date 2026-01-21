<template>
  <div class="flex flex-col min-h-screen bg-white border border-blue-400">
    <!-- Navigation Bar -->
    <Navbar />
    
    <!-- Main Content Area -->
    <main class="flex-1 w-full">
      <slot />
    </main>
    
    <!-- Footer (optional) -->
    <!-- <Footer /> -->
  </div>
</template>

<script setup lang="ts">
import Navbar from "~/components/layout/Navbar.vue"
// import Footer from "~/components/layout/Footer.vue"
</script>