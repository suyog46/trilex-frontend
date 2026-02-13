<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { notificationsApi, type Notification } from '~/composables/api/notifications.api'
import { useChatSocket } from '~/composables/useChatSocket'
import { toast } from 'vue-sonner'

definePageMeta({
  middleware: 'auth'
})

const notifications = ref<Notification[]>([])
const isLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const filterStatus = ref<'all' | 'unread' | 'read'>('all')
const isLoadingMarkAll = ref(false)

const { unreadNotificationCount, notifications: socketNotifications } = useChatSocket()

const filteredNotifications = computed(() => {
  if (filterStatus.value === 'unread') {
    return notifications.value.filter(n => !n.is_read)
  } else if (filterStatus.value === 'read') {
    return notifications.value.filter(n => n.is_read)
  }
  return notifications.value
})

const totalPages = computed(() => {
  return Math.ceil(totalCount.value / pageSize.value)
})

const syncGlobalNotifications = (items: Notification[]) => {
  const combined = [...items, ...socketNotifications.value]
  const uniqueMap = new Map<string, Notification>()
  combined.forEach((item) => {
    if (!uniqueMap.has(item.id)) {
      uniqueMap.set(item.id, item)
    }
  })
  socketNotifications.value = Array.from(uniqueMap.values()).sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

const fetchNotifications = async (page: number = 1) => {
  isLoading.value = true
  try {
    const params: any = {
      page,
      page_size: pageSize.value
    }
    
    if (filterStatus.value !== 'all') {
      params.is_read = filterStatus.value === 'read'
    }
    
    const response = await notificationsApi.getNotifications(params)
    notifications.value = response.results
    totalCount.value = response.count
    currentPage.value = page
    syncGlobalNotifications(response.results)
    console.log('Fetched notifications:', response)
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
    const match = socketNotifications.value.find(item => item.id === notification.id)
    if (match) {
      match.is_read = true
    }
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
    notifications.value.forEach(n => n.is_read = true)
    socketNotifications.value.forEach(n => n.is_read = true)
    unreadNotificationCount.value = 0
    await fetchNotifications(currentPage.value)
    toast.success('All notifications marked as read')
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    toast.error('Failed to mark all notifications as read')
  } finally {
    isLoadingMarkAll.value = false
  }
}

const handleFilterChange = (status: 'all' | 'unread' | 'read') => {
  filterStatus.value = status
  currentPage.value = 1
  fetchNotifications(1)
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

const getNotificationTypeLabel = (type: string): string => {
  const labelMap: Record<string, string> = {
    'booking_created': 'Booking Created',
    'booking_accepted': 'Booking Accepted',
    'booking_rejected': 'Booking Rejected',
    'firm_invitation_received': 'Firm Invitation',
    'firm_invitation_accepted': 'Invitation Accepted',
    'firm_invitation_rejected': 'Invitation Rejected',
  }
  return labelMap[type] || type
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
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto p-4 md:p-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Notifications</h1>
          <p class="text-gray-600 mt-2">Stay updated with your activity</p>
        </div>
        
        <button
          v-if="notifications.some(n => !n.is_read)"
          @click="handleMarkAllAsRead"
          :disabled="isLoadingMarkAll"
          class="px-4 py-2 bg-primary-normal text-white rounded-lg hover:bg-primary-normal-hover disabled:opacity-50 transition-colors font-medium"
        >
          {{ isLoadingMarkAll ? 'Marking...' : 'Mark all as read' }}
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-4 mb-6 border-b border-gray-200">
        <button
          @click="handleFilterChange('all')"
          :class="[
            'px-4 py-3 font-medium transition-colors',
            filterStatus === 'all'
              ? 'text-primary-normal border-b-2 border-primary-normal'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          All
        </button>
        <button
          @click="handleFilterChange('unread')"
          :class="[
            'px-4 py-3 font-medium transition-colors flex items-center gap-2',
            filterStatus === 'unread'
              ? 'text-primary-normal border-b-2 border-primary-normal'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          Unread
          <span
            v-if="notifications.filter(n => !n.is_read).length > 0"
            class="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full"
          >
            {{ notifications.filter(n => !n.is_read).length }}
          </span>
        </button>
        <button
          @click="handleFilterChange('read')"
          :class="[
            'px-4 py-3 font-medium transition-colors',
            filterStatus === 'read'
              ? 'text-primary-normal border-b-2 border-primary-normal'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          Read
        </button>
      </div>

      <!-- Content -->
      <div class="bg-white rounded-lg shadow">
        <!-- Loading State -->
        <div v-if="isLoading" class="p-6 space-y-4">
          <div v-for="i in 3" :key="i" class="flex gap-4 p-4 border-b border-gray-200">
            <div class="w-12 h-12 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
            <div class="flex-1 space-y-3">
              <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredNotifications.length === 0" class="p-12 text-center">
          <Icon icon="mdi:bell-off-outline" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-600 text-lg">
            {{ filterStatus === 'all' ? 'No notifications yet' : `No ${filterStatus} notifications` }}
          </p>
        </div>

        <!-- Notifications List -->
        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="notification in filteredNotifications"
            :key="notification.id"
            class="p-4 md:p-6 hover:bg-gray-50 transition-colors"
            :class="{ 'bg-blue-50': !notification.is_read }"
          >
            <div class="flex gap-4">
              <!-- Icon -->
              <div class="flex-shrink-0">
                <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Icon :icon="getNotificationIcon(notification.type)" :class="['w-6 h-6', getNotificationColor(notification.type)]" />
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <h3 class="font-semibold text-gray-900">{{ notification.title }}</h3>
                      <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {{ getNotificationTypeLabel(notification.type) }}
                      </span>
                    </div>
                    <p class="text-gray-600 mt-2">{{ notification.message }}</p>
                    
                    <!-- Metadata -->
                    <div v-if="notification.metadata" class="mt-3 text-sm text-gray-500">
                      <p v-if="notification.actor">
                        From: <span class="font-medium">{{ notification.actor.name || notification.actor.email }}</span>
                      </p>
                    </div>

                    <!-- Time -->
                    <p class="text-xs text-gray-500 mt-3">{{ formatTime(notification.created_at) }}</p>
                  </div>

                  <!-- Actions -->
                  <div class="flex-shrink-0 flex items-center gap-2">
                    <button
                      v-if="!notification.is_read"
                      @click="handleMarkAsRead(notification)"
                      class="px-3 py-2 text-sm font-medium text-primary-normal hover:bg-primary-light rounded transition-colors"
                      title="Mark as read"
                    >
                      <Icon icon="mdi:check" class="w-5 h-5" />
                    </button>
                    <span
                      v-else
                      class="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded"
                    >
                      Read
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex items-center justify-between">
        <p class="text-sm text-gray-600">
          Page {{ currentPage }} of {{ totalPages }}
        </p>
        <div class="flex gap-2">
          <button
            @click="fetchNotifications(currentPage - 1)"
            :disabled="currentPage === 1 || isLoading"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            @click="fetchNotifications(currentPage + 1)"
            :disabled="currentPage === totalPages || isLoading"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
