<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'

interface Props {
  open: boolean
  isRejecting: boolean
  itemName: string
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const emit = defineEmits<{
  'approve': []
  'reject': [reason: string]
  'close': []
}>()

const rejectionReason = ref('')

const canSubmitReject = computed(() => {
  return rejectionReason.value.trim().length > 0
})

const handleApprove = () => {
  emit('approve')
  rejectionReason.value = ''
}

const handleReject = () => {
  if (canSubmitReject.value) {
    emit('reject', rejectionReason.value)
    rejectionReason.value = ''
  }
}

const handleClose = () => {
  rejectionReason.value = ''
  emit('close')
}
</script>

<template>
  <AlertDialog :open="open">
    <AlertDialogContent class="max-w-md bg-white">
      <AlertDialogHeader>
        <AlertDialogTitle class="text-primary-normal text-xl">
          {{ isRejecting ? 'Reject Verification' : 'Approve Verification' }}
        </AlertDialogTitle>
        <AlertDialogDescription>
          {{ isRejecting 
            ? `You are about to reject the verification for ${itemName}. Please provide a reason.`
            : `Are you sure you want to approve ${itemName}?`
          }}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <!-- Rejection Reason Input (only show for reject) -->
      <div v-if="isRejecting" class="space-y-3 py-4">
        <Label for="reason">Rejection Reason *</Label>
        <textarea
          id="reason"
          v-model="rejectionReason"
          placeholder="Explain why this verification is being rejected..."
          class="w-full p-2 ring-1 ring-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-normal min-h-[100px] resize-none"
        />
        <p v-if="!canSubmitReject" class="text-sm text-red-500">
          Rejection reason is required
        </p>
      </div>

      <!-- Dialog Actions -->
      <div class="flex gap-3 justify-end pt-4">
        <AlertDialogCancel as-child>
          <Button variant="outline" @click="handleClose">
            Cancel
          </Button>
        </AlertDialogCancel>

        <AlertDialogAction v-if="!isRejecting" as-child>
          <Button 
            class="bg-green-600 hover:bg-green-700"
            :disabled="isLoading"
            @click="handleApprove"
          >
            <Icon v-if="isLoading" icon="mdi:loading" class="w-4 h-4 mr-2 animate-spin" />
            Approve
          </Button>
        </AlertDialogAction>

        <AlertDialogAction v-else as-child class="text-white">
          <Button 
            class="bg-red-600 hover:bg-red-700"
            :disabled="isLoading || !canSubmitReject"
            @click="handleReject"
          >
            <Icon v-if="isLoading" icon="mdi:loading" class="w-4 h-4 mr-2 animate-spin" />
            Reject
          </Button>
        </AlertDialogAction>
      </div>
    </AlertDialogContent>
  </AlertDialog>
</template>
