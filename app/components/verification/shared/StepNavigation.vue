<script setup lang="ts">
import { Button } from '~/components/ui/button'

defineProps<{
  currentStep: number
  totalSteps: number
  isSubmitting?: boolean
  canNext?: boolean
}>()

const emit = defineEmits(['previous', 'next', 'submit'])
</script>

<template>
  <div class="flex justify-between gap-3 pt-6">
    <Button
      v-if="currentStep > 1"
      type="button"
      @click="emit('previous')"
      variant="outline"
      class="px-6 py-2"
    >
      <Icon icon="mdi:arrow-left" class="w-5 h-5 mr-1" />
      Back
    </Button>
    <div v-else></div> <!-- Spacer -->

    <Button
      v-if="currentStep < totalSteps"
      type="button"
      @click="emit('next')"
      :disabled="!canNext"
      class="bg-primary-normal hover:bg-primary-normal/90 text-white px-6 py-2"
    >
      Next
      <Icon icon="mdi:arrow-right" class="w-5 h-5 ml-1" />
    </Button>

    <Button
      v-else
      type="submit"
      @click="emit('submit')"
      :disabled="isSubmitting || !canNext"
      class="bg-primary-normal hover:bg-primary-normal/90 text-white px-8 py-2"
    >
      <Icon v-if="isSubmitting" icon="mdi:loading" class="w-5 h-5 animate-spin mr-2" />
      {{ isSubmitting ? 'Submitting...' : 'Submit' }}
    </Button>
  </div>
</template>
