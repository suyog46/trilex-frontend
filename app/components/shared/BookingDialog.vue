<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { ref, onMounted, computed } from 'vue'
import { bookingsApi } from '~/composables/api/bookings.api'
import { casesApi, type Category } from '~/composables/api/address.api'
import { useAuthStore } from '~/stores/auth'
import { toast } from 'vue-sonner'

const props = defineProps<{
  open: boolean
  type: 'lawyer' | 'firm'
  name: string
  lawyerId?: string
  firmId?: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
  (e: 'booking-success'): void
}>()

const authStore = useAuthStore()

// Form state
const courtType = ref<string>('district')
const caseCategory = ref<string>('')
const description = ref<string>('')
const bookingDate = ref<string>('')
const categories = ref<Category[]>([])
const loadingCategories = ref(false)
const isSubmitting = ref(false)

const courtTypes = [
  { value: 'district', label: 'District Court' },
  { value: 'supreme', label: 'Supreme Court' },
  { value: 'high', label: 'High Court' },
  { value: 'family', label: 'Family Court' },
  { value: 'commercial', label: 'Commercial Court' },
]

const createdTo = computed(() => {
  return props.type === 'lawyer' ? props.lawyerId : props.firmId
})

const closeDialog = () => {
  resetForm()
  emit('update:open', false)
}

const resetForm = () => {
  courtType.value = 'district'
  caseCategory.value = ''
  description.value = ''
  bookingDate.value = ''
}

const fetchCategories = async () => {
  loadingCategories.value = true
  try {
    const response = await casesApi.getCategories({ active: true, page: 1, page_size: 100 })
    categories.value = response.results || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    toast.error('Failed to load case categories')
  } finally {
    loadingCategories.value = false
  }
}

const validateForm = (): boolean => {
  if (!createdTo.value) {
    toast.error('Lawyer/Firm ID is missing')
    return false
  }
  if (!caseCategory.value) {
    toast.error('Please select a case category')
    return false
  }
  if (!description.value.trim()) {
    toast.error('Please enter a description')
    return false
  }
  if (!bookingDate.value) {
    toast.error('Please select a booking date')
    return false
  }
  return true
}

const handleConfirm = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    const payload = {
      created_to: createdTo.value!,
      case_category: caseCategory.value,
      court_type: courtType.value,
      description: description.value,
      date: bookingDate.value,
    }

    const response = await bookingsApi.createBooking(payload)
    
    toast.success('Booking request sent successfully!')
    emit('booking-success')
    resetForm()
    emit('update:open', false)
  } catch (error: any) {
    console.error('Error creating booking:', error)
    const errorMsg = error?.data?.detail || error?.message || 'Failed to create booking'
    toast.error(errorMsg)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-4/5 bg-white max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="text-xl font-bold text-primary-normal">
          Book {{ type === 'lawyer' ? 'Lawyer' : 'Law Firm' }}
        </DialogTitle>
        <DialogDescription class="text-gray-600">
          Fill in the details to book {{ name }}
        </DialogDescription>
      </DialogHeader>
      
      <div class="py-6 space-y-4">
        <!-- Professional Info -->
        <div class="bg-primary-light/30 rounded-lg p-4">
          <div class="flex items-center gap-3">
            <Icon 
              :icon="type === 'lawyer' ? 'mdi:account-tie' : 'mdi:office-building'" 
              class="w-12 h-12 text-primary-normal" 
            />
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ name }}</h3>
              <p class="text-sm text-gray-600">{{ type === 'lawyer' ? 'Lawyer' : 'Law Firm' }}</p>
            </div>
          </div>
        </div>

        <!-- Booking Form -->
        <div class="space-y-4">
          <!-- Case Category -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              <span class="text-red-500">*</span> Case Category
            </label>
            <select
              v-model="caseCategory"
              :disabled="loadingCategories"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal disabled:bg-gray-100"
            >
              <option value="">{{ loadingCategories ? 'Loading categories...' : 'Select a category' }}</option>
              <option 
                v-for="category in categories" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Court Type -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              <span class="text-red-500">*</span> Court Type
            </label>
            <select
              v-model="courtType"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal"
            >
              <option 
                v-for="court in courtTypes" 
                :key="court.value" 
                :value="court.value"
              >
                {{ court.label }}
              </option>
            </select>
          </div>

          <!-- Description -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              <span class="text-red-500">*</span> Description
            </label>
            <textarea
              v-model="description"
              placeholder="Describe your case briefly..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-normal resize-none"
              rows="3"
            />
          </div>

          <!-- Booking Date -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              <span class="text-red-500">*</span> Preferred Date
            </label>
            <Input
              v-model="bookingDate"
              type="date"
              class="focus:ring-primary-normal"
            />
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <Button
          variant="outline"
          class="flex-1"
          @click="closeDialog"
          :disabled="isSubmitting"
        >
          Cancel
        </Button>
        <Button
          class="flex-1 bg-primary-normal hover:bg-primary-normal-hover text-white disabled:opacity-50"
          @click="handleConfirm"
          :disabled="isSubmitting"
        >
          <Icon v-if="isSubmitting" icon="mdi:loading" class="w-5 h-5 mr-2 animate-spin" />
          <Icon v-else icon="mdi:check" class="w-5 h-5 mr-2" />
          {{ isSubmitting ? 'Booking...' : 'Confirm Booking' }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
