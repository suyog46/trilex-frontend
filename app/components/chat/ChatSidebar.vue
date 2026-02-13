<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import ChatSidebarItem from './ChatSidebarItem.vue'
import { chatApi, type ChatRoom } from '~/composables/api/chat.api'
import { useAuthStore } from '~/stores/auth'
import { useChatSocket } from '~/composables/useChatSocket'
import { toast } from 'vue-sonner'

interface ConversationItem {
  id: string
  userProfile: string | null
  userName: string
  lastMessage: string
  lastSeen: string
  unreadCount: number
  isOnline: boolean
}

interface Props {
  selectedConversationId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  selectedConversationId: null
})

const emit = defineEmits<{
  'select-conversation': [payload: { conversationId: string; userName: string; userProfile: string | null; isOnline: boolean }]
  'search': [query: string]
}>()

const authStore = useAuthStore()
const searchQuery = ref('')
const chatRooms = ref<ChatRoom[]>([])
const isLoading = ref(false)

// Transform chat rooms to conversation items
const conversations = computed<ConversationItem[]>(() => {
  return chatRooms.value.map(room => {
    // Find the other participant (not the current user)
    const currentUserEmail = authStore.user?.email
    const otherParticipant = room.participants.find(p => p.user.email !== currentUserEmail)
    
    return {
      id: room.id,
      userProfile: null,
      userName: otherParticipant?.user.name || otherParticipant?.user.email || 'Unknown User',
      lastMessage: room.last_message?.message || 'No messages yet',
      lastSeen: room.last_message?.created_at || room.updated_at,
      unreadCount: room.unread_count,
      isOnline: false,
    }
  })
})

const handleSearch = () => {
  emit('search', searchQuery.value)
  fetchConversations()
}

const { roomUpdates } = useChatSocket()
const processedRoomUpdates = ref(0)

const handleSelectConversation = (conversationId: string) => {
  const selected = conversations.value.find(conversation => conversation.id === conversationId)

  emit('select-conversation', {
    conversationId,
    userName: selected?.userName || 'Unknown User',
    userProfile: selected?.userProfile || null,
    isOnline: selected?.isOnline ?? false
  })
}

// Fetch conversations from API
const fetchConversations = async () => {
  isLoading.value = true
  try {
    const response = await chatApi.getRooms({
      page: 1,
      page_size: 50
    })
    chatRooms.value = response.results

    console.log('Fetched chat rooms:', response.results)

  } catch (error: any) {
    console.error('Error fetching chat rooms:', error)
    toast.error('Failed to load conversations')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchConversations()
})

watch(searchQuery, () => {
  if (searchQuery.value.length >= 2 || searchQuery.value.length === 0) {
    handleSearch()
  }
})

watch(roomUpdates, (updates) => {
  for (let i = processedRoomUpdates.value; i < updates.length; i += 1) {
    const update = updates[i]
    if (!update) continue

    const roomIndex = chatRooms.value.findIndex(room => room.id === update.room_id)
    if (roomIndex === -1) {
      fetchConversations()
      continue
    }

    const room = chatRooms.value[roomIndex]
    if (!room) continue

    const isSameMessage = room.last_message?.id === update.id
    if (!isSameMessage) {
      room.last_message = {
        id: update.id,
        sender: update.sender?.name || update.sender?.email || '',
        message: update.message,
        created_at: update.created_at
      }
      room.updated_at = update.created_at
    }

    if (roomIndex > 0) {
      chatRooms.value.splice(roomIndex, 1)
      chatRooms.value.unshift(room)
    }
  }

  processedRoomUpdates.value = updates.length
}, { deep: true })
</script>

<template>
  <div class="h-full flex flex-col bg-white border-r border-gray-200">
    <!-- Sidebar Header -->
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Messages</h2>
      
      <!-- Search Bar -->
      <div class="relative">
        <Icon
          icon="mdi:magnify"
          class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search conversations..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal focus:border-transparent"
        />
      </div>
    </div>

    <!-- Conversations List -->
    <div class="flex-1 overflow-y-auto">
      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-2 p-4">
        <div v-for="i in 5" :key="i" class="flex items-start gap-3">
          <div class="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div class="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="conversations.length === 0"
        class="flex flex-col items-center justify-center py-12 px-4 text-center"
      >
        <Icon icon="mdi:message-text-outline" class="w-16 h-16 text-gray-400 mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
        <p class="text-sm text-gray-600">
          {{ searchQuery ? 'No conversations found matching your search' : 'Start a new conversation to get started' }}
        </p>
      </div>

      <!-- Conversations -->
      <div v-else>
        <ChatSidebarItem
          v-for="conversation in conversations"
          :key="conversation.id"
          :conversation="conversation"
          :is-active="conversation.id === selectedConversationId"
          @select="handleSelectConversation"
        />
      </div>
    </div>
  </div>
</template>
