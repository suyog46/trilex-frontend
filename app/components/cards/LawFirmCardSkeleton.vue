<script setup lang="ts">
import { Skeleton } from '~/components/ui/skeleton'
</script>

<template>
  <div class="w-full max-w-[340px] rounded-lg flex flex-col p-6 bg-white border border-primary-light-active">
    <Skeleton class="w-full h-48 rounded-lg mb-4" />

    <div class="flex flex-col gap-4 flex-1">
      <div class="space-y-2">
        <Skeleton class="h-6 w-3/4" />
        <Skeleton class="h-4 w-full" />
      </div>

      <div class="flex flex-wrap gap-2">
        <Skeleton class="h-6 w-16 rounded-full" />
        <Skeleton class="h-6 w-20 rounded-full" />
        <Skeleton class="h-6 w-14 rounded-full" />
      </div>

      <div class="flex flex-col gap-2 border-t border-primary-light-active pt-4 mt-auto">
        <div class="flex justify-between items-center">
          <Skeleton class="h-4 w-12" />
          <Skeleton class="h-4 w-24" />
        </div>
        <div class="flex justify-between items-center">
          <Skeleton class="h-4 w-16" />
          <Skeleton class="h-4 w-28" />
        </div>
      </div>

      <Skeleton class="w-full h-10 mt-4 rounded-lg" />
    </div>
  </div>
</template>
