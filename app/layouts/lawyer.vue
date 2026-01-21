<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import Sidebar from '~/composables/lawyer/sidebar.vue';
import UserAvatar from '@/components/ui/UserAvatar.vue'



</script>

<template>
  <div class="min-h-screen flex gap-3   px-4">
  <div class="pt-20 border-r border-gray-200 px-3">
    <Sidebar/>

  </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 px-8 py-4">
        <div class="flex items-center justify-between">
          <!-- Search -->
          <div class="relative max-w-md flex-1">
            <Icon icon="material-symbols-light:search-rounded" 
            class=" absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search Here"
              class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal"
            />
          </div>

          <!-- Right Section -->
          <div class="flex items-center gap-6">
            <!-- Notifications -->
            <button class="relative">
              <Icon icon="mdi:email-outline" class="w-6 h-6 text-gray-600" />
              <span class="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
            </button>
            <button class="relative">
              <Icon icon="mdi:bell-outline" class="w-6 h-6 text-gray-600" />
              <span class="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
            </button>

            <!-- User Profile -->
            <div class="flex items-center  gap-2 justify-center  ">
              <span class="font-medium text-gray-700">Suyog Lamsal</span>
              <div class="flex items-center">
                  <div class="">
                    <UserAvatar
                    name="Suyog"
                    :image="null"
                    :size="36"
                    />     
                  </div>
                <Icon
                icon="mdi:chevron-down"
                class="w-5 h-5 transition-transform"
                />     
              </div> 
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-8 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
