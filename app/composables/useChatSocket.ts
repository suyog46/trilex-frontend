import { ref, onUnmounted } from 'vue'

interface ChatMessage {
  type: string
  room_id: string
  message: string
  sender: string
  message_id: string
  created_at: string
}



export const useChatSocket = () => {
  const socket = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const messages = ref<ChatMessage[]>([])
  const messageUpdates = ref<Map<string, { message_id: string, created_at: string, status: 'sending' | 'sent' | 'delivered' | 'read' }>>(new Map())
  const typingUsers = ref<string[]>([])

  const connect = (conversationId: string) => {
    if (socket.value?.readyState === WebSocket.OPEN) {
      return
    }

    const authStore = useAuthStore()
    const accessToken = authStore.accessToken
    if (!accessToken) {
      console.error('No access token available for WebSocket connection')
      return
    }

    const wsUrl = `wss://trilex-1.onrender.com/ws/socket/?token=${accessToken}`
    
    socket.value = new WebSocket(wsUrl)

    socket.value.onopen = () => {
      console.log('WebSocket connected')
      isConnected.value = true
      // Join the room
      joinRoom(conversationId)
    }

    socket.value.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log('Server:', data)

      switch(data.type) {
        case 'chat_message':
          // New message received
          messages.value.push(data)
          break

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
    if (socket.value) {
      socket.value.close()
      socket.value = null
      isConnected.value = false
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
    console.log('Joining room:', roomId)
    if (socket.value?.readyState === WebSocket.OPEN) {
      socket.value.send(JSON.stringify({
        action: 'join_room',
        room_id: roomId
      }))
    } else {
      console.warn('WebSocket not ready, cannot join room')
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

  onUnmounted(() => {
    disconnect()
  })

  return {
    socket,
    isConnected,
    messages,
    messageUpdates,
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    sendTypingIndicator,
    joinRoom,
  }
}
