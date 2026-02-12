<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useAuthStore } from '~/stores/auth'

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
  message: MessageItem
}

const props = defineProps<Props>()

const authStore = useAuthStore()

// Check if the message is from the current user
const isOwnMessage = computed(() => {
  // console.log('ChatItem - Checking if own message:', {
  //   currentUserId: authStore.userId,
  //   senderId: props.message.senderId,
  //   isOwn: authStore.userId === props.message.senderId
  // })
  return authStore.userId === props.message.senderId
})

// Format time from ISO string to HH:MM
const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// Get initials from sender name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}
</script>

<template>
  <div
    class="flex gap-3 mb-4"
    :class="isOwnMessage ? 'flex-row-reverse' : 'flex-row'"
  >
    <!-- Avatar (only show for other users' messages) -->
    <div v-if="!isOwnMessage" class="flex-shrink-0">
      <div
        v-if="message.senderProfile"
        class="w-8 h-8 rounded-full overflow-hidden"
      >
        <img
          :src="message.senderProfile"
          :alt="message.senderName"
          class="w-full h-full object-cover"
        />
      </div>
      <div
        v-else
        class="w-8 h-8 rounded-full bg-primary-normal text-white flex items-center justify-center text-xs font-semibold"
      >
        {{ getInitials(message.senderName) }}
      </div>
    </div>

    <!-- Message Bubble -->
    <div
      class="flex flex-col max-w-[70%]"
      :class="isOwnMessage ? 'items-end' : 'items-start'"
    >
      <!-- Sender Name (only show for other users' messages) -->
      <span v-if="!isOwnMessage" class="text-xs text-gray-600 mb-1 px-1">
        {{ message.senderName }}
      </span>

      <!-- Message Content -->
      <div
        class="px-4 py-2 rounded-lg break-words"
        :class="
          isOwnMessage
            ? 'bg-primary-normal text-white rounded-tr-none'
            : 'bg-gray-100 text-gray-900 rounded-tl-none'
        "
      >
        <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
      </div>

      <!-- Message Footer (Time + Status) -->
      <div
        class="flex items-center gap-1 mt-1 px-1"
        :class="isOwnMessage ? 'flex-row-reverse' : 'flex-row'"
      >
        <span class="text-xs text-gray-500">
          {{ formatTime(message.createdAt) }}
        </span>
        
        <!-- Status Indicator (only for own messages) -->
        <div v-if="isOwnMessage" class="w-4 h-4 flex items-center justify-center">
          <!-- Sending Status - spinner -->
          <Icon
            v-if="message.status === 'sending'"
            icon="mdi:clock-outline"
            class="w-4 h-4 text-gray-400 animate-spin"
          />
          
          <!-- Sent Status - single check -->
          <Icon
            v-else-if="message.status === 'sent'"
            icon="mdi:check"
            class="w-4 h-4 text-gray-400"
          />
          
          <!-- Delivered Status - double check -->
          <Icon
            v-else-if="message.status === 'delivered'"
            icon="mdi:check-all"
            class="w-4 h-4 text-gray-400"
          />
          
          <!-- Read Status - double check in blue -->
          <Icon
            v-else-if="message.status === 'read'"
            icon="mdi:check-all"
            class="w-4 h-4 text-primary-normal"
          />
        </div>
      </div>
    </div>
  </div>
</template>
