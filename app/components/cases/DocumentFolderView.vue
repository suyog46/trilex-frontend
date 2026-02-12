<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  clientFilesCount: number
  internalFilesCount: number
  firmFilesCount?: number
  showFirmFolder?: boolean
}>()

const emit = defineEmits<{
  'open-folder': [folder: 'client' | 'internal' | 'firm']
}>()

const folders = computed(() => {
  const baseFolders = [
    {
      id: 'client',
      name: 'Client Files',
      description: 'Documents shared with the client',
      icon: 'mdi:account-file',
      color: 'blue',
      count: props.clientFilesCount,
    },
    {
      id: 'internal',
      name: 'My Files',
      description: 'Internal documents (not shared with client)',
      icon: 'mdi:file-lock',
      color: 'green',
      count: props.internalFilesCount,
    },
  ]

  if (props.showFirmFolder) {
    baseFolders.push({
      id: 'firm',
      name: 'Other Lawyers Folder',
      description: 'Documents shared with other lawyers in the firm',
      icon: 'mdi:account-group',
      color: 'purple',
      count: props.firmFilesCount || 0,
    })
  }

  return baseFolders
})

const openFolder = (folderId: 'client' | 'internal' | 'firm') => {
  emit('open-folder', folderId)
}
</script>

<template>
  <div class="py-8">
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Case Documents</h3>
      <p class="text-sm text-gray-600">Organize and manage your case documents in folders</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="folder in folders"
        :key="folder.id"
        class="group relative bg-white border-2 border-gray-200 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:border-primary-normal hover:shadow-lg"
        @click="openFolder(folder.id as 'client' | 'internal' | 'firm')"
      >
        <!-- Folder Icon -->
        <div class="flex items-start gap-4">
          <div
            :class="[
              'w-16 h-16 rounded-lg flex items-center justify-center transition-colors bg-primary-normal-hover group-hover:bg-primary-normal/80',
            ]"
          >
            <Icon
              :icon="folder.icon"
              :class="[
                'w-8 h-8 text-white',
            
              ]"
            />
          </div>

          <div class="flex-1">
            <h4 class="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-normal transition-colors">
              {{ folder.name }}
            </h4>
            <p class="text-sm text-gray-600 mb-3">
              {{ folder.description }}
            </p>

            <!-- File Count Badge -->
            <div class="flex items-center gap-2">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-primary-normal',
                ]"
              >
                <Icon icon="mdi:file-document" class="w-4 h-4" />
                {{ folder.count }} {{ folder.count === 1 ? 'file' : 'files' }}
              </span>
            </div>
          </div>

          <!-- Arrow Icon -->
          <Icon
            icon="mdi:chevron-right"
            class="w-6 h-6 text-gray-400 group-hover:text-primary-normal group-hover:translate-x-1 transition-all"
          />
        </div>

        <!-- Hover Effect Border -->
        <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-normal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      </div>
    </div>
  </div>
</template>
