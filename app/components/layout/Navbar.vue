
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'

const isSticky = ref(false)
let unsubscribe: (() => void) | null = null
const authStore = useAuthStore()

// Use computed properties for reactivity instead of destructuring
const isAuthenticated = computed(() => {
  const result = authStore.isAuthenticated
  if (result) {
    console.log('Navbar: User IS authenticated')
  } else {
    console.log('❌ Navbar: User NOT authenticated')
  }
  return result
})
const user = computed(() => authStore.user)
console.log("user is ", user.value)

// Verification status computed property - use user.verification from /me endpoint
const verificationStatus = computed(() => {
  return user.value?.verification?.status || null
})

// Check if user is verified
const isVerified = computed(() => {
  return user.value?.verification?.status === 'VERIFIED'
})

// Verification page path based on role
const verificationPagePath = computed(() => {
  if (user.value?.role === 'lawyer') {
    return '/lawyer/verification-status'
  } else if (user.value?.role === 'firm') {
    return '/firm/verification-status'
  } else if (user.value?.role === 'client') {
    return '/client/verification-status'
  }
  return '/dashboard'
})

const navLinks = [
  { title: 'Find Lawyer', path: '/client/lawyers' },
  { title: 'Find Law Firm', path: '/client/firms' },
  { title: 'About Us', path: '/about-us' },
  { title: 'Case Enquiry', path: '/case-enquiry' },
]

const userMenuItems = [
  { label: 'Wishlist', path: '/wishlist' },
  { label: 'Recent History', path: '/recent-history' },
  { label: 'My Cases', path: '/my-cases' },
  { label: 'Settings', path: '/settings' },
  { label: 'Help Center', path: '/help-center' },
]

const handleLogout = async () => {
  await authStore.logout()
  navigateTo('/login')
}

const getDashboardPath = () => {
  if (user.value?.role === 'lawyer') {
    return '/lawyer/dashboard'
  } else if (user.value?.role === 'law_firm') {
    return '/firm/dashboard'
  } else if (user.value?.role === 'client') {
    return '/client/dashboard'
  }
  return '/dashboard'
}

onMounted(() => {
  const handleScroll = () => {
    isSticky.value = window.scrollY > 80
  }

  window.addEventListener('scroll', handleScroll)

  unsubscribe = () => {
    window.removeEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>
<template>
  <div>
    <Disclosure as="nav">
      <template #default="{ open }">
        <header
          :class="[
            'w-full h-16 z-[9999999] flex items-center transition-all duration-300',
            isSticky 
              ? 'fixed top-0 bg-primary-normal text-white shadow-lg' 
              : 'absolute top-0 bg-transparent text-primary-normal'
          ]"
        >
          <nav class="w-full h-full flex items-center justify-between px-4 md:px-8">
            <!-- Logo -->
            <div class="flex-shrink-0">
              <NuxtLink to="/" class="flex items-center gap-2">
                <span class="text-2xl font-bold bg-gradient-to-r from-primary-normal to-primary-normal-hover bg-clip-text text-transparent">
                  Trilex
                </span>
              </NuxtLink>
            </div>

            <!-- Desktop Navigation Links -->
            <ul class="hidden lg:flex gap-7 text-lg font-medium">
              <li v-for="link in navLinks" :key="link.path">
                <NuxtLink
                  :to="link.path"
                  :class="[
                    'transition-colors duration-200',
                    isSticky 
                      ? 'text-white hover:text-primary-light-active' 
                      : 'text-primary-normal hover:text-primary-normal-hover'
                  ]"
                >
                  {{ link.title }}
                </NuxtLink>
              </li>
            </ul>

            <!-- Right Side Actions -->
            <div class="flex items-center gap-4">
              <!-- Search Button (Hidden on mobile) -->
              <button
                class="hidden lg:flex items-center justify-center p-2 rounded-lg transition-colors"
                :class="isSticky ? 'hover:bg-primary-normal-hover' : 'hover:bg-primary-light-active'"
                aria-label="Search"
              >
                <Icon icon="mdi:magnify" :class="['w-5 h-5', isSticky ? 'text-white' : 'text-primary-normal']" />
              </button>

              <!-- Verification Status Indicator -->
              <!-- <button
                v-if="isAuthenticated && verificationStatus"
                class="hidden sm:flex items-center justify-center p-2 rounded-lg transition-colors relative"
                :class="isSticky ? 'hover:bg-primary-normal-hover' : 'hover:bg-primary-light-active'"
                :title="verificationStatusTitle"
              >
            
                />
              </button> -->

              <!-- Notification Button (Hidden on mobile) -->
              <button
                v-if="isAuthenticated"
                class="hidden sm:flex items-center justify-center p-2 rounded-lg transition-colors relative"
                :class="isSticky ? 'hover:bg-primary-normal-hover' : 'hover:bg-primary-light-active'"
                aria-label="Notifications"
              >
                <Icon icon="mdi:bell" :class="['w-5 h-5', isSticky ? 'text-white' : 'text-primary-normal']" />
                <span class="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                  5
                </span>
              </button>

              <!-- Mobile Menu Button -->
              <DisclosureButton class="lg:hidden inline-flex items-center justify-center p-2 rounded-lg transition-colors"
                :class="isSticky ? 'hover:bg-primary-normal-hover' : 'hover:bg-primary-light-active'"
                :aria-label="open ? 'Close menu' : 'Open menu'"
              >
                <Icon 
                  :icon="open ? 'mdi:close' : 'mdi:menu'" 
                  :class="['w-6 h-6', isSticky ? 'text-white' : 'text-primary-normal']"
                />
              </DisclosureButton>

              <!-- User Menu / Login Button -->
              <div class="flex items-center gap-2">
                <!-- Show user menu only if authenticated -->
                <template v-if="isAuthenticated">
                  <Menu as="div" class="relative">
                    <MenuButton
                      :class="[
                        'flex items-center justify-center w-8 h-8 rounded-full transition-colors',
                        isSticky 
                          ? 'bg-primary-light hover:bg-primary-light-hover' 
                          : 'bg-primary-light-active hover:bg-primary-light-hover'
                      ]"
                      aria-label="User menu"
                    >
                    
                      <Icon icon="mdi:account" class="w-5 h-5 text-primary-normal" />
                      <!-- Show verified checkmark only if user has verification status VERIFIED -->
                      <Icon 
                        v-if="isVerified"
                        icon="mdi:check-circle" 
                        class="absolute w-5 h-5 -bottom-1 -right-2 text-green-500"
                      />
                    </MenuButton>

                    <MenuItems class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden data-[closed]:hidden data-[open]:block">
                      <!-- User Info Section -->
                      <div class="px-4 py-4 border-b border-primary-light-active">
                        <div class="flex items-center gap-3">
                          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary-normal text-white font-semibold">
                            {{ user?.fullName?.charAt(0).toUpperCase() || 'U' }}
                          </div>
                          <div class="flex-1">
                            <p class="font-semibold text-gray-900">{{ user?.fullName || 'User' }}</p>
                            <p class="text-sm text-secondary-normal capitalize">{{ user?.role || 'User' }}</p>
                          </div>
                        </div>
                      </div>

                      <!-- Menu Items -->
                      <div class="py-2">
                        <MenuItem v-for="item in userMenuItems" :key="item.label">
                          <template #default="{ active }">
                            <NuxtLink
                              :to="item.path"
                              :class="[
                                'block w-full px-4 py-2 text-sm transition-colors',
                                active 
                                  ? 'bg-primary-light-active text-primary-normal' 
                                  : 'text-gray-700 hover:bg-primary-light'
                              ]"
                            >
                              {{ item.label }}
                            </NuxtLink>
                          </template>
                        </MenuItem>
                      </div>

                      <!-- Dashboard Button -->
                      <div class="px-4 py-2 border-t border-primary-light-active">
                        <NuxtLink
                          :to="getDashboardPath()"
                          class="block w-full px-4 py-2 text-sm font-semibold text-center text-white bg-primary-normal rounded-md hover:bg-primary-normal-hover transition-colors"
                        >
                          Go to Dashboard
                        </NuxtLink>
                      </div>

                      <!-- Logout Button -->
                      <div class="px-4 py-2">
                        <button
                          @click="handleLogout"
                          class="w-full px-4 py-2 text-sm font-semibold text-center text-white bg-red-700 rounded-md hover:bg-red-600 transition-colors"
                        >
                        <Icon icon="mdi:logout" class="w-4 h-4 inline-block mr-2" />
                          Logout
                        </button>
                      </div>
                    </MenuItems>
                  </Menu>
                </template>

                <!-- Show login button only if not authenticated -->
                <NuxtLink
                  v-else
                  to="/login"
                  class="px-4 py-2 text-sm font-semibold text-white bg-primary-normal rounded-md hover:bg-primary-normal-hover transition-colors"
                >
                  Login
                </NuxtLink>
              </div>
            </div>
          </nav>
        </header>

        <!-- Mobile Menu Panel -->
        <DisclosurePanel class="lg:hidden fixed top-16 left-0 right-0 bg-primary-normal z-40">
          <div class="px-4 py-4 space-y-3">
            <!-- Mobile Navigation Links -->
            <NuxtLink
              v-for="link in navLinks"
              :key="link.path"
              :to="link.path"
              class="block px-4 py-2 text-white hover:bg-primary-normal-hover rounded-md transition-colors"
            >
              {{ link.title }}
            </NuxtLink>

            <!-- Mobile Menu Divider -->
            <div class="border-t border-primary-normal-hover py-3">
              <!-- Mobile User Menu Items (only if authenticated) -->
              <template v-if="isAuthenticated">
                <NuxtLink
                  v-for="item in userMenuItems"
                  :key="item.label"
                  :to="item.path"
                  class="block px-4 py-2 text-white hover:bg-primary-normal-hover rounded-md transition-colors"
                >
                  {{ item.label }}
                </NuxtLink>
              </template>
            </div>

            <!-- Mobile Buttons -->
            <div class="flex gap-2 pt-3 border-t border-primary-normal-hover">
              <!-- Show dashboard/logout if authenticated -->
              <template v-if="isAuthenticated">
                <NuxtLink
                  :to="getDashboardPath()"
                  class="flex-1 px-4 py-2 text-sm font-semibold text-center text-primary-normal bg-white rounded-md hover:bg-primary-light transition-colors"
                >
                  Dashboard
                </NuxtLink>
                <button
                  @click="handleLogout"
                  class="flex-1 px-4 py-2 text-sm font-semibold text-center text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </template>

              <!-- Show login/register if not authenticated -->
              <template v-else>
                <NuxtLink
                  to="/login"
                  class="flex-1 px-4 py-2 text-sm font-semibold text-center text-primary-normal bg-white rounded-md hover:bg-primary-light transition-colors"
                >
                  Login
                </NuxtLink>
                <NuxtLink
                  to="/register"
                  class="flex-1 px-4 py-2 text-sm font-semibold text-center text-white bg-primary-normal rounded-md hover:bg-primary-normal-hover transition-colors"
                >
                  Register
                </NuxtLink>
              </template>
            </div>
          </div>
        </DisclosurePanel>

        <!-- Spacer div for sticky header -->
        <div v-if="isSticky" class="h-16" />
      </template>
    </Disclosure>
  </div>
</template>
