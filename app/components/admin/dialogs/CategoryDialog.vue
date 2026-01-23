<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

interface Props {
  open: boolean
  mode: 'create' | 'edit'
  name?: string
  isActive?: boolean
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  isActive: true,
})

const emit = defineEmits<{
  'submit': [data: { name: string; is_active: boolean }]
  'close': []
}>()

const formName = ref('')
const formIsActive = ref(true)

const canSubmit = computed(() => {
  return formName.value.trim().length > 0
})

watch(() => props.open, (newValue) => {
  if (newValue) {
    formName.value = props.name || ''
    formIsActive.value = props.isActive ?? true
  }
})

const handleSubmit = () => {
  if (canSubmit.value) {
    emit('submit', {
      name: formName.value.trim(),
      is_active: formIsActive.value,
    })
  }
}

const handleClose = () => {
  formName.value = ''
  formIsActive.value = true
  emit('close')
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="max-w-md bg-white">
      <DialogHeader>
        <DialogTitle>
          {{ mode === 'create' ? 'Create Case Category' : 'Edit Case Category' }}
        </DialogTitle>
        <DialogDescription>
          {{ mode === 'create' 
            ? 'Add a new case category to the system.'
            : 'Update the case category details.'
          }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <!-- Category Name -->
        <div class="space-y-2">
          <Label for="name">Category Name *</Label>
          <Input
            id="name"
            v-model="formName"
            placeholder="e.g., Criminal Law"
            :disabled="isLoading"
          />
          <p v-if="!canSubmit && formName.length > 0" class="text-sm text-red-500">
            Category name is required
          </p>
        </div>

        <!-- Active Status -->
        <div class="flex items-center gap-3">
          <input
            id="active"
            v-model="formIsActive"
            type="checkbox"
            class="w-4 h-4 cursor-pointer accent-primary-normal"
            :disabled="isLoading"
          />
          <label for="active" class="text-sm font-medium text-gray-700 cursor-pointer">
            Active
          </label>
        </div>
      </div>

      <!-- Dialog Actions -->
      <div class="flex gap-3 justify-end pt-4 border-t">
        <Button 
          variant="outline"
          @click="handleClose"
          :disabled="isLoading"
        >
          Cancel
        </Button>
        <Button
          class="bg-primary-normal text-white hover:shadow-sm"
          :disabled="isLoading || !canSubmit"
          @click="handleSubmit"
        >
          <Icon v-if="isLoading" icon="mdi:loading" class="w-4 h-4 mr-2 animate-spin" />
          {{ mode === 'create' ? 'Create' : 'Update' }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
