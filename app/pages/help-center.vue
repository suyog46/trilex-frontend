<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 pt-20">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-primary-normal mb-6">Help Center</h1>
      
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        
        <div class="space-y-4">
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-semibold text-gray-900 mb-2">How do I book a consultation with a lawyer?</h3>
            <p class="text-gray-600">Browse our lawyer directory, select a lawyer that matches your needs, and click the "Book Consultation" button on their profile page.</p>
          </div>
          
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-semibold text-gray-900 mb-2">How do I verify my profile?</h3>
            <p class="text-gray-600">Go to your dashboard and navigate to the verification section. Upload the required documents and our team will review them within 24-48 hours.</p>
          </div>
          
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-semibold text-gray-900 mb-2">What payment methods are accepted?</h3>
            <p class="text-gray-600">We accept various payment methods including eSewa, Khalti, bank transfers, and major credit/debit cards.</p>
          </div>
          
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-semibold text-gray-900 mb-2">How can I contact support?</h3>
            <p class="text-gray-600">You can reach our support team at support@trilex.com or call us at +977 1234567890 during business hours.</p>
          </div>
        </div>
      </div>

      <!-- Contact Support Section -->
      <div class="bg-primary-light/30 rounded-2xl p-8 text-center">
        <Icon icon="mdi:headset" class="w-16 h-16 text-primary-normal mx-auto mb-4" />
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Need More Help?</h2>
        <p class="text-gray-600 mb-6">Our support team is ready to assist you</p>
        <div class="flex flex-wrap justify-center gap-4">
          <a href="mailto:support@trilex.com" class="flex items-center gap-2 px-6 py-3 bg-primary-normal text-white rounded-lg hover:bg-primary-normal-hover transition-colors">
            <Icon icon="mdi:email" class="w-5 h-5" />
            Email Support
          </a>
          <a href="tel:+9771234567890" class="flex items-center gap-2 px-6 py-3 border-2 border-primary-normal text-primary-normal rounded-lg hover:bg-primary-light transition-colors">
            <Icon icon="mdi:phone" class="w-5 h-5" />
            Call Us
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
