<script setup lang="ts">
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '~/components/ui/form'

interface Props {
  label: string
  inputId: string
  preview: string
  isUploading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  change: [event: Event]
  delete: []
}>()
</script>

<template>
  <FormField :name="inputId">
    <FormItem>
      <FormLabel class="text-gray-700 font-semibold">{{ label }} <span class="text-red-500">*</span></FormLabel>
      <FormControl>
        <div class="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-primary-normal transition">
          <div v-if="!preview" class="space-y-2">
            <input
              type="file"
              accept="image/*"
              @change="(e) => emit('change', e)"
              :disabled="isUploading"
              class="hidden"
              :id="inputId"
            />
            <label :for="inputId" class="cursor-pointer block">
              <Icon v-if="!isUploading" icon="mdi:cloud-upload-outline" class="w-10 h-10 mx-auto text-gray-400" />
              <Icon v-else icon="mdi:loading" class="w-10 h-10 mx-auto text-gray-400 animate-spin" />
              <p class="text-gray-600 font-medium mt-2">{{ isUploading ? 'Uploading...' : 'Click to upload or drag & drop' }}</p>
              <p class="text-sm text-gray-500">PNG, JPG, GIF, WebP up to 5MB</p>
            </label>
          </div>
          <div v-else class="space-y-2">
            <img :src="preview" alt="Preview" class="w-full h-[200px] object-cover mx-auto rounded" />
            <p class="text-sm text-green-600 font-medium">✓ Photo uploaded</p>
            <button
              type="button"
              @click="emit('delete')"
              class="text-xs text-red-600 hover:text-red-700 font-medium mt-2"
            >
              Delete & Replace
            </button>
          </div>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
