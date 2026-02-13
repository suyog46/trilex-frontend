<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import { onMounted, onUnmounted } from 'vue'
import Sidebar from '~/composables/sidebar.vue';
import UserAvatar from '@/components/ui/UserAvatar.vue'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '~/stores/auth'
import { toast } from 'vue-sonner'

const authStore = useAuthStore()
const isLoadingVerification = ref(false)
const showUserDropdown = ref(false)
const isLoggingOut = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  isLoadingVerification.value = true
  try {
    if (!authStore.lawyerVerificationStatus) {
      await authStore.getLawyerVerificationStatus()
    }
  } catch (error) {
    console.error('Error fetching verification status:', error)
  } finally {
    isLoadingVerification.value = false
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showUserDropdown.value = false
  }
}

const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}

const handleLogout = async () => {
  isLoggingOut.value = true
  try {
    await authStore.logout()
    toast.success('Logged out successfully')
    navigateTo('/login')
  } catch (error) {
    console.error('Logout error:', error)
    toast.error('Failed to logout')
  } finally {
    isLoggingOut.value = false
    showUserDropdown.value = false
  }
}

const isVerificationBlocked = computed(() => {
  const status = authStore.lawyerVerificationStatus?.status
  return status === 'PENDING' || status === 'REJECTED'
})

const verificationMessage = computed(() => {
  if (authStore.lawyerVerificationStatus?.status === 'PENDING') {
    return 'Your verification is under review. Dashboard features are temporarily disabled.'
  }
  if (authStore.lawyerVerificationStatus?.status === 'REJECTED') {
    return 'Your verification was rejected. Please resubmit to regain access.'
  }
  return ''
})
</script>

<template>
  <div class="flex gap-3 px-4 relative h-screen">
    <div class="pt-20 border-r border-gray-200 px-3 h-full overflow-y-auto" :class="{ 'opacity-50 pointer-events-none': isVerificationBlocked }">
      <Sidebar/>
    </div>

    <div class="flex-1 flex flex-col h-screen">
      <header class="bg-white border-b border-gray-200 px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="relative max-w-md flex-1">
            <Icon icon="material-symbols-light:search-rounded" 
            class=" absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search Here"
              class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal"
            />
          </div>

          <div class="flex items-center gap-6">
            <Button
              v-if="authStore.user?.role !== 'client'"
              @click="navigateTo('/cases/create-case')"
              class="bg-primary-normal hover:bg-primary-normal/90 text-white px-4 py-2"
            >
              <Icon icon="mdi:plus" class="w-5 h-5 mr-2" />
              Create Case
            </Button>
            
       
            <NotificationDropdown />

            <div ref="dropdownRef" class="relative">
              <button 
                @click="toggleUserDropdown"
                class="flex items-center gap-2 justify-center hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
              >
                <span class="font-medium text-gray-700">{{ authStore.user?.fullName || 'User' }}</span>
                <div class="flex items-center">
                  <div class="">
                    <UserAvatar
                      :name="authStore.user?.fullName || 'User'"
                      :image="null"
                      :size="36"
                    />     
                  </div>
                  <Icon
                    icon="mdi:chevron-down"
                    class="w-5 h-5 transition-transform"
                    :class="{ 'rotate-180': showUserDropdown }"
                  />     
                </div> 
              </button>

              <div 
                v-if="showUserDropdown"
                class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
              >
                <button
                  @click="handleLogout"
                  :disabled="isLoggingOut"
                  class="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Icon icon="mdi:logout" class="w-5 h-5" />
                  <span>{{ isLoggingOut ? 'Logging out...' : 'Logout' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1 p-8 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
