<template>
  <div class="flex flex-col py-10 px-4 container mx-auto">
    <!-- Hero Section -->
    <HeroSection />

    <!-- Best Law Firms Section -->
    <div class="flex flex-col gap-8 my-16">
      <LandingPageTitle
        heading="Best Law Firms in Nepal"
        subheading="Find the top legal experts for your needs"
      />
      <div class="flex flex-wrap gap-8">
        <LawFirmCard 
        />
      </div>
    </div>

    <!-- Law Firms in Your Area Section -->
    <div class="flex flex-col gap-8 my-16">
      <LandingPageTitle
        heading="Find Best Law Firms in Your Area"
        subheading="We provide best lawyer in the town for you"
      />
      <div class="flex flex-wrap gap-8">
        <LawFirmCard
        />
        <!-- v-for="i in 3"
         :key="`area-${i}`"  -->
      </div>
    </div>

      <div class="flex flex-col gap-8 my-16 relative justify-center items-center">
      <p class="text-primary-normal">
        Easy Find
      </p>
        <h1
      class="text-primary-gradient"
      >
      Get instantly paired with the most suitable,
       verified lawyers based on expertise, experience, and success rate.
    </h1>
        <NuxtImg 
      src="/Images/bg_1.png" 
      alt="Landing Page Illustration" 
      fill
      class="mx-auto absolute left-0 right-0"
      object-fit="cover"
     />
        
    </div>
    <!-- Registration Process Section -->
    <RegistrationProcess :steps="registrationSteps" />
    
  </div>
</template>

<script setup lang="ts">
import HeroSection from '~/components/Landing/HeroSection.vue'
import LandingPageTitle from '~/components/Landing/LandingPageTitle.vue'
import LawFirmCard from '~/components/cards/LawFirmCard.vue'
import RegistrationProcess from '~/components/RegistrationProcess.vue'
import type { Step } from '~/components/RegistrationProcess.vue'
    


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



