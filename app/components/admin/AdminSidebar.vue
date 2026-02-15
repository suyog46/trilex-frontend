<script setup lang="ts">
import { useRoute } from '#app'
import { ref, watchEffect } from 'vue'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const openDropdown = ref<string | null>(null)

const handleLogout = async () => {
  await authStore.logout()
  navigateTo('/login')
}

const isActive = (path: string) => {
  return route.path === path
}

const isChildActive = (paths: string[]) => {
  return paths.some(p => route.path.startsWith(p))
}

const links = [
  {
    title: "Dashboard",
    icon: "material-symbols-light:dashboard-outline-rounded",
    isDropdown: false,
    link: "/admin/dashboard"
  },
  {
    title: "Case Categories",
    icon: "mdi:folder-outline",
    isDropdown: false,
    link: "/admin/case-categories"
  },
  {
    title: "Verifications",
    icon: "mdi:check-circle-outline",
    isDropdown: true,
    dropdown: [
      {
        title: "Firm Verifications",
        link: "/admin/firm-verifications"
      },
      {
        title: "Lawyer Verifications",
        link: "/admin/lawyer-verifications"
      },
        {
        title: "Client Verifications",
        link: "/admin/client-verifications"
      }
    ]
  },
  {
    title: "Settings",
    icon: "mdi:cog-outline",
    isDropdown: false,
    link: "/admin/settings"
  }
]

watchEffect(() => {
  links.forEach(item => {
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
  <aside class="w-64 space-y-6 h-screen bg-white border-r border-gray-200 relative">
    <div class="px-6 py-4">
      <h2 class="text-lg font-bold text-primary-normal">Admin Panel</h2>
    </div>

    <ul class="space-y-2 px-4 pb-20">
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
                ? 'bg-primary-normal/10 text-primary-normal'
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
            <div class="flex flex-col items-start gap-4 w-full py-2">
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

    <div class="absolute bottom-0 left-0 w-64 p-4 border-t border-gray-200 bg-white">
      <button
        @click="handleLogout"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        <Icon icon="mdi:logout" class="w-5 h-5" />
        <span>Logout</span>
      </button>
    </div>
  </aside>
</template>
