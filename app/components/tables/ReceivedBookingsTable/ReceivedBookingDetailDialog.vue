<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { bookingsApi, type BookingResponse } from '~/composables/api/bookings.api'
import { chatApi } from '~/composables/api/chat.api'
import { toast } from 'vue-sonner'
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{
  open: boolean
  booking: BookingResponse | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'accept', booking: BookingResponse): void
  (e: 'reject', booking: BookingResponse): void
}>()

const router = useRouter()
const authStore = useAuthStore()
const isProcessing = ref(false)

const closeDialog = () => {
  emit('update:open', false)
}

// Handle accept
const handleAccept = async () => {
  if (!props.booking) return
  isProcessing.value = true
  try {
    await bookingsApi.acceptBooking(props.booking.id)
    toast.success('Booking accepted successfully!')
    emit('accept', props.booking)
    closeDialog()
  } catch (error: any) {
    console.error('Error accepting booking:', error)
    const errorMsg = error?.data?.detail || error?.message || 'Failed to accept booking'
    toast.error(errorMsg)
  } finally {
    isProcessing.value = false
  }
}

// Handle reject
const handleReject = async () => {
  if (!props.booking) return
  isProcessing.value = true
  try {
    await bookingsApi.rejectBooking(props.booking.id)
    toast.success('Booking rejected successfully!')
    emit('reject', props.booking)
    closeDialog()
  } catch (error: any) {
    console.error('Error rejecting booking:', error)
    const errorMsg = error?.data?.detail || error?.message || 'Failed to reject booking'
    toast.error(errorMsg)
  } finally {
    isProcessing.value = false
  }
}

// Helper to format court type
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
    
    // Navigate based on user role
    const userRole = authStore.userRole
    if (userRole === 'client') {
      router.push('/client/messages')
    } else if (userRole === 'lawyer' || userRole === 'firm') {
      router.push('/chat')
    }
    
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
    <DialogContent class="sm:max-w-md bg-white">
      <DialogHeader>
        <DialogTitle class="text-xl font-bold text-primary-normal">
          Booking Details
        </DialogTitle>
        <DialogDescription class="text-gray-600">
          View the details of the booking request
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

        <!-- Client Info -->
        <div class="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 class="text-sm font-medium text-gray-900">Client Information</h4>
          <div class="flex items-center gap-3">
            <Icon
              icon="mdi:account-circle"
              class="w-8 h-8 text-primary-normal flex-shrink-0"
            />
            <div>
              <p class="font-medium text-gray-900">{{ booking.created_by.name }}</p>
              <p class="text-sm text-gray-600">{{ booking.created_by.email }}</p>
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

          <div v-if="booking.description">
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
            <p class="text-xs text-gray-600 mb-1">Received At</p>
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
      </div>

      <div class="flex gap-3">
        <Button
          variant="outline"
          class="flex-1"
          @click="closeDialog"
        >
          Close
        </Button>
        <template v-if="booking?.status === 'accepted'">
          <Button
            class="flex-1 bg-primary-normal hover:bg-primary-normal-hover text-white"
            :disabled="isProcessing"
            @click="handleOpenChat"
          >
            <Icon icon="mdi:message" class="w-5 h-5 mr-2" />
            Chat
          </Button>
        </template>
        <template v-if="booking?.status === 'pending'">
          <Button
            class="flex-1 bg-red-700 hover:bg-red-800 text-white"
            :disabled="isProcessing"
            @click="handleReject"
          >
            <Icon icon="mdi:close-circle" class="w-5 h-5 mr-2" />
            Reject
          </Button>
          <Button
            class="flex-1 bg-green-700 hover:bg-green-800 text-white"
            :disabled="isProcessing"
            @click="handleAccept"
          >
            <Icon icon="mdi:check-circle" class="w-5 h-5 mr-2" />
            Accept
          </Button>
        </template>
      </div>
    </DialogContent>
  </Dialog>
</template>
