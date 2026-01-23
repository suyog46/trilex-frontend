<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { lawyersApi, type Lawyer } from '~/composables/api/lawyers.api'
import { Button } from '~/components/ui/button'
import BookingDialog from '~/components/shared/BookingDialog.vue'
import { toast } from 'vue-sonner'

definePageMeta({
  // layout: 'client',
  middleware: ['auth', 'client'],
})

const route = useRoute()
const lawyerId = computed(() => route.params.id as string)

const lawyer = ref<Lawyer | null>(null)
const isLoading = ref(false)
const showBookingDialog = ref(false)

// Helper to format address
const formattedAddress = computed(() => {
  const addr = lawyer.value?.profile?.address
  if (!addr) return 'N/A'
  
  const parts = []
  if (addr.ward?.number) parts.push(`Ward ${addr.ward.number}`)
  if (addr.municipality?.title) parts.push(addr.municipality.title)
  if (addr.district?.title) parts.push(addr.district.title)
  if (addr.province?.title) parts.push(addr.province.title)
  
  return parts.length > 0 ? parts.join(', ') : 'N/A'
})

const fetchLawyer = async () => {
  isLoading.value = true
  try {
    const response = await lawyersApi.getLawyerById(lawyerId.value)
    lawyer.value = response
  } catch (error: any) {
    console.error('Error fetching lawyer:', error)
    toast.error('Failed to load lawyer details')
  } finally {
    isLoading.value = false
  }
}

const handleBooking = () => {
  showBookingDialog.value = true
}

const handleBookingConfirm = () => {
  toast.success('Booking request noted! We will implement this feature soon.')
}

onMounted(() => {
  fetchLawyer()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 pt-16 pb-2 px-4 md:px-8">
    <div class="max-w-full mx-auto">
      <!-- Back Button -->
      <NuxtLink 
        to="/client/lawyers"
        class="inline-flex items-center gap-2 text-primary-normal hover:text-primary-normal-hover mb-6"
      >
        <Icon icon="mdi:arrow-left" class="w-5 h-5" />
        Back to Lawyers
      </NuxtLink>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <Icon icon="mdi:loading" class="w-12 h-12 text-primary-normal animate-spin mx-auto mb-4" />
          <p class="text-gray-600">Loading lawyer details...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="!lawyer" class="text-center py-20">
        <Icon icon="mdi:alert-circle" class="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Lawyer Not Found</h3>
        <p class="text-gray-500 mb-4">The lawyer you're looking for doesn't exist.</p>
        <NuxtLink 
          to="/client/lawyers"
          class="text-primary-normal hover:text-primary-normal-hover font-medium"
        >
          Browse all lawyers
        </NuxtLink>
      </div>

      <!-- Lawyer Details -->
      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Header Image -->
        <div class="h-64 bg-gradient-to-br from-primary-light-active to-primary-light flex items-center justify-center overflow-hidden">
          <img 
            v-if="lawyer.verification?.license_photo?.url" 
            :src="lawyer.verification.license_photo.url" 
            :alt="lawyer.verification?.full_name || 'Lawyer'"
            class="w-full h-full object-cover"
          />
          <Icon v-else icon="mdi:account-tie" class="w-24 h-24 text-primary-normal" />
        </div>

        <!-- Content -->
        <div class="p-8">
          <!-- Title and Book Button -->
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">
                {{ lawyer.verification?.full_name || 'Lawyer' }}
              </h1>
              <p class="text-gray-600">{{ lawyer.user?.email }}</p>
            </div>
            <Button
              @click="handleBooking"
              class="bg-primary-normal hover:bg-primary-normal-hover text-white px-8 py-3 text-lg"
            >
              <Icon icon="mdi:calendar-check" class="w-5 h-5 mr-2" />
              Book This Lawyer
            </Button>
          </div>

          <!-- Details Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <!-- Contact Info -->
            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <Icon icon="mdi:email" class="w-5 h-5 text-primary-normal" />
                  <span class="text-gray-700">{{ lawyer.user?.email || 'N/A' }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <Icon icon="mdi:phone" class="w-5 h-5 text-primary-normal" />
                  <span class="text-gray-700">{{ lawyer.profile?.phone_number || 'N/A' }}</span>
                </div>
                <div class="flex items-start gap-3">
                  <Icon icon="mdi:map-marker" class="w-5 h-5 text-primary-normal mt-0.5" />
                  <span class="text-gray-700">{{ formattedAddress }}</span>
                </div>
              </div>
            </div>

            <!-- License Photo -->
            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">License</h3>
              <div v-if="lawyer.verification?.license_photo?.url" class="space-y-3">
                <a 
                  :href="lawyer.verification.license_photo.url" 
                  target="_blank"
                  class="inline-flex items-center gap-2 text-primary-normal hover:text-primary-normal-hover"
                >
                  <Icon icon="mdi:file-document" class="w-5 h-5" />
                  View License Document
                  <Icon icon="mdi:open-in-new" class="w-4 h-4" />
                </a>
              </div>
              <p v-else class="text-gray-500">License document not available</p>
            </div>
          </div>

          <!-- Services -->
          <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Services Offered</h3>
            <div v-if="lawyer.profile?.services?.length" class="flex flex-wrap gap-2">
              <span 
                v-for="service in lawyer.profile.services" 
                :key="service.id"
                class="px-4 py-2 bg-primary-light text-primary-normal font-medium rounded-full"
              >
                {{ service.name }}
              </span>
            </div>
            <p v-else class="text-gray-500">No services listed</p>
          </div>

          <!-- CTA -->
          <div class="border-t border-gray-200 pt-6">
            <div class="bg-primary-light/30 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Ready to get started?</h3>
                <p class="text-gray-600">Book a consultation with this lawyer today.</p>
              </div>
              <Button
                @click="handleBooking"
                class="bg-primary-normal hover:bg-primary-normal-hover text-white px-8 py-3"
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Dialog -->
    <BookingDialog
      v-model:open="showBookingDialog"
      type="lawyer"
      :name="lawyer?.verification?.full_name || 'Lawyer'"
      @confirm="handleBookingConfirm"
    />
  </div>
</template>
