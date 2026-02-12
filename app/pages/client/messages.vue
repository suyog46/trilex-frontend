<script setup lang="ts">
import { ref } from 'vue'
import ChatSidebar from '~/components/chat/ChatSidebar.vue'
import ChatBox from '~/components/chat/ChatBox.vue'

definePageMeta({
  layout: 'client',
  middleware: ['auth', 'client']
})

const selectedConversationId = ref<string | null>(null)

// Handle conversation selection
const handleSelectConversation = (conversationId: string) => {
  selectedConversationId.value = conversationId
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
      />
    </div>
  </div>
</template>
 
