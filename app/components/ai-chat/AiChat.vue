<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { toast } from 'vue-sonner'
import type { ChatMessage } from '~/composables/api/ai-assistant.api'
import { aiAssistantApi } from '~/composables/api/ai-assistant.api'
import AiChatContent from './AiChatContent.vue'
import AiChatInput from './AiChatInput.vue'

const messages = ref<ChatMessage[]>([])
const isLoadingHistory = ref(false)
const isLoadingQuery = ref(false)
const chatContainerRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  await fetchChatHistory()
})

const fetchChatHistory = async () => {
  isLoadingHistory.value = true
  try {
    const response = await aiAssistantApi.getChatHistory(1, 50)
    messages.value = response.results.reverse()
    await nextTick()
    scrollToBottom()
  } catch (error: any) {
    console.error('Error fetching chat history:', error)
    toast.error('Failed to load chat history')
  } finally {
    isLoadingHistory.value = false
  }
}

const handleSendQuery = async (query: string) => {
  const userMessage: ChatMessage = {
    sender: 'user',
    message: query,
    query_type: null,
    recommendations: null,
    created_at: new Date().toISOString(),
  }
  messages.value.push(userMessage)

  await nextTick()
  scrollToBottom()

  isLoadingQuery.value = true
  try {
    const response = await aiAssistantApi.sendQuery({ query })

    const aiMessage: ChatMessage = {
      sender: 'ai',
      message: response.answer,
      query_type: response.query_type,
      recommendations: response.recommendations,
      created_at: response.created_at,
    }
    messages.value.push(aiMessage)

    await nextTick()
    scrollToBottom()
  } catch (error: any) {
    console.error('Error sending query:', error)
    toast.error('Failed to get response from AI')

    const errorMessage: ChatMessage = {
      sender: 'ai',
      message: 'Sorry, I encountered an error. Please try again.',
      query_type: null,
      recommendations: null,
      created_at: new Date().toISOString(),
    }
    messages.value.push(errorMessage)
  } finally {
    isLoadingQuery.value = false
  }
}

const scrollToBottom = () => {
  if (chatContainerRef.value) {
    const chatContent = chatContainerRef.value.querySelector('.overflow-y-auto')
    if (chatContent) {
      chatContent.scrollTop = chatContent.scrollHeight
    }
  }
}
</script>

<template>
  <div ref="chatContainerRef" class="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="border-b border-gray-200 px-6 py-4 bg-primary-normal">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon icon="mdi:robot-happy-outline" class="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-white">AI Legal Assistant</h2>
          <p class="text-sm text-white/80">Ask me anything about lawyers and legal services</p>
        </div>
      </div>
    </div>

    <div v-if="isLoadingHistory" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <Icon icon="svg-spinners:ring-resize" class="w-12 h-12 text-primary-normal mx-auto mb-3" />
        <p class="text-gray-600">Loading chat history...</p>
      </div>
    </div>

    <AiChatContent
      v-else
      :messages="messages"
      :is-loading="isLoadingQuery"
    />

    <AiChatInput
      :is-loading="isLoadingQuery"
      @submit="handleSendQuery"
    />
  </div>
</template>
