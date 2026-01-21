<template>
  <!-- <NuxtLayout name="dashboard"> -->
    <div>
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold" style="color: var(--color-primary-normal)">Documents</h1>
        <button
          class="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium"
          style="background: var(--color-primary-normal)"
        >
          <Icon name="mdi:upload" class="w-5 h-5" />
          <span>Upload Document</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="doc in documents"
          :key="doc.id"
          class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <Icon name="mdi:file-pdf-box" class="w-6 h-6 text-red-600" />
            </div>
            <button class="text-gray-400 hover:text-gray-600">
              <Icon name="mdi:dots-vertical" class="w-5 h-5" />
            </button>
          </div>
          <h3 class="font-semibold text-gray-900 mb-2">{{ doc.name }}</h3>
          <p class="text-sm text-gray-600 mb-4">{{ doc.size }} • {{ doc.date }}</p>
          <div class="flex gap-2">
            <button class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Download
            </button>
            <button class="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white" style="background: var(--color-primary-normal)">
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  <!-- </NuxtLayout> -->
</template>

<script setup lang="ts">
import { ref } from 'vue'
definePageMeta({
  layout: "lawyer",
})

const documents = ref([
  { id: 1, name: 'Case Brief.pdf', size: '2.5 MB', date: 'Jan 15, 2024' },
  { id: 2, name: 'Client Agreement.pdf', size: '1.2 MB', date: 'Jan 14, 2024' },
  { id: 3, name: 'Court Order.pdf', size: '890 KB', date: 'Jan 12, 2024' },
  { id: 4, name: 'Evidence Documents.pdf', size: '4.1 MB', date: 'Jan 10, 2024' },
  { id: 5, name: 'Legal Notice.pdf', size: '650 KB', date: 'Jan 08, 2024' },
  { id: 6, name: 'Settlement Agreement.pdf', size: '1.8 MB', date: 'Jan 05, 2024' }
])

</script>
