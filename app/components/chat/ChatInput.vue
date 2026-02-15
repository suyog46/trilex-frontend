<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  disabled?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  placeholder: 'Type a message...'
})

const emit = defineEmits<{
  'send-message': [content: string]
  'typing': []
}>()

const messageContent = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
let typingTimeout: NodeJS.Timeout | null = null

const autoResize = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}

const handleSendMessage = () => {
  const content = messageContent.value.trim()
  
  if (content && !props.disabled) {
    emit('send-message', content)
    messageContent.value = ''
    
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSendMessage()
  }
}

watch(messageContent, () => {
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
  
  // if (messageContent.value) {
  //   emit('typing')
  // }
  
  typingTimeout = setTimeout(() => {
  }, 3000)
  
  autoResize()
})

const handleAttachFile = () => {
  console.log('Attach file clicked')
}

const handleEmojiPicker = () => {
  console.log('Emoji picker clicked')
}
</script>

<template>
  <div class="border-t border-gray-200 bg-white px-6 py-4">
    <!-- <div class="flex items-end gap-3"> -->
      <!-- Attachment Button -->
      <!-- <button
        type="button"
        class="flex-shrink-0 p-2 text-gray-500 hover:text-primary-normal hover:bg-primary-light rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="disabled"
        @click="handleAttachFile"
      >
        <Icon icon="mdi:attachment" class="w-6 h-6" />
      </button> -->

      <div class="flex gap-2 justify-between relative">
        <textarea
          ref="textareaRef"
          v-model="messageContent"
          :placeholder="placeholder"
          :disabled="disabled"
          rows="1"
          class="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-normal focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed max-h-32"
          @keydown="handleKeydown"
        ></textarea>

        <!-- <button
          type="button"
          class="absolute right-3 bottom-2 text-gray-500 hover:text-primary-normal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="disabled"
          @click="handleEmojiPicker"
        >
          <Icon icon="mdi:emoticon-happy-outline" class="w-5 h-5" />
        </button> -->
        <button
          type="button"
          class="flex-shrink-0 p-2 bg-primary-normal text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="disabled || !messageContent.trim()"
          @click="handleSendMessage"
        >
          <Icon icon="mdi:send" class="w-6 h-6" />
        </button>
      </div>

    <!-- </div> -->

  
  </div>
</template>
