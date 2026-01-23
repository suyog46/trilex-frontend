<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'default',
})

const formData = ref({
  fullName: '',
  email: '',
  phone: '',
  caseType: '',
  description: '',
})

const caseTypes = [
  'Criminal Law',
  'Civil Law',
  'Family Law',
  'Property Law',
  'Corporate Law',
  'Labor Law',
  'Immigration Law',
  'Tax Law',
  'Other',
]

const isSubmitting = ref(false)

const handleSubmit = async () => {
  if (!formData.value.fullName || !formData.value.email || !formData.value.caseType || !formData.value.description) {
    toast.error('Please fill in all required fields')
    return
  }

  isSubmitting.value = true
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  toast.success('Your enquiry has been submitted successfully! We will contact you soon.')
  
  // Reset form
  formData.value = {
    fullName: '',
    email: '',
    phone: '',
    caseType: '',
    description: '',
  }
  
  isSubmitting.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-primary-normal to-primary-normal-hover text-white py-16">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">Case Enquiry</h1>
        <p class="text-xl text-primary-light">
          Tell us about your legal needs and we'll connect you with the right professionals
        </p>
      </div>
    </div>

    <!-- Form Section -->
    <div class="max-w-2xl mx-auto px-4 py-12">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Submit Your Case Details</h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Full Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.fullName"
              type="text"
              placeholder="Enter your full name"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-normal focus:border-transparent outline-none transition-all"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.email"
              type="email"
              placeholder="Enter your email"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-normal focus:border-transparent outline-none transition-all"
            />
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              v-model="formData.phone"
              type="tel"
              placeholder="Enter your phone number"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-normal focus:border-transparent outline-none transition-all"
            />
          </div>

          <!-- Case Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Case Type <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.caseType"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-normal focus:border-transparent outline-none transition-all"
            >
              <option value="" disabled>Select case type</option>
              <option v-for="type in caseTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Case Description <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="formData.description"
              rows="5"
              placeholder="Briefly describe your legal issue or case..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-normal focus:border-transparent outline-none transition-all resize-none"
            ></textarea>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full py-4 bg-primary-normal text-white font-semibold rounded-lg hover:bg-primary-normal-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Icon v-if="isSubmitting" icon="mdi:loading" class="w-5 h-5 animate-spin" />
            {{ isSubmitting ? 'Submitting...' : 'Submit Enquiry' }}
          </button>
        </form>

        <!-- Info Box -->
        <div class="mt-8 p-4 bg-primary-light/30 rounded-lg">
          <div class="flex items-start gap-3">
            <Icon icon="mdi:information" class="w-6 h-6 text-primary-normal flex-shrink-0 mt-0.5" />
            <div class="text-sm text-gray-700">
              <p class="font-medium mb-1">What happens next?</p>
              <ul class="list-disc list-inside space-y-1 text-gray-600">
                <li>Our team will review your enquiry within 24 hours</li>
                <li>We'll match you with suitable lawyers based on your case type</li>
                <li>You'll receive recommendations via email and phone</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
