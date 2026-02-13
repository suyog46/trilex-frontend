<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ChatSidebar from '~/components/chat/ChatSidebar.vue'
import ChatBox from '~/components/chat/ChatBox.vue'

definePageMeta({
  layout: 'lawyer',
})

const selectedConversationId = ref<string | null>(null)
const selectedConversationName = ref<string | null>(null)

const handleSelectConversation = (payload: { conversationId: string; userName: string; userProfile: string | null; isOnline: boolean }) => {
  selectedConversationId.value = payload.conversationId
  selectedConversationName.value = payload.userName
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-4rem)]">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200 bg-white">
      <h1 class="text-2xl font-bold text-gray-900">Messages</h1>
      <p class="text-sm text-gray-600 mt-1">Chat with your clients</p>
    </div>

    <!-- Chat Container -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <div class="w-80 flex-shrink-0 border-r border-gray-200">
        <ChatSidebar
          :selected-conversation-id="selectedConversationId"
          @select-conversation="handleSelectConversation"
        />
      </div>

      <!-- Chat Area -->
      <div class="flex-1 flex flex-col">
        <ChatBox
          v-if="selectedConversationId"
          :conversation-id="selectedConversationId"
          :conversation-user-name="selectedConversationName"
        />
        <div
          v-else
          class="flex-1 flex items-center justify-center bg-gray-50"
        >
          <div class="text-center">
            <Icon icon="mdi:message-outline" class="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 class="text-xl font-semibold text-gray-700 mb-2">Select a Conversation</h3>
            <p class="text-gray-500">Choose a conversation from the sidebar to start chatting</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
