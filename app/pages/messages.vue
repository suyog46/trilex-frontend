<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ChatSidebar from '~/components/chat/ChatSidebar.vue'
import ChatBox from '~/components/chat/ChatBox.vue'

interface ConversationItem {
  id: string
  userProfile: string | null
  userName: string
  lastMessage: string
  lastSeen: string
  unreadCount: number
  isOnline: boolean
}

interface ConversationUser {
  id: string
  name: string
  profile: string | null
  isOnline: boolean
}

definePageMeta({
  layout: 'firm',
  middleware: 'auth'
})

const conversations = ref<ConversationItem[]>([])
const selectedConversationId = ref<string | null>(null)
const selectedConversationUser = ref<ConversationUser | null>(null)
const isLoadingConversations = ref(false)
const searchQuery = ref('')



// Handle conversation selection
const handleSelectConversation = (payload: { conversationId: string; userName: string; userProfile: string | null; isOnline: boolean }) => {
  selectedConversationId.value = payload.conversationId

  selectedConversationUser.value = {
    id: payload.conversationId,
    name: payload.userName,
    profile: payload.userProfile,
    isOnline: payload.isOnline
  }
}

// Handle search
const handleSearch = (query: string) => {
  searchQuery.value = query
  // fetchConversations()
}

onMounted(() => {
  // fetchConversations()
})
</script>

<template>
  <div class="h-[90vh] flex">
    <!-- Sidebar -->
    <div class="w-80 flex-shrink-0">
      <ChatSidebar
        :conversations="conversations"
        :is-loading="isLoadingConversations"
        :selected-conversation-id="selectedConversationId"
        @select-conversation="handleSelectConversation"
        @search="handleSearch"
      />
    </div>

    <!-- Main Chat Area -->
    <div class="flex-1">
      <ChatBox
        :conversation-id="selectedConversationId"
        :conversation-user-name="selectedConversationUser?.name"
      />
    </div>
  </div>
</template>
