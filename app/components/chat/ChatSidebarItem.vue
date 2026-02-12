<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface ConversationItem {
  id: string
  userProfile: string | null
  userName: string
  lastMessage: string
  lastSeen: string
  unreadCount: number
  isOnline: boolean
}

interface Props {
  conversation: ConversationItem
  isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false
})

const emit = defineEmits<{
  'select': [conversationId: string]
}>()

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  } else if (diffInHours < 48) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<template>
  <div
    :class="[
      'flex items-start gap-3 p-4 cursor-pointer transition-all duration-200 border-b border-gray-100',
      isActive 
        ? 'bg-primary-light border-l-4 border-l-primary-normal' 
        : 'hover:bg-gray-50'
    ]"
    @click="emit('select', conversation.id)"
  >
    <!-- User Avatar -->
    <div class="relative flex-shrink-0">
      <div
        v-if="conversation.userProfile"
        class="w-12 h-12 rounded-full overflow-hidden"
      >
        <img
          :src="conversation.userProfile"
          :alt="conversation.userName"
          class="w-full h-full object-cover"
        />
      </div>
      <div
        v-else
        class="w-12 h-12 rounded-full bg-primary-normal text-white flex items-center justify-center font-semibold text-sm"
      >
        {{ getInitials(conversation.userName) }}
      </div>
      
      <!-- Online Status Indicator -->
      <div
        v-if="conversation.isOnline"
        class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
      ></div>
    </div>

    <!-- Conversation Details -->
    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between mb-1">
        <h4 :class="[
          'font-semibold truncate',
          isActive ? 'text-primary-normal' : 'text-gray-900'
        ]">
          {{ conversation.userName }}
        </h4>
        <span class="text-xs text-gray-500 flex-shrink-0 ml-2">
          {{ formatTime(conversation.lastSeen) }}
        </span>
      </div>
      
      <div class="flex items-center justify-between gap-2">
        <p :class="[
          'text-sm truncate',
          conversation.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
        ]">
          {{ conversation.lastMessage }}
        </p>
        
        <!-- Unread Badge -->
        <span
          v-if="conversation.unreadCount > 0"
          class="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-primary-normal text-white text-xs font-semibold rounded-full flex items-center justify-center"
        >
          {{ conversation.unreadCount > 99 ? '99+' : conversation.unreadCount }}
        </span>
        
        <!-- Read Status (Double Check) -->
        <Icon
          v-else-if="!conversation.unreadCount"
          icon="mdi:check-all"
          class="w-4 h-4 text-blue-500 flex-shrink-0"
        />
      </div>
    </div>
  </div>
</template>
