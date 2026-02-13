<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { firmsApi, type Firm } from '~/composables/api/firms.api'
import { Button } from '~/components/ui/button'
import BookingDialog from '~/components/shared/BookingDialog.vue'
import { toast } from 'vue-sonner'

definePageMeta({
  middleware: ['auth', 'client'],
})

const route = useRoute()
const firmId = computed(() => route.params.id as string)

const firm = ref<Firm | null>(null)
const isLoading = ref(false)
const showBookingDialog = ref(false)

// Helper to format address
const formattedAddress = computed(() => {
  const addr = firm.value?.profile?.address
  if (!addr) return 'N/A'
  
  const parts = []
  if (addr.ward?.number) parts.push(`Ward ${addr.ward.number}`)
  if (addr.municipality?.title) parts.push(addr.municipality.title)
  if (addr.district?.title) parts.push(addr.district.title)
  if (addr.province?.title) parts.push(addr.province.title)
  
  return parts.length > 0 ? parts.join(', ') : 'N/A'
})

const fetchFirm = async () => {
  isLoading.value = true
  try {
    const response = await firmsApi.getFirmById(firmId.value)
    firm.value = response
    
  } catch (error: any) {
    console.error('Error fetching firm:', error)
    toast.error('Failed to load law firm details')
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
  fetchFirm()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-20 px-4 md:px-8">
    <div class="w-full">
      <!-- Back Button -->
      <NuxtLink 
        to="/client/firms"
        class="inline-flex items-center gap-2 text-primary-normal hover:text-primary-normal-hover mb-6"
      >
        <Icon icon="mdi:arrow-left" class="w-5 h-5" />
        Back to Law Firms
      </NuxtLink>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <Icon icon="mdi:loading" class="w-12 h-12 text-primary-normal animate-spin mx-auto mb-4" />
          <p class="text-gray-600">Loading firm details...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="!firm" class="text-center py-20">
        <Icon icon="mdi:alert-circle" class="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Firm Not Found</h3>
        <p class="text-gray-500 mb-4">The law firm you're looking for doesn't exist.</p>
        <NuxtLink 
          to="/client/firms"
          class="text-primary-normal hover:text-primary-normal-hover font-medium"
        >
          Browse all law firms
        </NuxtLink>
      </div>

      <!-- Firm Details -->
      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="h-48 bg-slate-100 flex items-center justify-center overflow-hidden">
          <img
            v-if="firm.verification?.firm_license?.url"
            :src="firm.verification.firm_license.url"
            :alt="firm.verification?.firm_name || 'Law Firm'"
            class="w-full h-full object-cover"
          />
          <Icon v-else icon="mdi:office-building" class="w-20 h-20 text-primary-normal" />
        </div>

        <div class="p-8 space-y-8">
          <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div class="space-y-2">
              <p class="text-xs uppercase tracking-wider text-gray-500">Law firm</p>
              <h1 class="text-3xl font-semibold text-gray-900">
                {{ firm.verification?.firm_name || 'Law Firm' }}
              </h1>
              <p class="text-sm text-gray-600">{{ firm.user?.email || 'N/A' }}</p>
              <p class="text-sm text-gray-600">{{ formattedAddress }}</p>
            </div>
            <div class="flex items-center gap-3">
              <Button
                @click="handleBooking"
                class="bg-primary-normal hover:bg-primary-normal-hover text-white px-6 py-3"
              >
                <Icon icon="mdi:calendar-check" class="w-5 h-5 mr-2" />
                Book Consultation
              </Button>
            </div>
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div class="xl:col-span-2 rounded-xl border border-gray-100 bg-white p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt class="text-gray-500">Email</dt>
                  <dd class="text-gray-900 mt-1">{{ firm.user?.email || 'N/A' }}</dd>
                </div>
                <div>
                  <dt class="text-gray-500">Phone</dt>
                  <dd class="text-gray-900 mt-1">{{ firm.profile?.phone_number || 'N/A' }}</dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-gray-500">Address</dt>
                  <dd class="text-gray-900 mt-1">{{ formattedAddress }}</dd>
                </div>
              </dl>
            </div>

            <div class="rounded-xl border border-gray-100 bg-white p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">License</h3>
              <p class="text-sm text-gray-600 mb-4">Official firm license document.</p>
              <a
                v-if="firm.verification?.firm_license?.url"
                :href="firm.verification.firm_license.url"
                target="_blank"
                class="inline-flex items-center gap-2 text-primary-normal hover:text-primary-normal-hover text-sm font-medium"
              >
                <Icon icon="mdi:file-document" class="w-4 h-4" />
                View License
                <Icon icon="mdi:open-in-new" class="w-4 h-4" />
              </a>
              <p v-else class="text-sm text-gray-500">License document not available.</p>
            </div>
          </div>

          <div class="rounded-xl border border-gray-100 bg-white p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Services</h3>
            <div v-if="firm.profile?.services?.length" class="flex flex-wrap gap-2">
              <span
                v-for="service in firm.profile.services"
                :key="service.id"
                class="px-3 py-1.5 bg-slate-100 text-gray-700 text-sm font-medium rounded-full"
              >
                {{ service.name }}
              </span>
            </div>
            <p v-else class="text-sm text-gray-500">No services listed.</p>
          </div>

          <div class="rounded-xl border border-gray-100 bg-slate-50 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Ready to get started?</h3>
              <p class="text-sm text-gray-600">Book a consultation with this law firm today.</p>
            </div>
            <Button
              @click="handleBooking"
              class="bg-primary-normal hover:bg-primary-normal-hover text-white px-6 py-3"
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Dialog -->
    <BookingDialog
      v-model:open="showBookingDialog"
      type="firm"
      :name="firm?.verification?.firm_name || 'Law Firm'"
      :firm-id="firm?.user?.id"
      @confirm="handleBookingConfirm"
    />
  </div>
</template>
