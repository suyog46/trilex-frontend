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

// Fetch conversations from API
const fetchConversations = async () => {
  isLoadingConversations.value = true
  
  try {
    // TODO: Replace with actual API call
    // const response = await messagesApi.getConversations({
    //   search: searchQuery.value,
    //   page: 1,
    //   page_size: 50
    // })
    // conversations.value = response.results
    
    // Temporary mock data
    conversations.value = []
  } catch (error) {
    console.error('Error fetching conversations:', error)
  } finally {
    isLoadingConversations.value = false
  }
}

// Handle conversation selection
const handleSelectConversation = (conversationId: string) => {
  selectedConversationId.value = conversationId
  
  // Find and set the selected conversation user
  const conversation = conversations.value.find(c => c.id === conversationId)
  
  if (conversation) {
    selectedConversationUser.value = {
      id: conversationId, // TODO: Get actual user ID from conversation
      name: conversation.userName,
      profile: conversation.userProfile,
      isOnline: conversation.isOnline
    }
  }
}

// Handle search
const handleSearch = (query: string) => {
  searchQuery.value = query
  fetchConversations()
}

// Initial load
onMounted(() => {
  fetchConversations()
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
        :conversation-user="selectedConversationUser"
      />
    </div>
  </div>
</template>
