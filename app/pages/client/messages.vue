<script setup lang="ts">
import { ref } from 'vue'
import ChatSidebar from '~/components/chat/ChatSidebar.vue'
import ChatBox from '~/components/chat/ChatBox.vue'

definePageMeta({
  layout: 'client',
  middleware: ['auth', 'client']
})

const selectedConversationId = ref<string | null>(null)
const selectedConversationName = ref<string | null>(null)

// Handle conversation selection
const handleSelectConversation = (payload: { conversationId: string; userName: string; userProfile: string | null; isOnline: boolean }) => {
  selectedConversationId.value = payload.conversationId
  selectedConversationName.value = payload.userName
}

</script>

<template>
  <div class="h-[90vh] flex">
    <!-- Sidebar -->
    <div class="w-80 flex-shrink-0">
      <ChatSidebar
        :selected-conversation-id="selectedConversationId"
        @select-conversation="handleSelectConversation"
      />
    </div>

    <!-- Main Chat Area -->
    <div class="flex-1">
      <ChatBox
        :conversation-id="selectedConversationId"
        :conversation-user-name="selectedConversationName"
      />
    </div>
  </div>
</template>
 
