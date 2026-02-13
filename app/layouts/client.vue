<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { toast } from 'vue-sonner'
import Navbar from '~/components/layout/Navbar.vue'

const route = useRoute()
const authStore = useAuthStore()
const isLoadingVerification = ref(false)
const sidebarOpen = ref(true)

const isActive = (path: string) => {
  return route.path === path
}

onMounted(async () => {
  isLoadingVerification.value = true
  try {
    if (!authStore.clientVerificationStatus) {
      await authStore.getClientVerificationStatus()
    }
  } catch (error) {
    console.error('Error fetching verification status:', error)
  } finally {
    isLoadingVerification.value = false
  }
})

const isVerified = computed(() => {
  return authStore.clientVerificationStatus?.status === 'VERIFIED'
})

const verificationStatus = computed(() => {
  return authStore.clientVerificationStatus?.status
})

const sidebarItems = [
  {
    label: 'AI Assistant',
    icon: 'mdi:robot-happy-outline',
    path: '/client/ai-assistant',
    requiresVerification: true,
  },
  {
    label: 'Dashboard',
    icon: 'mdi:home',
    path: '/client/dashboard',
    requiresVerification: false,
  },
  {
    label: 'My Bookings',
    icon: 'mdi:calendar',
    path: '/client/bookings',
    requiresVerification: true,
  },
  {
    label: 'My Cases',
    icon: 'mdi:briefcase',
    path: '/client/cases',
    requiresVerification: true,
  },
  {
    label: 'Messages',
    icon: 'mdi:message',
    path: '/client/messages',
    requiresVerification: true,
  },
 {
    label: 'Documents',
    icon: 'mdi:file-document-outline',
    path: '/client/documents',
    requiresVerification: true,
  },
  // {
  //   label: 'Profile',
  //   icon: 'mdi:account',
  //   path: '/client/profile',
  //   requiresVerification: false,
  // },
  {
    label: 'Verification',
    icon: 'mdi:shield-check',
    path: '/client/verification-status',
    requiresVerification: false,
    badge: verificationStatus.value === 'VERIFIED' ? 'check' : verificationStatus.value === 'PENDING' ? 'pending' : 'alert',
  },

]

const clientSidebarRoutes = [
  '/client/ai-assistant',
  '/client/dashboard',
  '/client/bookings',
  '/client/cases',
  '/client/messages',
  '/client/documents',
  '/client/verification-status',
]

const forceWhiteNavbar = computed(() => {
  if (route.path.startsWith('/client/cases/')) return true
  return clientSidebarRoutes.includes(route.path)
})

const handleItemClick = (item: any) => {
  if (item.requiresVerification && !isVerified.value) {
    toast.error('Please verify your profile to access this feature')
    navigateTo('/client/verification-status')
    return
  }
  navigateTo(item.path)
}

const handleBackToHome = () => {
  navigateTo('/')
}
</script>

<template>
  <div class="h-[95vh] flex flex-col bg-gray-50">
    <!-- <header class="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div class="h-16 flex items-center justify-between px-8">
        <div class="flex items-center gap-4">
          <button
            @click="sidebarOpen = !sidebarOpen"
            class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Icon
              :icon="sidebarOpen ? 'mdi:close' : 'mdi:menu'"
              class="w-6 h-6 text-gray-600"
            />
          </button>
          <NuxtLink to="/" class="flex items-center gap-2">
            <span class="text-xl font-bold text-primary-normal hidden sm:inline">Trilex</span>
          </NuxtLink>
        </div>

        <div class="flex items-center gap-6">
          <div class="relative hidden sm:block max-w-xs">
            <Icon
              icon="material-symbols-light:search-rounded"
              class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            />
            <input
              type="search"
              placeholder="Search..."
              class="pl-9 pr-4 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal"
            />
          </div>

          <button
            class="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <Icon icon="mdi:bell-outline" class="w-6 h-6 text-gray-600" />
            <span class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button
            class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="User menu"
          >
            <div class="w-8 h-8 rounded-full bg-primary-normal text-white flex items-center justify-center text-sm font-semibold">
              {{ authStore.user?.fullName?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <Icon icon="mdi:chevron-down" class="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header> -->
    <Navbar :force-white="forceWhiteNavbar" />


    <div class="flex pt-16 h-[calc(100vh-4rem)]">
      <aside
        :class="[
          'fixed lg:static top-16 left-0 w-64 bg-white border-r border-gray-200 z-30 transition-transform duration-300 overflow-y-auto h-[calc(100vh-4rem)]',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]"
      >
        <nav class="p-4 space-y-2">
          <div v-for="item in sidebarItems" :key="item.path" class="relative">
            <button
              @click="handleItemClick(item)"
              :disabled="item.requiresVerification && !isVerified"
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left',
                isActive(item.path)
                  ? 'bg-primary-normal text-white'
                  : item.requiresVerification && !isVerified
                    ? 'opacity-50 cursor-not-allowed text-gray-500'
                    : 'text-gray-700 hover:bg-primary-light'
              ]"
              :title="item.requiresVerification && !isVerified ? 'Please verify your profile first' : item.label"
            >
              <Icon :icon="item.icon" class="w-5 h-5" />
              <span class="text-sm font-medium flex-1">{{ item.label }}</span>

              <div v-if="item.label === 'Verification' && !isVerified" class="flex items-center gap-2">
                <Icon
                  v-if="item.badge === 'pending'"
                  icon="mdi:clock"
                  :class="isActive(item.path) ? 'text-white' : 'text-yellow-500'"
                  class="w-4 h-4"
                />
                <Icon
                  v-else
                  icon="mdi:alert-circle"
                  :class="isActive(item.path) ? 'text-white' : 'text-red-500'"
                  class="w-4 h-4"
                />
              </div>

              <Icon
                v-if="item.requiresVerification && !isVerified"
                icon="mdi:lock"
                class="w-4 h-4 text-gray-400 absolute right-2"
              />
            </button>
          </div>
        </nav>

        <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            @click="handleBackToHome"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors text-sm font-medium"
          >
            <Icon icon="mdi:home-outline" class="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </aside>

      <!-- Overlay for mobile -->
      <div
        v-if="sidebarOpen"
        @click="sidebarOpen = false"
        class="lg:hidden fixed inset-0 bg-black/50 z-20"
      ></div>

      <!-- Main Content -->
      <main class="flex-1 overflow-auto h-[calc(100vh-4rem)]">
        <div class="p-4 lg:p-8">
          <!-- Verification Banner -->
          <div
            v-if="!isVerified && verificationStatus !== 'PENDING'"
            class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-4"
          >
            <Icon icon="mdi:alert-circle" class="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
            <div class="flex-1">
              <h3 class="font-semibold text-yellow-900 mb-1">Profile Verification Required</h3>
              <p class="text-sm text-yellow-800 mb-3">
                Please verify your identity to unlock all features and complete bookings.
              </p>
              <button
                @click="navigateTo('/client/verification-status')"
                class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Verify Now
              </button>
            </div>
          </div>

          <!-- Pending Banner -->
          <div
            v-if="verificationStatus === 'PENDING'"
            class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-4"
          >
            <Icon icon="mdi:clock-outline" class="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div class="flex-1">
              <h3 class="font-semibold text-blue-900 mb-1">Verification Under Review</h3>
              <p class="text-sm text-blue-800">
                Your profile is being verified. This usually takes 24-48 hours. You'll have limited access until verification is complete.
              </p>
            </div>
          </div>

          <!-- Page Content Slot -->
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
