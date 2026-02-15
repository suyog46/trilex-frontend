<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { casesApi, type RegisteredClient } from '~/composables/api/cases.api'
import { toast } from 'vue-sonner'
import { useDebounceFn } from '@vueuse/core'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'select': [client: RegisteredClient]
}>()

const searchQuery = ref('')
const clients = ref<RegisteredClient[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)

const fetchClients = async () => {
  loading.value = true
  try {
    const response = await casesApi.getClients({
      page: currentPage.value,
      page_size: pageSize.value,
      search: searchQuery.value || undefined,
    })
    clients.value = response.results
    totalCount.value = response.count
  } catch (error) {
    console.error('Failed to fetch clients:', error)
    toast.error('Failed to load clients')
  } finally {
    loading.value = false
  }
}

const debouncedSearch = useDebounceFn(() => {
  currentPage.value = 1
  fetchClients()
}, 500)

watch(searchQuery, () => {
  debouncedSearch()
})

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    fetchClients()
  }
})

const selectClient = (client: RegisteredClient) => {
  emit('select', client)
  emit('update:open', false)
}

const nextPage = () => {
  if (currentPage.value * pageSize.value < totalCount.value) {
    currentPage.value++
    fetchClients()
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchClients()
  }
}

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))
</script>

<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent class="max-w-2xl max-h-[80vh] flex flex-col bg-white">
      <DialogHeader>
        <DialogTitle>Select Registered Client</DialogTitle>
        <DialogDescription>
          Search and select a client from your registered clients list.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 flex-1 overflow-hidden flex flex-col">
        <div class="flex gap-2">
          <Input
            v-model="searchQuery"
            placeholder="Search by name or email..."
            class="flex-1"
          />
        </div>

        <div class="flex-1 overflow-y-auto border rounded-md">
          <div v-if="loading" class="flex items-center justify-center py-8">
            <Icon icon="mdi:loading" class="w-8 h-8 animate-spin text-primary-normal" />
          </div>

          <div v-else-if="clients.length === 0" class="flex flex-col items-center justify-center py-8 text-gray-500">
            <Icon icon="mdi:account-off" class="w-12 h-12 mb-2" />
            <p>No clients found</p>
          </div>

          <div v-else class="">
            <div
              v-for="client in clients"
              :key="client.id"
              class="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              @click="selectClient(client)"
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                  <img
                    v-if="client.verification?.passport_size_photo?.url"
                    :src="client.verification.passport_size_photo.url"
                    :alt="client.verification?.full_name"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-500">
                    <Icon icon="mdi:account" class="w-6 h-6" />
                  </div>
                </div>

                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-gray-900 truncate">
                    {{ client.verification?.full_name || 'N/A' }}
                  </h3>
                  <p class="text-sm text-gray-600 truncate">
                    {{ client.user.email }}
                  </p>
                  <p v-if="client.profile?.phone_number" class="text-sm text-gray-500 truncate">
                    {{ client.profile.phone_number }}
                  </p>
                </div>

                <div class="flex-shrink-0">
                  <Icon icon="mdi:chevron-right" class="w-6 h-6 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="totalCount > pageSize" class="flex items-center justify-between border-t pt-4">
          <div class="text-sm text-gray-600">
            Page {{ currentPage }} of {{ totalPages }} ({{ totalCount }} total)
          </div>
          <div class="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage === 1"
              @click="previousPage"
            >
              <Icon icon="mdi:chevron-left" class="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage >= totalPages"
              @click="nextPage"
            >
              Next
              <Icon icon="mdi:chevron-right" class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
