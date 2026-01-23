<script setup lang="ts">
definePageMeta({
  layout: 'default',
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-primary-normal to-primary-normal-hover text-white py-20">
      <div class="max-w-6xl mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">About Trilex</h1>
        <p class="text-xl text-primary-light max-w-2xl mx-auto">
          Connecting clients with trusted legal professionals across Nepal
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-6xl mx-auto px-4 py-16">
      <!-- Mission Section -->
      <section class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p class="text-gray-600 max-w-3xl mx-auto text-lg">
            Trilex is dedicated to bridging the gap between individuals seeking legal assistance and qualified legal professionals. 
            We believe everyone deserves access to quality legal services.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <div class="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="mdi:shield-check" class="w-8 h-8 text-primary-normal" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Verified Professionals</h3>
            <p class="text-gray-600">
              All lawyers and law firms on our platform undergo thorough verification to ensure credibility and expertise.
            </p>
          </div>

          <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <div class="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="mdi:handshake" class="w-8 h-8 text-primary-normal" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Easy Connections</h3>
            <p class="text-gray-600">
              Find the right lawyer for your needs with our intuitive search and booking system.
            </p>
          </div>

          <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <div class="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="mdi:lock" class="w-8 h-8 text-primary-normal" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Secure & Private</h3>
            <p class="text-gray-600">
              Your information and communications are protected with industry-standard security measures.
            </p>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="bg-primary-normal rounded-2xl p-12 text-white mb-16">
        <div class="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <p class="text-4xl font-bold mb-2">500+</p>
            <p class="text-primary-light">Verified Lawyers</p>
          </div>
          <div>
            <p class="text-4xl font-bold mb-2">100+</p>
            <p class="text-primary-light">Law Firms</p>
          </div>
          <div>
            <p class="text-4xl font-bold mb-2">10,000+</p>
            <p class="text-primary-light">Cases Handled</p>
          </div>
          <div>
            <p class="text-4xl font-bold mb-2">77</p>
            <p class="text-primary-light">Districts Covered</p>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
        <p class="text-gray-600 mb-8">Have questions? We're here to help.</p>
        <div class="flex flex-wrap justify-center gap-4">
          <a href="mailto:contact@trilex.com" class="flex items-center gap-2 px-6 py-3 bg-primary-normal text-white rounded-lg hover:bg-primary-normal-hover transition-colors">
            <Icon icon="mdi:email" class="w-5 h-5" />
            contact@trilex.com
          </a>
          <a href="tel:+9771234567890" class="flex items-center gap-2 px-6 py-3 border-2 border-primary-normal text-primary-normal rounded-lg hover:bg-primary-light transition-colors">
            <Icon icon="mdi:phone" class="w-5 h-5" />
            +977 1234567890
          </a>
        </div>
      </section>
    </div>
  </div>
</template>
