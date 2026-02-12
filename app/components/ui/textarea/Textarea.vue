<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { useVModel } from "@vueuse/core"
import { cn } from "@/lib/utils"

const props = defineProps<{
  defaultValue?: string
  modelValue?: string
  class?: HTMLAttributes["class"]
}>()

const emits = defineEmits<{
  (e: "update:modelValue", payload: string): void
}>()

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <textarea 
    v-model="modelValue" 
    :class="cn(
      'flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900',
      'placeholder:text-gray-400 placeholder:font-normal',
      'transition-all duration-200 ease-in-out',
      'hover:border-gray-400',
      'focus:outline-none focus:ring-2 focus:ring-primary-normal/20 focus:border-primary-normal',
      'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-60',
      'resize-y',
      'shadow-sm hover:shadow',
      props.class
    )"
  />
</template>
