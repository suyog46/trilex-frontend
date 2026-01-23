<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'

const props = defineProps<{
  open: boolean
  type: 'lawyer' | 'firm'
  name: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
}>()

const closeDialog = () => {
  emit('update:open', false)
}

const handleConfirm = () => {
  emit('confirm')
  closeDialog()
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md bg-white">
      <DialogHeader>
        <DialogTitle class="text-xl font-bold text-primary-normal">
          Book {{ type === 'lawyer' ? 'Lawyer' : 'Law Firm' }}
        </DialogTitle>
        <DialogDescription class="text-gray-600">
          You are about to book {{ name }}
        </DialogDescription>
      </DialogHeader>
      
      <div class="py-6">
        <div class="bg-primary-light/30 rounded-lg p-6 text-center">
          <Icon 
            :icon="type === 'lawyer' ? 'mdi:account-tie' : 'mdi:office-building'" 
            class="w-16 h-16 text-primary-normal mx-auto mb-4" 
          />
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ name }}</h3>
          <p class="text-sm text-gray-600">
            This feature is coming soon! You'll be able to book consultations directly.
          </p>
        </div>

        <div class="mt-6 space-y-3">
          <div class="flex items-center gap-3 text-sm text-gray-600">
            <Icon icon="mdi:clock-outline" class="w-5 h-5 text-primary-normal" />
            <span>Booking functionality will be available soon</span>
          </div>
          <div class="flex items-center gap-3 text-sm text-gray-600">
            <Icon icon="mdi:email-outline" class="w-5 h-5 text-primary-normal" />
            <span>For now, contact via email or phone</span>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <Button
          variant="outline"
          class="flex-1"
          @click="closeDialog"
        >
          Cancel
        </Button>
        <Button
          class="flex-1 bg-primary-normal hover:bg-primary-normal-hover text-white"
          @click="handleConfirm"
        >
          <Icon icon="mdi:check" class="w-5 h-5 mr-2" />
          Got It
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
