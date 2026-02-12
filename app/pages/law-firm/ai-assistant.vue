<script setup lang="ts">
import AiChatBot from '~/components/ai-chat/AiChatBot.vue'

definePageMeta({
  layout: 'firm',
  middleware: ['auth']
})
</script>

<template>
  <div class="h-[calc(100vh-8rem)]">
    <AiChatBot />
  </div>
</template>
