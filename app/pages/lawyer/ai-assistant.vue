<script setup lang="ts">
import AiChatBot from '~/components/ai-chat/AiChatBot.vue'

definePageMeta({
  layout: 'lawyer',
  middleware: ['auth', 'lawyer']
})
</script>

<template>
  <div class="h-[calc(100vh-8rem)]">
    <AiChatBot />
  </div>
</template>
