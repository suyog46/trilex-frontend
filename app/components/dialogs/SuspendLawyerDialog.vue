<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { lawyersApi } from '~/composables/api/lawyers.api'
import type { FirmMember } from '~/composables/api/firms.api'
import { toast } from 'vue-sonner'

interface Props {
  open: boolean
  member: FirmMember | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'suspended': [member: FirmMember]
}>()

const isLoading = ref(false)

const lawyerName = computed(() => {
  return props.member?.lawyer?.verification?.full_name || 'Lawyer'
})

const lawyerEmail = computed(() => {
  return props.member?.lawyer?.user?.email || ''
})

const handleSuspend = async () => {
  if (!props.member?.lawyer?.id) return

  isLoading.value = true
  try {
    await lawyersApi.suspendLawyer(props.member.lawyer.id)
    toast.success(`${lawyerName.value} has been suspended successfully`)
    emit('suspended', props.member)
    emit('update:open', false)
  } catch (error: any) {
    const errorMsg = error?.data?.detail || error?.message || 'Failed to suspend lawyer'
    toast.error(errorMsg)
    console.error('Error suspending lawyer:', error)
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  emit('update:open', false)
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="handleCancel"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-red-100 rounded-lg">
            <Icon icon="mdi:alert-circle" class="w-6 h-6 text-red-600" />
          </div>
          <h2 class="text-xl font-bold text-gray-900">Suspend Lawyer</h2>
        </div>
        <button 
          @click="handleCancel"
          class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          :disabled="isLoading"
        >
          <Icon icon="mdi:close" class="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <div class="space-y-4">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm text-gray-700">
            Are you sure you want to suspend <span class="font-semibold text-red-600">{{ lawyerName }}</span>?
          </p>
          <p class="text-xs text-gray-600 mt-2">
            {{ lawyerEmail }}
          </p>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-medium text-gray-700">Consequences:</p>
          <ul class="text-sm text-gray-600 space-y-1 ml-4 list-disc">
            <li>The lawyer will not be able to access their account</li>
            <li>All active bookings will be affected</li>
            <li>They can be reinstated later</li>
          </ul>
        </div>
      </div>

      <div class="flex gap-3 pt-2">
        <button
          @click="handleCancel"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          :disabled="isLoading"
        >
          Cancel
        </button>
        <button
          @click="handleSuspend"
          class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
          :disabled="isLoading"
        >
          <Icon v-if="isLoading" icon="mdi:loading" class="w-4 h-4 animate-spin" />
          {{ isLoading ? 'Suspending...' : 'Suspend Lawyer' }}
        </button>
      </div>
    </div>
  </div>
</template>
