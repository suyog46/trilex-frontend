<template>
  <div class="flex flex-col">
    <!-- Hero Section -->
    <div class="py-10 px-4 container mx-auto">
      <HeroSection />
    </div>

    <!-- Trusted By Section -->
    <!-- <section class="py-12 px-4 bg-primary-light/20 border-y border-primary-light-active/30">
      <div class="container mx-auto">
        <p class="text-center text-sm text-gray-500 mb-8 uppercase tracking-wider font-medium">
          Trusted by leading organizations across Nepal
        </p>
        <div class="flex flex-wrap justify-center items-center gap-12 md:gap-16 opacity-60">
          <div v-for="i in 5" :key="i" class="flex items-center gap-2 text-primary-normal/70">
            <Icon icon="mdi:shield-check" class="w-8 h-8" />
            <span class="font-semibold text-lg">Partner {{ i }}</span>
          </div>
        </div>
      </div>
    </section> -->

    <section class="pb-20 px-4 bg-gradient-to-b from-white via-primary-light/30 to-white">
      <div class="container mx-auto">
        <div class="flex flex-col gap-10">
          <!-- Section Header -->
          <div 
            class="flex justify-between items-end opacity-0 animate-fade-in-up"
            style="animation-delay: 0.1s"
          >
            <div class="flex flex-col gap-2">
              <span class="text-sm font-semibold text-primary-normal/70 uppercase tracking-wider">
                Trusted Partners
              </span>
              <LandingPageTitle
                heading="Best Law Firms in Nepal"
                subheading="Find the top legal experts for your needs"
              />
            </div>
            <NuxtLink 
              to="/client/firms" 
              class="group text-primary-normal hover:text-primary-normal-hover font-semibold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary-light/50 transition-all duration-300"
            >
              View All
              <Icon icon="mdi:arrow-right" class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </NuxtLink>
          </div>
          
          <!-- Loading Skeletons -->
          <div v-if="firmsLoading" class="flex gap-6 overflow-hidden">
            <div 
              v-for="i in 4" 
              :key="i" 
              class="opacity-0 animate-fade-in"
              :style="`animation-delay: ${i * 0.1}s`"
            >
              <LawFirmCardSkeleton />
            </div>
          </div>
          
          <!-- Firms Carousel -->
          <div 
            v-else-if="firms.length > 0" 
            class="opacity-0 animate-fade-in-up"
            style="animation-delay: 0.2s"
          >
            <Carousel :slides-to-show="4" :gap="24">
              <CarouselItem v-for="firm in firms" :key="firm.verification?.id || firm.user?.email" basis="340px">
                <LawFirmCard :firm="firm" class="hover:-translate-y-2 transition-transform duration-300" />
              </CarouselItem>
            </Carousel>
          </div>
          
          <!-- Empty State -->
          <div 
            v-else 
            class="text-center py-16 bg-primary-light/20 rounded-2xl border border-primary-light-active/50"
          >
            <Icon icon="mdi:office-building-outline" class="w-16 h-16 text-primary-light-active mx-auto mb-4" />
            <p class="text-gray-500 text-lg">No law firms available at the moment.</p>
            <p class="text-gray-400 text-sm mt-1">Check back soon for updates.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="py-20 px-4 bg-white">
      <div class="container mx-auto">
        <div class="text-center mb-16">
          <span class="text-sm font-semibold text-primary-normal/70 uppercase tracking-wider">
            Why Choose Us
          </span>
          <h2 class="text-3xl md:text-4xl font-bold text-primary-normal mt-2 mb-4">
            The Smarter Way to Find Legal Help
          </h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            We combine technology with legal expertise to provide you the best experience in finding the right legal professional.
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="(feature, index) in features" 
            :key="feature.title"
            class="group p-8 rounded-2xl bg-gradient-to-br from-primary-light/30 to-white border border-primary-light-active/30 hover:border-primary-normal/30 hover:shadow-xl hover:shadow-primary-normal/5 transition-all duration-300 opacity-0 animate-fade-in-up"
            :style="`animation-delay: ${index * 0.1}s`"
          >
            <div class="w-14 h-14 rounded-xl bg-primary-normal/10 flex items-center justify-center mb-6 group-hover:bg-primary-normal group-hover:scale-110 transition-all duration-300">
              <Icon :icon="feature.icon" class="w-7 h-7 text-primary-normal group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 class="text-xl font-bold text-primary-normal mb-3">{{ feature.title }}</h3>
            <p class="text-gray-600 leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Best Lawyers Section -->
    <section class="py-20 px-4 bg-gradient-to-b from-primary-light/20 to-white">
      <div class="container mx-auto">
        <div class="flex flex-col gap-10">
          <!-- Section Header -->
          <div 
            class="flex justify-between items-end opacity-0 animate-fade-in-up"
            style="animation-delay: 0.1s"
          >
            <div class="flex flex-col gap-2">
              <span class="text-sm font-semibold text-primary-normal/70 uppercase tracking-wider">
                Expert Professionals
              </span>
              <LandingPageTitle
                heading="Top Lawyers in Nepal"
                subheading="Connect with experienced legal professionals"
              />
            </div>
            <NuxtLink 
              to="/client/lawyers" 
              class="group text-primary-normal hover:text-primary-normal-hover font-semibold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary-light/50 transition-all duration-300"
            >
              View All
              <Icon icon="mdi:arrow-right" class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </NuxtLink>
          </div>
          
          <!-- Loading Skeletons -->
          <div v-if="lawyersLoading" class="flex gap-6 overflow-hidden">
            <div 
              v-for="i in 4" 
              :key="i" 
              class="opacity-0 animate-fade-in"
              :style="`animation-delay: ${i * 0.1}s`"
            >
              <LawyerCardSkeleton />
            </div>
          </div>
          
          <!-- Lawyers Carousel -->
          <div 
            v-else-if="lawyers.length > 0" 
            class="opacity-0 animate-fade-in-up"
            style="animation-delay: 0.2s"
          >
            <Carousel :slides-to-show="4" :gap="24">
              <CarouselItem v-for="lawyer in lawyers" :key="lawyer.verification?.id || lawyer.user?.email" basis="340px">
                <LawyerCard :lawyer="lawyer" class="hover:-translate-y-2 transition-transform duration-300" />
              </CarouselItem>
            </Carousel>
          </div>
          
          <div 
            v-else 
            class="text-center py-16 bg-primary-light/20 rounded-2xl border border-primary-light-active/50"
          >
            <Icon icon="mdi:account-tie-outline" class="w-16 h-16 text-primary-light-active mx-auto mb-4" />
            <p class="text-gray-500 text-lg">No lawyers available at the moment.</p>
            <p class="text-gray-400 text-sm mt-1">Check back soon for updates.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Practice Areas Section -->
    <section class="py-20 px-4 bg-white">
      <div class="container mx-auto">
        <div class="text-center mb-16">
          <span class="text-sm font-semibold text-primary-normal/70 uppercase tracking-wider">
            Our Expertise
          </span>
          <h2 class="text-3xl md:text-4xl font-bold text-primary-normal mt-2 mb-4">
            Practice Areas
          </h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Our network of legal professionals covers a wide range of practice areas to meet all your legal needs.
          </p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div 
            v-for="(area, index) in practiceAreas" 
            :key="area.name"
            class="group p-6 rounded-xl bg-gradient-to-br from-primary-light/40 to-primary-light/10 border border-primary-light-active/30 hover:border-primary-normal hover:bg-primary-normal cursor-pointer transition-all duration-300 opacity-0 animate-fade-in"
            :style="`animation-delay: ${index * 0.05}s`"
          >
            <Icon :icon="area.icon" class="w-10 h-10 text-primary-normal group-hover:text-white mb-3 transition-colors duration-300" />
            <h3 class="font-semibold text-primary-normal group-hover:text-white transition-colors duration-300">{{ area.name }}</h3>
          </div>
        </div>
      </div>
    </section>

    <!-- Easy Find Section -->
    <section class="py-24 px-4 relative overflow-hidden bg-gradient-to-br from-primary-light/40 via-white to-primary-light/20">
      <!-- Background decorations -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-normal/5 rounded-full blur-3xl animate-float" />
        <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-normal/5 rounded-full blur-3xl animate-float" style="animation-delay: 1.5s" />
      </div>
      
      <div class="container mx-auto relative z-10">
        <div class="flex flex-col gap-8 justify-center items-center text-center max-w-4xl mx-auto">
          <span 
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary-normal/10 text-primary-normal font-semibold rounded-full text-sm opacity-0 animate-fade-in-down"
            style="animation-delay: 0.1s"
          >
            <Icon icon="mdi:lightning-bolt" class="w-4 h-4" />
            Easy Find
          </span>
          
          <h2 
            class="text-4xl md:text-5xl font-bold leading-tight opacity-0 animate-fade-in-up"
            style="animation-delay: 0.2s"
          >
            <span class="bg-clip-text text-transparent bg-primary-gradient">
              Get instantly paired with the most suitable,
            </span>
            <br />
            <span class="text-primary-normal">
              verified lawyers based on expertise, experience, and success rate.
            </span>
          </h2>
          
          <p 
            class="text-gray-600 text-lg max-w-2xl opacity-0 animate-fade-in-up"
            style="animation-delay: 0.3s"
          >
            Our intelligent matching system analyzes your legal needs and connects you with the perfect legal professional in minutes.
          </p>
          
          <div 
            class="flex flex-wrap gap-4 mt-4 opacity-0 animate-fade-in-up"
            style="animation-delay: 0.4s"
          >
            <NuxtLink 
              to="/client/lawyers" 
              class="px-8 py-3 bg-primary-normal text-white font-semibold rounded-xl hover:bg-primary-normal-hover transition-all duration-300 hover:shadow-lg hover:shadow-primary-normal/20 hover:-translate-y-0.5"
            >
              Find a Lawyer
            </NuxtLink>
            <NuxtLink 
              to="/client/firms" 
              class="px-8 py-3 bg-white text-primary-normal font-semibold rounded-xl border-2 border-primary-normal hover:bg-primary-light transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              Browse Firms
            </NuxtLink>
          </div>
        </div>
      </div>
      
      <NuxtImg 
        src="/Images/bg_1.png" 
        alt="Landing Page Illustration" 
        fill
        class="mx-auto absolute left-0 right-0 top-0 bottom-0 -z-10 opacity-10"
        object-fit="cover"
      />
    </section>

    <!-- Stats Section -->
    <section class="py-16 px-4 bg-primary-normal text-white">
      <div class="container mx-auto">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div 
            v-for="(stat, index) in stats" 
            :key="stat.label"
            class="text-center opacity-0 animate-fade-in-up"
            :style="`animation-delay: ${index * 0.1}s`"
          >
            <Icon :icon="stat.icon" class="w-10 h-10 mx-auto mb-3 text-primary-light" />
            <p class="text-3xl md:text-4xl font-bold mb-1">{{ stat.value }}</p>
            <p class="text-primary-light text-sm">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="py-20 px-4 bg-gradient-to-b from-white to-primary-light/20">
      <div class="container mx-auto">
        <div class="text-center mb-16">
          <span class="text-sm font-semibold text-primary-normal/70 uppercase tracking-wider">
            Testimonials
          </span>
          <h2 class="text-3xl md:text-4xl font-bold text-primary-normal mt-2 mb-4">
            What Our Clients Say
          </h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Read success stories from clients who found the perfect legal representation through our platform.
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="(testimonial, index) in testimonials" 
            :key="testimonial.name"
            class="p-8 rounded-2xl bg-white border border-primary-light-active/30 shadow-lg shadow-primary-normal/5 hover:shadow-xl hover:shadow-primary-normal/10 transition-all duration-300 opacity-0 animate-fade-in-up"
            :style="`animation-delay: ${index * 0.1}s`"
          >
            <!-- Rating -->
            <div class="flex gap-1 mb-4">
              <Icon v-for="star in 5" :key="star" icon="mdi:star" class="w-5 h-5 text-yellow-400" />
            </div>
            
            <!-- Quote -->
            <p class="text-gray-600 leading-relaxed mb-6 italic">
              "{{ testimonial.quote }}"
            </p>
            
            <!-- Author -->
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                <Icon icon="mdi:account" class="w-6 h-6 text-primary-normal" />
              </div>
              <div>
                <p class="font-semibold text-primary-normal">{{ testimonial.name }}</p>
                <p class="text-sm text-gray-500">{{ testimonial.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Registration Process Section -->
    <!-- <section class="py-20 px-4 bg-white">
      <div class="container mx-auto">
        <div 
          class="text-center mb-12 opacity-0 animate-fade-in-up"
          style="animation-delay: 0.1s"
        >
          <span class="text-sm font-semibold text-primary-normal/70 uppercase tracking-wider">
            Get Started
          </span>
          <h2 class="text-3xl md:text-4xl font-bold text-primary-normal mt-2">
            How It Works
          </h2>
          <p class="text-gray-600 mt-3 max-w-xl mx-auto">
            Getting legal help has never been easier. Follow these simple steps to connect with the right professional.
          </p>
        </div>
        <RegistrationProcess :steps="registrationSteps" />
      </div>
    </section> -->

    <!-- FAQ Section -->
    <section class="py-20 px-4 bg-gradient-to-b from-primary-light/20 to-white">
      <div class="container mx-auto max-w-4xl">
        <div class="text-center mb-16">
          <span class="text-sm font-semibold text-primary-normal/70 uppercase tracking-wider">
            FAQ
          </span>
          <h2 class="text-3xl md:text-4xl font-bold text-primary-normal mt-2 mb-4">
            Frequently Asked Questions
          </h2>
          <p class="text-gray-600">
            Find answers to common questions about our platform and services.
          </p>
        </div>
        
        <div class="space-y-4">
          <div 
            v-for="(faq, index) in faqs" 
            :key="index"
            class="opacity-0 animate-fade-in-up"
            :style="`animation-delay: ${index * 0.1}s`"
          >
            <details class="group bg-white rounded-xl border border-primary-light-active/30 overflow-hidden">
              <summary class="flex items-center justify-between p-6 cursor-pointer hover:bg-primary-light/20 transition-colors duration-200">
                <span class="font-semibold text-primary-normal pr-4">{{ faq.question }}</span>
                <Icon 
                  icon="mdi:chevron-down" 
                  class="w-6 h-6 text-primary-normal flex-shrink-0 group-open:rotate-180 transition-transform duration-300" 
                />
              </summary>
              <div class="px-6 pb-6 text-gray-600 leading-relaxed">
                {{ faq.answer }}
              </div>
            </details>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-4 bg-primary-normal relative overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 left-0 w-full h-full" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');" />
      </div>
      
      <div class="container mx-auto relative z-10">
        <div class="text-center max-w-3xl mx-auto">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Find Your Legal Expert?
          </h2>
          <p class="text-primary-light text-lg mb-8">
            Join thousands of clients who have found the perfect legal representation through Trilex. Start your journey today.
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <NuxtLink 
              to="/register" 
              class="px-8 py-4 bg-white text-primary-normal font-semibold rounded-xl hover:bg-primary-light transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              Get Started Free
            </NuxtLink>
            <NuxtLink 
              to="/lawyer-signup" 
              class="px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white hover:bg-white/10 transition-all duration-300"
            >
              Register as Professional
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter Section -->
    <section class="py-16 px-4 bg-white border-t border-primary-light-active/30">
      <div class="container mx-auto">
        <div class="flex flex-col md:flex-row items-center justify-between gap-8 max-w-4xl mx-auto">
          <div class="text-center md:text-left">
            <h3 class="text-2xl font-bold text-primary-normal mb-2">Stay Updated</h3>
            <p class="text-gray-600">Get the latest legal insights and platform updates delivered to your inbox.</p>
          </div>
          <div class="flex w-full md:w-auto gap-3">
            <input 
              type="email" 
              placeholder="Enter your email" 
              class="flex-1 md:w-72 px-4 py-3 rounded-xl border border-primary-light-active focus:border-primary-normal focus:ring-2 focus:ring-primary-normal/20 outline-none transition-all duration-200"
            />
            <button class="px-6 py-3 bg-primary-normal text-white font-semibold rounded-xl hover:bg-primary-normal-hover transition-all duration-300 whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import HeroSection from '~/components/Landing/HeroSection.vue'
import LandingPageTitle from '~/components/Landing/LandingPageTitle.vue'
import LawFirmCard from '~/components/cards/LawFirmCard.vue'
import LawFirmCardSkeleton from '~/components/cards/LawFirmCardSkeleton.vue'
import LawyerCard from '~/components/cards/LawyerCard.vue'
import LawyerCardSkeleton from '~/components/cards/LawyerCardSkeleton.vue'
import RegistrationProcess from '~/components/RegistrationProcess.vue'
import { Carousel, CarouselItem } from '~/components/ui/carousel/'
import { firmsApi, type Firm } from '~/composables/api/firms.api'
import { lawyersApi, type Lawyer } from '~/composables/api/lawyers.api'
import type { Step } from '~/components/RegistrationProcess.vue'

// Firms data
const firms = ref<Firm[]>([])
const firmsLoading = ref(true)

// Lawyers data
const lawyers = ref<Lawyer[]>([])
const lawyersLoading = ref(true)

// Stats data
const stats = [
  { icon: 'mdi:account-group', value: '500+', label: 'Verified Lawyers' },
  { icon: 'mdi:office-building', value: '100+', label: 'Law Firms' },
  { icon: 'mdi:briefcase-check', value: '10K+', label: 'Cases Handled' },
  { icon: 'mdi:star', value: '98%', label: 'Client Satisfaction' },
]

// Features data
const features = [
  {
    icon: 'mdi:shield-check',
    title: 'Verified Professionals',
    description: 'Every lawyer and law firm on our platform undergoes a rigorous verification process to ensure authenticity and credibility.',
  },
  {
    icon: 'mdi:magnify',
    title: 'Smart Matching',
    description: 'Our intelligent algorithm matches you with legal professionals based on your specific needs, location, and case type.',
  },
  {
    icon: 'mdi:clock-fast',
    title: 'Quick Response',
    description: 'Get connected with lawyers within minutes. Our platform ensures fast response times for urgent legal matters.',
  },
  {
    icon: 'mdi:currency-usd-off',
    title: 'Transparent Pricing',
    description: 'No hidden fees. View consultation rates upfront and choose a professional that fits your budget.',
  },
  {
    icon: 'mdi:chat-processing',
    title: 'Secure Communication',
    description: 'Communicate with your lawyer through our encrypted platform. Your conversations remain private and confidential.',
  },
  {
    icon: 'mdi:file-document-check',
    title: 'Document Management',
    description: 'Upload, share, and manage legal documents securely. Keep all your case files organized in one place.',
  },
]

// Practice areas
const practiceAreas = [
  { icon: 'mdi:gavel', name: 'Criminal Law' },
  { icon: 'mdi:home-city', name: 'Real Estate' },
  { icon: 'mdi:account-group', name: 'Family Law' },
  { icon: 'mdi:briefcase', name: 'Corporate Law' },
  { icon: 'mdi:bank', name: 'Banking & Finance' },
  { icon: 'mdi:scale-balance', name: 'Civil Litigation' },
  { icon: 'mdi:file-sign', name: 'Contracts' },
  { icon: 'mdi:shield-account', name: 'Immigration' },
  { icon: 'mdi:domain', name: 'Intellectual Property' },
  { icon: 'mdi:account-hard-hat', name: 'Labor & Employment' },
  { icon: 'mdi:tree', name: 'Environmental Law' },
  { icon: 'mdi:medical-bag', name: 'Medical Malpractice' },
]

// Testimonials
const testimonials = [
  {
    name: 'Rajesh Sharma',
    role: 'Business Owner',
    quote: 'Trilex helped me find the perfect corporate lawyer for my startup. The process was seamless and I was connected with a verified professional within hours.',
  },
  {
    name: 'Sunita Thapa',
    role: 'Property Buyer',
    quote: 'I needed help with a complex property dispute. The lawyer I found through Trilex was knowledgeable, professional, and resolved my case efficiently.',
  },
  {
    name: 'Anil Gurung',
    role: 'HR Manager',
    quote: 'Our company uses Trilex for all our legal needs. The platform makes it easy to find specialized lawyers for different aspects of our business.',
  },
]

// FAQs
const faqs = [
  {
    question: 'How does Trilex verify lawyers and law firms?',
    answer: 'We verify all legal professionals through a comprehensive process that includes license verification with the Nepal Bar Council, document authentication, and background checks. Only verified professionals are listed on our platform.',
  },
  {
    question: 'Is it free to use Trilex?',
    answer: 'Creating an account and browsing lawyers is completely free. You only pay when you book a consultation or hire a lawyer. Each lawyer sets their own consultation fees which are displayed transparently on their profile.',
  },
  {
    question: 'How quickly can I connect with a lawyer?',
    answer: 'Most users are connected with a suitable lawyer within 24 hours. For urgent matters, our platform prioritizes your request and can connect you with available lawyers within minutes.',
  },
  {
    question: 'Can I communicate with lawyers before hiring?',
    answer: 'Yes, our platform allows you to send initial inquiries to lawyers to discuss your case briefly before scheduling a paid consultation. This helps ensure you find the right match.',
  },
  {
    question: 'What types of legal cases does Trilex cover?',
    answer: 'Trilex covers a wide range of legal practice areas including criminal law, civil litigation, family law, corporate law, real estate, immigration, intellectual property, and more. You can filter lawyers by their specialization.',
  },
]

// Fetch firms
const fetchFirms = async () => {
  firmsLoading.value = true
  try {
    const response = await firmsApi.getFirms({ page: 1, page_size: 8 })
    firms.value = response.results || []
  } catch (error) {
    console.error('Error fetching firms:', error)
  } finally {
    firmsLoading.value = false
  }
}

// Fetch lawyers
const fetchLawyers = async () => {
  lawyersLoading.value = true
  try {
    const response = await lawyersApi.getLawyers({ page: 1, page_size: 8 })
    lawyers.value = response.results || []
  } catch (error) {
    console.error('Error fetching lawyers:', error)
  } finally {
    lawyersLoading.value = false
  }
}

onMounted(() => {
  fetchFirms()
  fetchLawyers()
})

const registrationSteps: Step[] = [
  {
    title: 'Create Account',
    description: 'Sign up and create your account',
    image: '/placeholder.svg',
  },
  {
    title: 'Verify Information',
    description: 'Verify your personal information',
    image: '/placeholder.svg',
  },
  {
    title: 'Complete Profile',
    description: 'Complete your profile details',
    image: '/placeholder.svg',
  },
  {
    title: 'Start Using',
    description: 'Start using our platform',
    image: '/placeholder.svg',
  },
]
</script>



