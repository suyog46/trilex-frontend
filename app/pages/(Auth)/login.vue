

<script setup lang="ts">
import LoginForm from "~/components/auth/LoginForm.vue";
</script>
<template>
  <div class="flex gap-20 justify-center py-20 px-20 items-center bg-white min-h-screen  
   ">

    <LoginForm />

    <div class=" h-[60vh] flex justify-end items-center  ">
      <NuxtImg
        src="/Images/landingImage.jpg"
        alt="Login Illustration"
        class="object-contain h-full w-full"
      />
    </div>
  </div>
</template>