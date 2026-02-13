<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { notificationsApi, type Notification } from '~/composables/api/notifications.api'
import { useChatSocket } from '~/composables/useChatSocket'
import { toast } from 'vue-sonner'

const showDropdown = ref(false)
const { unreadNotificationCount, notifications: socketNotifications } = useChatSocket()
const notifications = computed(() => socketNotifications.value)
const isLoading = ref(false)
const isLoadingMarkAll = ref(false)

const unreadNotifications = computed(() => {
  return notifications.value.filter(n => !n.is_read)
})

const fetchNotifications = async () => {
  isLoading.value = true
  try {
    const response = await notificationsApi.getNotifications({
      page: 1,
      page_size: 20
    })
    const combined = [...response.results, ...socketNotifications.value]
    const uniqueMap = new Map<string, Notification>()
    combined.forEach((item) => {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item)
      }
    })
    socketNotifications.value = Array.from(uniqueMap.values()).sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    console.log('Fetched notifications:', response.results)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    toast.error('Failed to load notifications')
  } finally {
    isLoading.value = false
  }
}

const handleMarkAsRead = async (notification: Notification) => {
  try {
    await notificationsApi.markAsRead(notification.id)
    notification.is_read = true
    unreadNotificationCount.value = Math.max(0, unreadNotificationCount.value - 1)
    toast.success('Notification marked as read')
  } catch (error) {
    console.error('Error marking notification as read:', error)
    toast.error('Failed to mark notification as read')
  }
}

const handleMarkAllAsRead = async () => {
  isLoadingMarkAll.value = true
  try {
    await notificationsApi.markAllAsRead()
    socketNotifications.value.forEach(n => n.is_read = true)
    unreadNotificationCount.value = 0
    toast.success('All notifications marked as read')
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    toast.error('Failed to mark all notifications as read')
  } finally {
    isLoadingMarkAll.value = false
  }
}

const getNotificationIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'booking_created': 'mdi:calendar-plus',
    'booking_accepted': 'mdi:check-circle',
    'booking_rejected': 'mdi:close-circle',
    'firm_invitation_received': 'mdi:email-receive',
    'firm_invitation_accepted': 'mdi:check-circle',
    'firm_invitation_rejected': 'mdi:close-circle',
  }
  return iconMap[type] || 'mdi:bell'
}

const getNotificationColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    'booking_created': 'text-blue-500',
    'booking_accepted': 'text-green-500',
    'booking_rejected': 'text-red-500',
    'firm_invitation_received': 'text-purple-500',
    'firm_invitation_accepted': 'text-green-500',
    'firm_invitation_rejected': 'text-red-500',
  }
  return colorMap[type] || 'text-gray-500'
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}

onMounted(() => {
  fetchNotifications()
})
</script>

<template>
  <div class="relative">
    <!-- Bell Button -->
    <button
      @click="showDropdown = !showDropdown"
      class="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group"
    >
      <Icon icon="mdi:bell-outline" class="w-6 h-6 text-gray-600" />
      
      <!-- Unread Badge -->
      <span
        v-if="unreadNotificationCount > 0"
        class="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full"
      >
        {{ unreadNotificationCount > 99 ? '99+' : unreadNotificationCount }}
      </span>
    </button>

    <!-- Dropdown Panel -->
    <div
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col max-h-96"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 class="font-semibold text-gray-900">Notifications</h3>
        <button
          v-if="unreadNotifications.length > 0"
          @click="handleMarkAllAsRead"
          :disabled="isLoadingMarkAll"
          class="text-xs text-primary-normal hover:text-primary-normal-hover disabled:opacity-50 font-medium"
        >
          {{ isLoadingMarkAll ? 'Marking...' : 'Mark all as read' }}
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto">
        <!-- Loading State -->
        <div v-if="isLoading" class="p-4 space-y-3">
          <div v-for="i in 3" :key="i" class="flex gap-3">
            <div class="w-10 h-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="notifications.length === 0" class="p-8 text-center">
          <Icon icon="mdi:bell-off-outline" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-600">No notifications yet</p>
        </div>

        <!-- Notifications List -->
        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            :class="{ 'bg-blue-50': !notification.is_read }"
          >
            <div class="flex gap-3">
              <!-- Icon -->
              <div class="flex-shrink-0">
                <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Icon :icon="getNotificationIcon(notification.type)" :class="['w-5 h-5', getNotificationColor(notification.type)]" />
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1">
                    <p class="font-semibold text-gray-900 text-sm">{{ notification.title }}</p>
                    <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ notification.message }}</p>
                  </div>
                  
                  <!-- Mark as Read Button -->
                  <button
                    v-if="!notification.is_read"
                    @click.stop="handleMarkAsRead(notification)"
                    class="flex-shrink-0 p-1 hover:bg-white rounded transition-colors"
                    title="Mark as read"
                  >
                    <Icon icon="mdi:check" class="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <!-- Time -->
                <p class="text-xs text-gray-500 mt-2">{{ formatTime(notification.created_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-4 py-3 border-t border-gray-200 text-center">
        <NuxtLink
          to="/notifications"
          class="text-sm text-primary-normal hover:text-primary-normal-hover font-medium"
        >
          View All Notifications
        </NuxtLink>
      </div>
    </div>

    <!-- Close dropdown when clicking outside -->
    <div
      v-if="showDropdown"
      class="fixed inset-0 z-40"
      @click="showDropdown = false"
    ></div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
