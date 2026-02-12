<script setup lang="ts">
import { ref } from 'vue'

interface Emits {
  (e: 'submit', query: string): void
}

const emit = defineEmits<Emits>()

interface Props {
  isLoading?: boolean
}

const props = defineProps<Props>()

const inputText = ref('')

const handleSubmit = () => {
  const trimmedQuery = inputText.value.trim()
  if (!trimmedQuery || props.isLoading) return

  emit('submit', trimmedQuery)
  inputText.value = '' 
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSubmit()
  }
}
</script>

<template>
  <div class="border-t border-gray-200 bg-white p-4">
    <div class="flex flex-col items-end gap-3">
      <!-- Input Field -->
      <div class="flex w-full justify-between gap-2">
        <textarea
          v-model="inputText"
          @keydown="handleKeydown"
          :disabled="isLoading"
          placeholder="Ask AI Assistant about lawyers, cases, or legal advice..."
          rows="1"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-normal focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          style="min-height: 52px; max-height: 120px;"
        />
        <button
             @click="handleSubmit"
             :disabled="!inputText.trim() || isLoading"
             class="px-6 py-3 bg-primary-normal text-white rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
           >
            
             <Icon
               :disabled={isLoading}
               icon="mdi:send"
               class="w-5 h-5"
             />
             <span v-if="!isLoading">Send</span>
           </button>
      </div>
   
    </div>

    <p class="text-xs text-gray-500 mt-2">
      Press Enter to send, Shift + Enter for new line
    </p>
  </div>
</template>
