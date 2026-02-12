<script setup lang="ts">
import type { ChatMessage } from '~/composables/api/ai-assistant.api'
import LawyerRecommendationCard from './LawyerRecommendationCard.vue'
import FirmRecommendationCard from './FirmRecommendationCard.vue'

interface Props {
  messages: ChatMessage[]
  isLoading?: boolean
}

const props = defineProps<Props>()

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const hasRecommendations = (message: ChatMessage) => {
  if (!message.recommendations) return false
  return (
    message.recommendations.lawyers.length > 0 ||
    message.recommendations.firms.length > 0
  )
}
</script>

<template>
  <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
    <div v-if="messages.length === 0 && !isLoading" class="h-full flex items-center justify-center">
      <div class="text-center max-w-md">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-light flex items-center justify-center">
          <Icon icon="mdi:robot-happy-outline" class="w-10 h-10 text-primary-normal" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">AI Legal Assistant</h3>
        <p class="text-gray-600">
          Ask me anything about lawyers, law firms, or get recommendations for your legal needs.
        </p>
        <div class="mt-6 space-y-2 text-sm text-left">
          <p class="text-gray-700 font-medium">Try asking:</p>
          <ul class="space-y-1 text-gray-600">
            <li>• "Suggest me a lawyer for a finance-related case"</li>
            <li>• "I need help with a property dispute"</li>
            <li>• "Find law firms specializing in corporate law"</li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="flex"
        :class="message.sender === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div v-if="message.sender === 'user'" class="flex items-start gap-3 max-w-2xl">
          <div class="flex-1">
            <div class="bg-primary-normal text-white rounded-lg px-4 py-3">
              <p class="text-sm whitespace-pre-wrap">{{ message.message }}</p>
            </div>
            <p class="text-xs text-gray-500 mt-1 text-right">{{ formatTime(message.created_at) }}</p>
          </div>
          <div class="w-8 h-8 rounded-full bg-primary-normal text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
            U
          </div>
        </div>

        <div v-else class="flex items-start gap-3 max-w-4xl">
          <div class="w-8 h-8 rounded-full bg-primary-normal text-white flex items-center justify-center flex-shrink-0">
            <Icon icon="mdi:robot" class="w-5 h-5" />
          </div>
          <div class="flex-1">
            <!-- Not Legal Query Type -->
            <div v-if="message.query_type === 'not_legal'" class="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 shadow-sm">
              <div class="flex items-start gap-3">
                <Icon icon="mdi:alert-circle-outline" class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div class="flex-1">
                  <p class="text-sm font-medium text-amber-900 mb-1">Not a Legal Question</p>
                  <p class="text-sm text-amber-800 whitespace-pre-wrap">{{ message.message || message.answer }}</p>
                </div>
              </div>
            </div>

            <!-- Normal/General Query Type -->
            <div v-else-if="message.query_type === null || message.query_type === 'normal' || message.query_type === 'general'" class="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
              <p class="text-sm text-gray-800 whitespace-pre-wrap">{{ message.message }}</p>
            </div>

            <!-- Recommendation Query Type -->
            <div v-else-if="message.query_type === 'recommendation'">
              <div v-if="hasRecommendations(message)" class="space-y-4">
                <!-- Category Header -->
                <div v-if="message.recommendations?.case_category" class="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
                  <p class="text-sm text-gray-700">
                    Here are my recommendations for 
                    <span class="font-semibold text-primary-normal">{{ message.recommendations.case_category }}</span>
                    related cases:
                  </p>
                </div>

                <div v-if="message.recommendations?.lawyers && message.recommendations.lawyers.length > 0">
                  <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:account-tie" class="w-5 h-5" />
                    Recommended Lawyers
                  </h4>
                  <div class="space-y-3">
                    <LawyerRecommendationCard
                      v-for="lawyer in message.recommendations.lawyers"
                      :key="lawyer.id"
                      :lawyer="lawyer"
                    />
                  </div>
                </div>

                <div v-if="message.recommendations?.firms && message.recommendations.firms.length > 0">
                  <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:office-building" class="w-5 h-5" />
                    Recommended Law Firms
                  </h4>
                  <div class="space-y-3">
                    <FirmRecommendationCard
                      v-for="firm in message.recommendations.firms"
                      :key="firm.id"
                      :firm="firm"
                    />
                  </div>
                </div>
              </div>

              <div v-else class="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
                <div v-if="message.message" class="flex items-start gap-3 text-gray-700">
                  <Icon icon="mdi:information-outline" class="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p class="text-sm">{{ message.message }}</p>
                </div>
                <div v-else class="flex items-center gap-3 text-gray-600">
                  <Icon icon="mdi:information-outline" class="w-5 h-5" />
                  <p class="text-sm">No recommendations found. Please try refining your query.</p>
                </div>
              </div>
            </div>

            <p class="text-xs text-gray-500 mt-1">{{ formatTime(message.created_at) }}</p>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-full bg-primary-normal text-white flex items-center justify-center flex-shrink-0">
          <Icon icon="mdi:robot" class="w-5 h-5" />
        </div>
        <div class="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
          <div class="flex items-center gap-2">
            <Icon icon="svg-spinners:3-dots-fade" class="w-6 h-6 text-primary-normal" />
            <span class="text-sm text-gray-600">AI is thinking...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
