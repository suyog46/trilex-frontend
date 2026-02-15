<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import ChatItem from './ChatItem.vue'

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
  messages?: MessageItem[]
  isLoading?: boolean
  conversationId?: string | null
  typingUsers?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  messages: () => [],
  isLoading: false,
  conversationId: null,
  typingUsers: () => []
})

const emit = defineEmits<{
  'load-more': []
}>()

const messagesContainer = ref<HTMLDivElement | null>(null)
const hasScrolledToBottom = ref(false)

const scrollToBottom = (smooth = true) => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    })
  }
}

const handleScroll = () => {
  if (messagesContainer.value) {
    const { scrollTop } = messagesContainer.value
    
    // If scrolled to top, emit load-more event
    if (scrollTop === 0 && !props.isLoading) {
      emit('load-more')
    }
  }
}

watch(() => props.messages, (newMessages, oldMessages) => {
  if (newMessages.length > oldMessages.length) {
    nextTick(() => {
      console.log('New message arrived, scrolling to bottom')
      scrollToBottom(true)
    })
  }
}, { deep: true })

watch(() => props.conversationId, () => {
  hasScrolledToBottom.value = false
  nextTick(() => {
    scrollToBottom(false)
    hasScrolledToBottom.value = true
  })
})

onMounted(() => {
  nextTick(() => {
    scrollToBottom(false)
    hasScrolledToBottom.value = true
  })
})


</script>

<template>
  <div class="flex-1 flex flex-col bg-gray-50 h-full overflow-y-scroll">
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-6 py-4"
      @scroll="handleScroll"
    >
      <div v-if="isLoading" class="flex justify-center py-4">
        <Icon icon="mdi:loading" class="w-6 h-6 text-primary-normal animate-spin" />
      </div>

      <div
        v-if="messages.length === 0 && !isLoading"
        class="flex flex-col items-center justify-center h-full text-center"
      >
        <Icon icon="mdi:message-outline" class="w-20 h-20 text-gray-300 mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
        <p class="text-sm text-gray-600">Start the conversation by sending a message below</p>
      </div>

      <div v-else>
        <ChatItem
          v-for="message in messages"
          :key="message.id"
          :message="message"
        />

        <div v-if="typingUsers.length > 0" class="flex gap-3 mb-4">
          <div class="w-8 h-8 rounded-full bg-gray-300"></div>
          <div class="flex items-center gap-1 px-4 py-2 bg-gray-100 rounded-lg rounded-tl-none">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
