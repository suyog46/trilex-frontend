<script setup lang="ts">
import { computed } from "vue"

interface Props {
  name?: string
  image?: string | null
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  name: "User",
  image: null,
  size: 40,
})

const avatar = computed(() => {
  const safeName = props.name?.trim() || "User"

  return {
    name: safeName,
    image: props.image && props.image.length > 0 ? props.image : null,
    fallback: safeName.charAt(0).toUpperCase(),
  }
})
</script>

<template>
  <Avatar
    :style="{
      width: `${props.size}px`,
      height: `${props.size}px`,
    }"
  >
    <AvatarImage
      v-if="avatar.image"
      :src="avatar.image"
      :alt="avatar.name"
    />
    <AvatarFallback class="font-medium  px-2 rounded-full bg-gray-200 text-gray-600 ">
      {{ avatar.fallback }}
    </AvatarFallback>
  </Avatar>
</template>
