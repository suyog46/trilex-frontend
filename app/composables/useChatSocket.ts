import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { navigateTo } from '#app'

interface ChatMessage {
  type: string
  room_id: string
  message: string
  sender: string | { id: string; name?: string; email?: string }
  message_id?: string
  id?: string
  created_at: string
}

interface RoomUpdatedMessage {
  type: 'room_updated'
  room_id: string
  last_message: {
    id: string
    message: string
    created_at: string
    room_id: string
    sender: {
      id: string
      name: string
      email: string
    }
  }
}

// Global singleton state - shared across all component instances
const globalSocket = ref<WebSocket | null>(null)
const globalIsConnected = ref(false)
const globalMessages = ref<ChatMessage[]>([])
const globalRoomUpdates = ref<RoomUpdatedMessage[]>([])
const globalMessageUpdates = ref<Map<string, { message_id: string, created_at: string, status: 'sending' | 'sent' | 'delivered' | 'read' }>>(new Map())
const globalTypingUsers = ref<string[]>([])
const globalUnreadNotificationCount = ref(0)
const globalNotifications = ref<any[]>([])

export const useChatSocket = () => {
  // Use global singleton refs instead of creating new ones
  const socket = globalSocket
  const isConnected = globalIsConnected
  const messages = globalMessages
  const roomUpdates = globalRoomUpdates
  const messageUpdates = globalMessageUpdates
  const typingUsers = globalTypingUsers
  const unreadNotificationCount = globalUnreadNotificationCount
  const notifications = globalNotifications

  const connect = (conversationId: string) => {
    console.log(' Connect called with conversationId:', conversationId)
    console.log('Current socket state:', {
      exists: !!socket.value,
      readyState: socket.value?.readyState,
      isConnected: isConnected.value
    })
    
    if (socket.value?.readyState === WebSocket.OPEN) {
      console.log(' WebSocket already connected')
      // Join room if provided
      if (conversationId) {
        joinRoom(conversationId)
      }
      return
    }

    const authStore = useAuthStore()
    const accessToken = authStore.accessToken
    if (!accessToken) {
      console.error(' No access token available for WebSocket connection')
      return
    }

    console.log('Creating new WebSocket connection...')
    const wsUrl = `wss://trilex-1.onrender.com/ws/socket/?token=${accessToken}`
    
    socket.value = new WebSocket(wsUrl)

    socket.value.onopen = () => {
      console.log(' WebSocket connected globally')
      isConnected.value = true
      // Join the room if conversationId is provided
      if (conversationId) {
        joinRoom(conversationId)
      }
    }

    socket.value.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log('Server:', data)

      switch(data.type) {
        case 'chat_message': {
          const normalized: ChatMessage = {
            type: data.type,
            room_id: data.room_id,
            message: data.message,
            created_at: data.created_at,
            sender: data.sender,
            message_id: data.message_id || data.id,
            id: data.id
          }
          // New message received
          messages.value.push(normalized)
          break
        }

        case 'message_sent':
          // Message was saved
          if (data.client_temp_id) {
            messageUpdates.value.set(data.client_temp_id, {
              message_id: data.message_id,
              created_at: data.created_at,
              status: 'sent'
            })
            console.log('Message saved:', data.message_id)
          }
          break

        case 'message_delivered':
          // Message was delivered
          if (data.client_temp_id) {
            const existing = messageUpdates.value.get(data.client_temp_id)
            if (existing) {
              existing.status = 'delivered'
            }
            console.log('Delivered ✔✔')
          }
          break

        case 'message_read':
          // Message was read
          if (data.client_temp_id) {
            const existing = messageUpdates.value.get(data.client_temp_id)
            if (existing) {
              existing.status = 'read'
            }
            console.log('Read 👁')
          }
          break

        case 'room_updated':
          roomUpdates.value.push(data)
          break

        case 'unread_count':
          unreadNotificationCount.value = data.count
          console.log('📬 Unread notifications count:', data.count)
          break

        case 'notification':
          notifications.value.unshift(data.notification)
          if (!data.notification.is_read) {
            unreadNotificationCount.value += 1
          }
          const notificationTitle = data.notification.title || 'New notification'
          const notificationMessage = data.notification.message || ''
          // Show toast notification
          toast(notificationTitle, {
            description: notificationMessage,
            action: {
              label: 'View',
              onClick: () => {
                navigateTo('/notifications')
              }
            },
            duration: 5000
          })
          console.log('🔔 New notification received:', data.notification)
          break

        default:
          console.log('Unknown message type:', data.type)
      }
    }

    socket.value.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    socket.value.onclose = () => {
      console.log('WebSocket disconnected')
      isConnected.value = false
    }
  }

  const disconnect = () => {
    console.log(' Disconnect called')
    if (socket.value) {
      socket.value.close()
      socket.value = null
      isConnected.value = false
      console.log(' WebSocket disconnected and cleaned up')
    } else {
      console.log('ℹ No socket to disconnect')
    }
  }

  const sendMessage = ({ message, roomId ,client_temp_id}: { message: string, roomId: string, client_temp_id: string }) => {
    if (socket.value?.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected')
      return
    }

    // Initialize tracking for this message as 'sending'
    messageUpdates.value.set(client_temp_id, {
      message_id: '',
      created_at: '',
      status: 'sending'
    })

    socket.value.send(JSON.stringify({
      action: 'send_message',
      room_id: roomId,
      message,
      client_temp_id
    }))

    console.log('Message sent with temp ID:', client_temp_id)
  }

  const sendTypingIndicator = (isTyping: boolean) => {
    if (socket.value?.readyState === WebSocket.OPEN) {
      socket.value.send(JSON.stringify({
        type: 'typing',
        isTyping,
      }))
    }
  }

  const joinRoom = (roomId: string) => {
    console.log('Attempting to join room:', {
      roomId,
      socketExists: !!socket.value,
      socketState: socket.value?.readyState,
      isOpen: socket.value?.readyState === WebSocket.OPEN,
      isConnected: isConnected.value
    })
    
    if (socket.value?.readyState === WebSocket.OPEN) {
      socket.value.send(JSON.stringify({
        action: 'join_room',
        room_id: roomId
      }))
      console.log(' Join room message sent for:', roomId)
    } else {
      console.warn(' WebSocket not ready, cannot join room. Socket state:', socket.value?.readyState)
    }
  }

  // TODO: Uncomment when typing indicator is needed
  // const handleTyping = (data: any) => {
  //   if (data.isTyping && !typingUsers.value.includes(data.userId)) {
  //     typingUsers.value.push(data.userId)
  //   } else if (!data.isTyping) {
  //     typingUsers.value = typingUsers.value.filter(id => id !== data.userId)
  //   }
  // }

  // TODO: Uncomment when message read status is needed
  // const updateMessageReadStatus = (data: any) => {
  //   const message = messages.value.find(m => m.id === data.messageId)
  //   if (message) {
  //     message.read = true
  //   }
  // }

  // No automatic cleanup - socket managed globally by auth store

  return {
    socket,
    isConnected,
    messages,
    roomUpdates,
    messageUpdates,
    typingUsers,
    unreadNotificationCount,
    notifications,
    connect,
    disconnect,
    sendMessage,
    sendTypingIndicator,
    joinRoom,
  }
}
