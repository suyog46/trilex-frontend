<script setup lang="ts">
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface Tab {
  key: string
  label: string
}

interface Props {
  tabs: Tab[]
  modelValue: string
}

const props = defineProps<Props>()

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
    <TabsList class="flex gap-0 bg-transparent border-b border-gray-200 rounded-none w-full justify-start p-0 h-auto">
      <template v-for="tab in tabs" :key="tab.key">
        <TabsTrigger
          :value="tab.key"
          class="rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-gray-700 data-[state=active]:border-primary-normal data-[state=active]:text-primary-normal data-[state=active]:bg-transparent hover:text-gray-900 transition-colors"
        >
          {{ tab.label }}
        </TabsTrigger>
      </template>
    </TabsList>

    <slot />
  </Tabs>
</template>
