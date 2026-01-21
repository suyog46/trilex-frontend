<script setup lang="ts">
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface Step {
  key: string
  label: string
}

interface Props {
  steps: Step[]
  modelValue: string
  width?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: "100%",
})

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
}>()

const onChange = (value: string | number) => {
  emit("update:modelValue", String(value))
}
</script>

<template>
  <Tabs
    :model-value="modelValue"
    @update:model-value="onChange"
    class="w-full"
  >
    <TabsList
      class="flex w-full items-center"
      :style="{ width }"
    >
      <template v-for="(step, index) in steps" :key="step.key">
        <TabsTrigger
          :value="step.key"
          class="flex items-center gap-2 text-sm font-medium data-[state=active]:text-primary-normal"
        >
          <span
            class="flex h-6 w-6 items-center justify-center rounded-full border text-xs data-[state=active]:bg-primary-normal data-[state=active]:text-white"
          >
            {{ index + 1 }}
          </span>
          {{ step.label }}
        </TabsTrigger>
        
        <span
          v-if="index !== steps.length - 1"
          class="flex-1 h-[2px] bg-primary-normal mx-2"
        />
      </template>
    </TabsList>


    <slot />
  </Tabs>
</template>
