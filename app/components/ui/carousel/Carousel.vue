<script setup lang="ts">
import emblaCarouselVue from 'embla-carousel-vue'
import { ref, onMounted, watch } from 'vue'

const props = withDefaults(defineProps<{
  slidesToShow?: number
  gap?: number
  autoplay?: boolean
  loop?: boolean
}>(), {
  slidesToShow: 4,
  gap: 24,
  autoplay: false,
  loop: true,
})

const [emblaRef, emblaApi] = emblaCarouselVue({
  loop: props.loop,
  align: 'start',
  slidesToScroll: 1,
})

const canScrollPrev = ref(false)
const canScrollNext = ref(false)

const updateScrollButtons = () => {
  if (!emblaApi.value) return
  canScrollPrev.value = emblaApi.value.canScrollPrev()
  canScrollNext.value = emblaApi.value.canScrollNext()
}

const scrollPrev = () => {
  if (emblaApi.value) emblaApi.value.scrollPrev()
}

const scrollNext = () => {
  if (emblaApi.value) emblaApi.value.scrollNext()
}

onMounted(() => {
  if (emblaApi.value) {
    updateScrollButtons()
    emblaApi.value.on('select', updateScrollButtons)
    emblaApi.value.on('reInit', updateScrollButtons)
  }
})

watch(emblaApi, (api) => {
  if (api) {
    updateScrollButtons()
    api.on('select', updateScrollButtons)
    api.on('reInit', updateScrollButtons)
  }
})

// Calculate slide width based on slidesToShow
const slideWidth = computed(() => {
  return `calc(${100 / props.slidesToShow}% - ${(props.gap * (props.slidesToShow - 1)) / props.slidesToShow}px)`
})
</script>

<template>
  <div class="relative group">
    <!-- Carousel Container -->
    <div ref="emblaRef" class="overflow-hidden">
      <div class="flex" :style="{ gap: `${gap}px` }">
        <slot />
      </div>
    </div>

    <!-- Navigation Buttons -->
    <button
      v-if="canScrollPrev"
      @click="scrollPrev"
      class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center text-primary-normal hover:bg-primary-normal hover:text-white transition-colors opacity-0 group-hover:opacity-100"
    >
      <Icon icon="mdi:chevron-left" class="w-6 h-6" />
    </button>

    <button
      v-if="canScrollNext"
      @click="scrollNext"
      class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center text-primary-normal hover:bg-primary-normal hover:text-white transition-colors opacity-0 group-hover:opacity-100"
    >
      <Icon icon="mdi:chevron-right" class="w-6 h-6" />
    </button>
  </div>
</template>
