<template>
  <div class="relative flex flex-col lg:flex-row justify-between items-center w-full px-10 lg:px-20 py-20 min-h-screen gap-16">
    <!-- Left Content -->
         <div
  class="w-[700px] h-[700px] rounded-full absolute top-0 -right-40  border border-[#B5C2FB]/40
           bg-[#B5C2FB]/10  z-0
         "
         >
        

</div>
   <div
  class="w-[700px] h-[700px] rounded-full absolute -top-40 right-40  border border-[#B5C2FB]/40
           bg-[#B5C2FB]/10  z-10
         "
         >
    </div>
    <div class="flex flex-col gap-10 w-full lg:w-1/2 z-20">
      <h1 class="text-5xl lg:text-6xl  title-gradient">
        Expert Legal Solutions for Your Every Need
      </h1>
      <p class="text-lg text-gray-600 leading-relaxed">
        Navigate complex legal matters with confidence. Our experienced team
        provides comprehensive legal services tailored to protect your rights
        and achieve the best outcomes for your case.
      </p>
      <HeroSearch />
  

    </div>

    <div class="hidden lg:flex w-1/2 h-[600px] items-center justify-center">
      <NuxtImg
        src="/Images/Hero.png"
        alt="Hero Section"
        class="object-contain w-full h-full z-30"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import HeroSearch from './HeroSearch.vue'
</script>
