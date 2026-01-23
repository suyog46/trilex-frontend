<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
  modelValue: string
  length?: number
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  length: 6,
  placeholder: "0",
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const otpInputs = ref<HTMLInputElement[]>([])

const otpArray = computed(() => {
  return props.modelValue.split('').concat(Array(props.length - props.modelValue.length).fill(''))
})

const handleInput = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value

  // Only allow digits
  value = value.replace(/[^0-9]/g, '')

  // Keep only the last digit if multiple digits are pasted
  if (value.length > 1) {
    value = value.charAt(value.length - 1)
  }

  // Update the otp value
  const otpChars = props.modelValue.split('')
  otpChars[index] = value

  let newOtp = otpChars.join('')

  // Remove trailing empty values
  newOtp = newOtp.replace(/0+$/, '')

  emit('update:modelValue', newOtp)

  // Move focus to next input
  if (value && index < props.length - 1) {
    otpInputs.value[index + 1]?.focus()
  }
}

const handleKeyDown = (index: number, event: KeyboardEvent) => {
  const input = event.target as HTMLInputElement

  if (event.key === 'Backspace') {
    const otpChars = props.modelValue.split('')

    if (input.value) {
      // Clear current input
      otpChars[index] = ''
    } else if (index > 0) {
      // Move to previous input
      otpChars[index - 1] = ''
      otpInputs.value[index - 1]?.focus()
    }

    emit('update:modelValue', otpChars.join('').replace(/0+$/, ''))
  } else if (event.key === 'ArrowLeft' && index > 0) {
    otpInputs.value[index - 1]?.focus()
  } else if (event.key === 'ArrowRight' && index < props.length - 1) {
    otpInputs.value[index + 1]?.focus()
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text') || ''
  const digits = pastedData.replace(/[^0-9]/g, '').slice(0, props.length)

  emit('update:modelValue', digits)

  // Focus on the next empty input or the last input
  const nextIndex = Math.min(digits.length, props.length - 1)
  otpInputs.value[nextIndex]?.focus()
}
</script>

<template>
  <div class="flex gap-2 justify-center">
    <input
      v-for="(digit, index) in props.length"
      :key="index"
      ref="otpInputs"
      :value="otpArray[index]"
      :placeholder="placeholder"
      type="text"
      inputmode="numeric"
      maxlength="1"
      :disabled="disabled"
      class="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-normal focus:outline-none focus:ring-1 focus:ring-primary-normal disabled:opacity-50 disabled:cursor-not-allowed"
      @input="handleInput(index, $event)"
      @keydown="handleKeyDown(index, $event)"
      @paste="handlePaste"
    />
  </div>
</template>
