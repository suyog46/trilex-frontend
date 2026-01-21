<template>
  <section class="container mx-auto px-4 py-16 md:py-24">
    <div class="grid gap-12 lg:grid-cols-2 lg:items-center">
      <div class="space-y-8">
        <div>
          <h3 class="text-sm font-bold tracking-wider text-primary-normal uppercase">
            {{ badge }}
          </h3>
          <h2 class="mt-2 text-3xl font-semibold text-primary-normal md:text-3xl">
            {{ title }}
          </h2>
        </div>

        <div class="flex gap-2">
          <div
            v-for="(_, index) in steps"
            :key="index"
            :class="[
              'h-4 transition-all duration-300 rounded-full',
              currentStep === index
                ? 'w-16 bg-primary-normal'
                : 'w-4 bg-gray-200',
            ]"
          />
        </div>

        <div class="min-h-[100px]">
          <h4 v-if="steps && steps[currentStep]" class="text-2xl font-semibold text-primary-normal leading-tight md:text-3xl">
            {{ steps[currentStep].title }}
          </h4>
          <!-- <p class="mt-4 text-secondary-normal md:text-lg">{{ steps[currentStep].description }}</p> -->
        </div>

        <div class="flex gap-2">
          <button
            @click="prevStep"
            class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-secondary-normal transition-colors hover:bg-primary-light-hover"
            aria-label="Previous step"
          >
            <Icon icon="mdi:chevron-left" class="h-6 w-6" />
          </button>
          <button
            @click="nextStep"
            class="flex h-12 w-12 items-center justify-center rounded-full bg-text-secondary-normal transition-colors hover:bg-primary-light-hover"
            aria-label="Next step"
          >
            <Icon icon="mdi:chevron-right" class="h-6 w-6" />
          </button>
        </div>
      </div>

      <div class="relative flex justify-center lg:justify-end">
        <div class="relative w-full max-w-[550px]">
          <div class="overflow-hidden rounded-xl bg-slate-900 p-2 shadow-2xl ring-1 ring-slate-800">
            <img
              :key="currentStep"
              :src="steps[currentStep].image || '/placeholder.svg'"
              :alt="steps[currentStep].title"
              class="aspect-video w-full rounded-lg object-cover transition-opacity duration-300"
            />
          </div>
          <!-- <div class="absolute -bottom-10 -right-10 -z-10 h-64 w-64 rounded-full bg-gray-50 md:h-80 md:w-80" /> -->
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

export interface Step {
  title: string
  description: string
  image: string
}

interface Props {
  steps: Step[]
  badge?: string
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  badge: 'The Process',
  title: 'How To Register?',
})

const currentStep = ref(0)

const nextStep = () => {
  currentStep.value = (currentStep.value + 1) % props.steps.length
}

const prevStep = () => {
  currentStep.value = (currentStep.value - 1 + props.steps.length) % props.steps.length
}
</script>
