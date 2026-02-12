<script setup lang="ts">
import { useRoute } from '#app'
import { ref, computed, watchEffect } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { toast } from 'vue-sonner'

const route = useRoute()
const authStore = useAuthStore()
const openDropdown = ref<string | null>(null)
const isLoggingOut = ref(false)

const isActive = (path: string) => {
  return route.path === path
}

const isChildActive = (paths: string[]) => {
  return paths.some(p => route.path.startsWith(p))
}

// Handle logout
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
  }
}

const links = computed(() => {
  const userRole = authStore.user?.role
  const baseLinks = [
    {
      title: "AI Assistant",
      icon: "mdi:robot-happy-outline",
      isDropdown: false,
      link: userRole === 'lawyer' ? '/lawyer/ai-assistant' : userRole === 'firm' ? '/law-firm/ai-assistant' : '/client/ai-assistant'
    },
    {
      title: "Dashboard",
      icon: "material-symbols-light:dashboard-outline-rounded",
      isDropdown: false,
      link: "/dashboard"
    },
    {
      title: "Booking",
      icon: "icon-park-outline:folder",
      isDropdown: false,
      link: "/booking"

    },
    {
      title: "Cases",
      icon: "mdi:folder-outline",
      isDropdown: true,
      dropdown: [
        {
          title: "Draft Cases",
          link: "/cases/draft"
        },
        {
          title: "Ongoing Cases",
          link: "/cases/ongoing"
        },
        {
          title: "Completed Cases",
          link: "/cases/completed"
        },
          {
          title: "Registered Cases",
          link: "/cases/registered"
        }
      ]
    },
    {
      title: "Documents",
      icon: "mdi:file-document-outline",
      isDropdown: false,
      link: "/documents"
    },
    {
      title: "Messages",
      icon: "mdi:message",
      isDropdown: false,
      link: "/messages"
    },

  ]

  if (authStore.user?.role === 'firm') {
    baseLinks.push({
      title: "User Management",
      icon: "mdi:account-multiple-outline",
      isDropdown: false,
      link: "/user-management"
    }

  )

  }
   if (authStore.user?.role === 'lawyer') {
    baseLinks.push(
    {
      title: "Firm Requests",
      icon: "material-symbols-light:dashboard-outline-rounded",
      isDropdown: false,
      link: "/firm-request"
    },

  )
  }


  // baseLinks.push({
  //   title: "Settings",
  //   icon: "mdi:cog-outline",
  //   isDropdown: false,
  //   link: "/settings"
  // })

  return baseLinks
})

watchEffect(() => {
  links.value.forEach(item => {
    if (item.isDropdown) {
      const paths = item.dropdown!.map(d => d.link)
      if (isChildActive(paths)) {
        openDropdown.value = item.title
      }
    }
  })
})

const toggleDropdown = (title: string) => {
  openDropdown.value = openDropdown.value === title ? null : title
}
</script>

<template>
  <aside class="w-64 space-y-6 h-screen">
    <p class="text-lg">Menu</p>

    <ul class="space-y-2">
      <li v-for="item in links" :key="item.title">
        <NuxtLink
          v-if="!item.isDropdown && item.link"
          :to="item.link"
          class="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors"
          :class="
            isActive(item.link)
              ? 'bg-primary-normal text-white'
              : 'text-gray-700 hover:bg-gray-100'
          "
        >
          <Icon :icon="item.icon" class="w-5 h-5" />
          <span>{{ item.title }}</span>
        </NuxtLink>

        <div v-else>
          <button
            @click="toggleDropdown(item.title)"
            class="w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-colors"
            :class="
              openDropdown === item.title
                ? 'bg-secondary text-gray-900'
                : 'text-gray-700 hover:bg-gray-100'
            "
          >
            <div class="flex items-center gap-3">
              <Icon :icon="item.icon" class="w-5 h-5" />
              <span>{{ item.title }}</span>
            </div>
            <Icon
              icon="mdi:chevron-down"
              class="w-5 h-5 transition-transform"
              :class="{ 'rotate-180': openDropdown === item.title }"
            />
          </button>

          <div v-if="openDropdown === item.title" class="mt-1 space-y-1 rounded-md flex justify-center">
            <div class="flex flex-col items-start gap-2 w-full">
              <NuxtLink
                v-for="child in item.dropdown"
                :key="child.title"
                :to="child.link"
                class="py-2 text-sm rounded-lg transition-colors px-10 w-full"
                :class="
                  isActive(child.link)
                    ? 'bg-primary-normal text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                "
              >
                {{ child.title }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </li>
    </ul>

    <div class="pt-4 border-t border-gray-200">
      <button
        @click="handleLogout"
        :disabled="isLoggingOut"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-red-600 hover:bg-red-50"
      >
        <Icon icon="mdi:logout" class="w-5 h-5" />
        <span>{{ isLoggingOut ? 'Logging out...' : 'Logout' }}</span>
      </button>
    </div>
  </aside>
</template>
