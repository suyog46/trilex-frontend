import { ref, computed } from 'vue'

export interface UnreadCountMessage {
  type: 'unread_count'
  count: number
}

export interface NotificationMessage {
  type: 'notification'
  notification: {
    id: string
    type: string
    title: string
    message: string
    entity_type: string
    entity_id: string
    metadata: Record<string, any> | null
    is_read: boolean
    created_at: string
    actor: {
      id: string
      email: string
      name: string
      role: string
    }
  }
}

const globalUnreadCount = ref(0)
const globalNotifications = ref<NotificationMessage[]>([])

export const useNotifications = () => {
  const unreadCount = globalUnreadCount
  const notifications = globalNotifications

  const handleUnreadCount = (data: UnreadCountMessage) => {
    unreadCount.value = data.count
    console.log('📬 Unread notifications count updated:', data.count)
  }

  const handleNewNotification = (data: NotificationMessage) => {
    notifications.value.unshift(data)
    if (!data.notification.is_read) {
      unreadCount.value += 1
    }
    console.log('🔔 New notification received:', data.notification.title)
  }

  const markAsReadLocally = (notificationId: string) => {
    const notification = notifications.value.find(n => n.notification.id === notificationId)
    if (notification) {
      notification.notification.is_read = true
    }
  }

  const clearAllNotifications = () => {
    notifications.value = []
    unreadCount.value = 0
  }

  return {
    unreadCount,
    notifications,
    handleUnreadCount,
    handleNewNotification,
    markAsReadLocally,
    clearAllNotifications,
  }
}
