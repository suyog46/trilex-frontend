<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import type { BookingResponse } from '~/composables/api/bookings.api'
import { chatApi } from '~/composables/api/chat.api'
import { toast } from 'vue-sonner'

const props = defineProps<{
  open: boolean
  booking: BookingResponse | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const router = useRouter()
const isProcessing = ref(false)

const closeDialog = () => {
  emit('update:open', false)
}

const formatCourtType = (courtType: string): string => {
  const labelMap: { [key: string]: string } = {
    district: 'District Court',
    supreme: 'Supreme Court',
    high: 'High Court',
    family: 'Family Court',
    commercial: 'Commercial Court',
  }
  return labelMap[courtType] || courtType
}

// Helper to get status color
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'accepted':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Handle opening chat
const handleOpenChat = async () => {
  if (!props.booking) return
  isProcessing.value = true
  try {
    await chatApi.createRoom(props.booking.id)
    toast.success('Chat room created successfully!')
    router.push('/client/messages')
    closeDialog()
  } catch (error: any) {
    console.error('Error creating chat room:', error)
    const errorMsg = error?.data?.detail || error?.message || 'Failed to create chat room'
    toast.error(errorMsg)
  } finally {
    isProcessing.value = false
  }
}

</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:w-full bg-white">
      <DialogHeader>
        <DialogTitle class="text-xl font-bold text-primary-normal">
          Booking Details
        </DialogTitle>
        <DialogDescription class="text-gray-600">
          View the details of your booking request
        </DialogDescription>
      </DialogHeader>

      <div v-if="booking" class="py-6 space-y-6">
        <!-- Status Badge -->
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-gray-700">Status</h3>
          <span
            :class="[
              'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
              getStatusColor(booking.status),
            ]"
          >
            {{ booking.status.charAt(0).toUpperCase() + booking.status.slice(1) }}
          </span>
        </div>

        <!-- Lawyer/Firm Info -->
        <div class="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 class="text-sm font-medium text-gray-900">Lawyer/Firm Information</h4>
          <div class="flex items-center gap-3">
            <Icon
              icon="mdi:account-tie"
              class="w-8 h-8 text-primary-normal flex-shrink-0"
            />
            <div>
              <p class="font-medium text-gray-900">{{ booking.created_to.name }}</p>
              <p class="text-sm text-gray-600">{{ booking.created_to.email }}</p>
            </div>
          </div>
        </div>

        <!-- Case Information -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium text-gray-900">Case Information</h4>

          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 p-3 rounded-lg">
              <p class="text-xs text-gray-600 mb-1">Case Type</p>
              <p class="text-sm font-medium text-gray-900">
                {{ booking.case_category_name }}
              </p>
            </div>

            <div class="bg-gray-50 p-3 rounded-lg">
              <p class="text-xs text-gray-600 mb-1">Court Type</p>
              <p class="text-sm font-medium text-gray-900">
                {{ formatCourtType(booking.court_type) }}
              </p>
            </div>
          </div>

          <div>
            <label class="text-xs text-gray-600 mb-2 block">Description</label>
            <div class="bg-gray-50 p-3 rounded-lg">
              <p class="text-sm text-gray-700 break-words">{{ booking.description }}</p>
            </div>
          </div>
        </div>

        <!-- Date Information -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 p-3 rounded-lg">
            <p class="text-xs text-gray-600 mb-1">Booking Date</p>
            <p class="text-sm font-medium text-gray-900">
              {{
                new Date(booking.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              }}
            </p>
          </div>

          <div class="bg-gray-50 p-3 rounded-lg">
            <p class="text-xs text-gray-600 mb-1">Created At</p>
            <p class="text-sm font-medium text-gray-900">
              {{
                new Date(booking.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              }}
            </p>
          </div>
        </div>

        <!-- Your Details -->
        <div class="bg-primary-light/30 rounded-lg p-4 space-y-2">
          <h4 class="text-sm font-medium text-gray-900">Your Information</h4>
          <p class="text-sm text-gray-700">
            <span class="font-medium">Name:</span> {{ booking.created_by.name }}
          </p>
          <p class="text-sm text-gray-700">
            <span class="font-medium">Email:</span> {{ booking.created_by.email }}
          </p>
        </div>
      </div>

      <div class="flex gap-3">
        <Button
          variant="outline"
          class="flex-1"
          @click="closeDialog"
        >
          Close
        </Button>
        <Button
          v-if="booking?.status === 'accepted'"
          class="flex-1 bg-primary-normal hover:bg-primary-normal-hover text-white"
          :disabled="isProcessing"
          @click="handleOpenChat"
        >
          <Icon icon="mdi:message" class="w-5 h-5 mr-2" />
          Chat
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
