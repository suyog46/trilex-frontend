<script setup lang="ts">
import { ref, watch, computed, onUnmounted, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useAuthStore } from '~/stores/auth'
import { useChatSocket } from '~/composables/useChatSocket'
import { chatApi, type ChatMessage } from '~/composables/api/chat.api'
import { toast } from 'vue-sonner'
import ChatContent from './ChatContent.vue'
import ChatInput from './ChatInput.vue'

interface MessageItem {
  id: string
  content: string
  createdAt: string
  isRead: boolean
  senderId: string
  senderName: string
  senderProfile: string | null
  status: 'sending' | 'sent' | 'delivered' | 'read'
  tempId?: string
}

interface Props {
  conversationId?: string | null
  conversationUserName?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  conversationId: null,
  conversationUserName: null
})

const authStore = useAuthStore()
const { 
  sendMessage: sendSocketMessage, 
  sendTypingIndicator, 
  isConnected,
  messages: socketMessages,
  typingUsers,
  messageUpdates,
  joinRoom
} = useChatSocket()

const messages = ref<MessageItem[]>([])
const isLoadingMessages = ref(false)
const currentPage = ref(1)
const hasMoreMessages = ref(true)
const roomDetails = ref<any>(null)

// Get display name for conversation
const conversationUserName = computed(() => {
  if (props.conversationUserName) return props.conversationUserName
  if (!roomDetails.value) return 'Unknown User'
  
  const currentUserEmail = authStore.user?.email
  const otherParticipant = roomDetails.value.participants?.find((p: any) => p.user.email !== currentUserEmail)
  
  return otherParticipant?.user.name || otherParticipant?.user.email || 'Unknown User'
})

// Get initials from user name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Transform API messages to MessageItem format
const transformMessage = (msg: ChatMessage): MessageItem => {
  return {
    id: msg.id,
    content: msg.message,
    createdAt: msg.created_at,
    isRead: true,
    senderId: msg.sender.id,
    senderName: msg.sender.name,
    senderProfile: null,
    status: 'sent'
  }
}

const sortMessagesByTime = (items: MessageItem[]) => {
  return items
    .slice()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

const markDeliveredUpTo = (messageId: string) => {
  const targetIndex = messages.value.findIndex(m => m.id === messageId)
  if (targetIndex === -1) return

  for (let i = 0; i <= targetIndex; i += 1) {
    const msg = messages.value[i]
    if (msg && msg.senderId === authStore.userId && msg.status === 'sent') {
      msg.status = 'delivered'
    }
  }
}

const fetchMessages = async (page = 1) => {
  if (!props.conversationId) return
  
  isLoadingMessages.value = true
  
  try {
    const response = await chatApi.getMessages(props.conversationId, {
      page,
      page_size: 50
    })
    
    const transformedMessages = response.results.map(transformMessage)
    
    if (page === 1) {
      messages.value = sortMessagesByTime(transformedMessages)
    } else {
      messages.value = sortMessagesByTime([...transformedMessages, ...messages.value])
    }
    
    hasMoreMessages.value = !!response.next
    currentPage.value = page
  } catch (error: any) {
    console.error('Error fetching messages:', error)
    toast.error('Failed to load messages')
  } finally {
    isLoadingMessages.value = false
  }
}

// Load more messages (pagination)
const handleLoadMore = () => {
  if (hasMoreMessages.value && !isLoadingMessages.value) {
    fetchMessages(currentPage.value + 1)
  }
}

// Handle sending message
const handleSendMessage = async (content: string) => {
  if (!props.conversationId || !isConnected.value) return
  
  try {
    // Generate temporary ID for optimistic update
    const tempId = crypto.randomUUID()
    const now = new Date().toISOString()
    
    // Add message optimistically with "sending" status
    const optimisticMessage: MessageItem = {
      id: tempId,
      content,
      createdAt: now,
      isRead: true,
      senderId: authStore.userId || '',
      senderName: authStore.user?.fullName || 'Unknown',
      senderProfile: null,
      status: 'sending',
      tempId
    }

    console.log('Adding optimistic message:', optimisticMessage)
    
    messages.value.push(optimisticMessage)
    
    // Send via socket
    sendSocketMessage({ message: content, roomId: props.conversationId, client_temp_id: tempId })
  } catch (error: any) {
    console.error('Error sending message:', error)
    toast.error('Failed to send message')
  }
}

const handleTyping = () => {
  if (!props.conversationId || !isConnected.value) return
//   sendTypingIndicator(true)
}

// Watch for conversation change
watch(() => props.conversationId, (newConversationId, oldConversationId) => {
  // Connect to new conversation
  if (newConversationId) {
    currentPage.value = 1
    hasMoreMessages.value = true
    fetchMessages(1)
    // Join the room (socket already connected globally)
    joinRoom(newConversationId)
  }
}, { immediate: true })

// Watch for message updates to replace optimistic messages and set status
watch(messageUpdates, (newUpdates) => {
    console.log("Received message updates in the chat box", newUpdates)
  newUpdates.forEach((update, tempId) => {


    const messageIndex = messages.value.findIndex(m => m.tempId === tempId)
    if (messageIndex !== -1) {
      const msg = messages.value[messageIndex]
      if (!msg) return

      msg.status = update.status

      if (update.message_id) {
        msg.id = update.message_id
      }

      if (update.created_at) {
        msg.createdAt = update.created_at
      }

      if (update.status === 'delivered' && update.message_id) {
        markDeliveredUpTo(update.message_id)
      }
    }
  })
}, { deep: true })

// Watch for new messages from WebSocket
watch(socketMessages, (newMessages) => {
    console.log("new message from the socket:", newMessages)
  newMessages.forEach((socketMessage) => {
    // Check if message already exists (by message_id or tempId)
    const exists = messages.value.some(m => m.id === socketMessage.message_id)
    
    if (!exists) {
      const messageItem: MessageItem = {
        id: socketMessage.message_id,
        content: socketMessage.message,
        createdAt: socketMessage.created_at,
        isRead: true,
        senderId: socketMessage.sender,
        senderName: socketMessage.sender,
        senderProfile: null,
        status: 'sent'
      }
      
      messages.value.push(messageItem)
    }
  })
}, { deep: true })

// No cleanup needed - socket stays connected globally
</script>

<template>
  <div class="h-full flex flex-col bg-white">
    <!-- No Conversation Selected State -->
    <div
      v-if="!conversationId"
      class="flex-1 flex flex-col items-center justify-center text-center p-8"
    >
      <Icon icon="mdi:message-text-outline" class="w-24 h-24 text-gray-300 mb-6" />
      <h3 class="text-xl font-semibold text-gray-900 mb-2">No conversation selected</h3>
      <p class="text-gray-600">Select a conversation from the sidebar to start messaging</p>
    </div>

    <template v-else>
      <!-- Chat Header -->
      <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
        <!-- User Avatar -->
        <div class="relative flex-shrink-0">
          <div
            class="w-10 h-10 rounded-full bg-primary-normal text-white flex items-center justify-center text-sm font-semibold"
          >
            {{ getInitials(conversationUserName) }}
          </div>
        </div>

        <!-- User Info -->
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-gray-900 truncate">
            {{ conversationUserName }}
          </h3>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="p-2 text-gray-500 hover:text-primary-normal hover:bg-primary-light rounded-lg transition-colors"
          >
            <Icon icon="mdi:dots-vertical" class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Chat Content & Input -->
      <ChatContent
        :messages="messages"
        :is-loading="isLoadingMessages"
        :conversation-id="conversationId"
        :typing-users="typingUsers"
        @load-more="handleLoadMore"
      />
      
      <ChatInput
        :disabled="!isConnected"
        @send-message="handleSendMessage"
        @typing="handleTyping"
      />
    </template>
  </div>
</template>
