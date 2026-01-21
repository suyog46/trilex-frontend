
<script setup lang="ts">
import { ref, computed } from "vue";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { lawyerRegisterSchema, type LawyerRegisterInput } from "~/lib/validations/auth";
import { useForm } from "vee-validate"
import StepTabs from '~/components/ui/tabs/StepTabs.vue';
import { TabsContent } from '~/components/ui/tabs';

const activeStep = ref("step1");
const citizenshipPhotos = ref<{
  front: { file: File | null; preview: string | null };
  back: { file: File | null; preview: string | null };
}>({
  front: { file: null, preview: null },
  back: { file: null, preview: null },
});

const { handleSubmit, values } = useForm({
  validationSchema: lawyerRegisterSchema,
  initialValues: {
    fullName: "",
    phoneNumber: "",
    gender: "",
    documentType: "",
    citizenshipNumber: "",
  },
});

// Use the auth queries composable
const { loginMutation } = useAuthQueries();

// Handle register form submission
const onSubmit = handleSubmit((values: any) => {
  const formData = new FormData();
  formData.append("fullName", values.fullName);
  formData.append("phoneNumber", values.phoneNumber);
  formData.append("gender", values.gender);
  formData.append("documentType", values.documentType);
  formData.append("citizenshipNumber", values.citizenshipNumber);
  
  if (citizenshipPhotos.value.front.file) {
    formData.append("citizenshipPhotoFront", citizenshipPhotos.value.front.file);
  }
  if (citizenshipPhotos.value.back.file) {
    formData.append("citizenshipPhotoBack", citizenshipPhotos.value.back.file);
  }

  console.log("Form submitted with values:", values);
  console.log("FormData prepared for backend:", formData);
  // loginMutation.mutate(values as LawyerRegisterInput);
});

// Handle file upload
const handlePhotoUpload = (event: Event, side: "front" | "back") => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      citizenshipPhotos.value[side].preview = e.target?.result as string;
      citizenshipPhotos.value[side].file = file;
    };
    reader.readAsDataURL(file);
  }
};

// Delete photo
const deletePhoto = (side: "front" | "back") => {
  citizenshipPhotos.value[side].preview = null;
  citizenshipPhotos.value[side].file = null;
};

// Handle Google Sign-In
const handleGoogleSignIn = async () => {
  try {
    // Replace with your actual Google OAuth implementation
    console.log("Google sign-in initiated");
    // Implementation depends on your auth setup
  } catch (error) {
    console.error("Google sign-in error:", error);
  }
};

// Navigate to next step
const goToNextStep = () => {
  activeStep.value = "step2";
};

// Navigate to previous step
const goToPreviousStep = () => {
  activeStep.value = "step1";
};

// Computed property for loading state
const isLoading = computed(() => loginMutation.isPending.value);

const steps = [
  { key: "step1", label: "General Information" },
  { key: "step2", label: "Official Documents" },
];

const documentTypeOptions = [
  { value: "passport", label: "Passport" },
  { value: "nationalId", label: "National ID" },
  { value: "drivingLicense", label: "Driving License" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];
</script>

<template>
  <div class="w-2/5 flex flex-col gap-y-8 justify-start  ">
    <h1 class="text-primary-normal font-bold text-center mobile:text-left text-[30px] mobile:text-[35px] lg:text-[38px] mb-3">
      Welcome Back!
    </h1>

    <Form :submit="onSubmit"  class="space-y-4">

      <StepTabs
        v-model="activeStep"
        :steps="steps"
        width="full"
      >
          <TabsContent value="step1" class="space-y-5" force-mount  v-show="activeStep === 'step1'">
          <FormField v-slot="{ componentField }" name="fullName">
            <FormItem>
              <FormLabel class="text-lg text-gray-700 font-semibold">
                Full Name <span class="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div class="relative">
                  <Input
                    v-bind="componentField"
                    type="text"
                    placeholder="Enter your Full Name"
                    :disabled="isLoading"
                    class="w-full p-2 ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal pr-12"
                  />
                  <button
                    type="button"
                    class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600"
                  >
                    <Icon 
                      icon="mdi:user"
                      class="w-5 h-5" 
                    />
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Phone Number Field -->
          <FormField v-slot="{ componentField }" name="phoneNumber">
            <FormItem>
              <FormLabel class="text-lg text-gray-700 font-semibold">
                Phone Number <span class="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div class="relative">
                  <Input
                    v-bind="componentField"
                    type="text"
                    placeholder="Enter your phone number"
                    :disabled="isLoading"
                    class="w-full p-2 ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal pr-12"
                  />
                  <button
                    type="button"
                    class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600"
                  >
                    <Icon 
                      icon="material-symbols:call-outline" 
                      class="w-5 h-5" 
                    />
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Gender Radio Field -->
          <FormField v-slot="{ componentField }" name="gender">
            <FormItem>
              <FormLabel class="text-lg text-gray-700 font-semibold">
                Gender <span class="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div class="flex gap-6">
                  <div v-for="option in genderOptions" :key="option.value" class="flex items-center gap-2">
                    <input
                      type="radio"
                      :id="`gender-${option.value}`"
                      :value="option.value"
                      v-bind="componentField"
                      class="w-4 h-4 cursor-pointer accent-primary-normal"
                    />
                    <label 
                      :for="`gender-${option.value}`"
                      class="text-base text-gray-600 cursor-pointer"
                    >
                      {{ option.label }}
                    </label>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Next Button for Step 1 -->
          <div class="w-full pt-5 flex gap-4">
            <Button
              type="button"
              @click="goToNextStep"
              class="w-full px-4 py-6 font-semibold text-white text-lg bg-primary-normal hover:bg-primary-normal/90 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Next Step
            </Button>
          </div>
        </TabsContent>

          <TabsContent value="step2" class="space-y-5" v-show="activeStep === 'step2'" force-mount>
          <!-- Document Type Dropdown -->
          <FormField v-slot="{ componentField }" name="documentType">
            <FormItem>
              <FormLabel class="text-lg text-gray-700 font-semibold">
                Document Type <span class="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <select
                  v-bind="componentField"
                  :disabled="isLoading"
                  class="w-full p-2 ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal bg-white"
                >
                  <option value="">Select a document type</option>
                  <option v-for="option in documentTypeOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Citizenship Number Field -->
          <FormField v-slot="{ componentField }" name="citizenshipNumber">
            <FormItem>
              <FormLabel class="text-lg text-gray-700 font-semibold">
                Citizenship Number <span class="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div class="relative">
                  <Input
                    v-bind="componentField"
                    type="text"
                    placeholder="Enter your citizenship number"
                    :disabled="isLoading"
                    class="w-full p-2 ring-1 ring-gray-200 hover:ring-1 hover:ring-primary-normal rounded-md focus:outline-none focus:ring-1 focus:ring-primary-normal pr-12"
                  />
                  <button
                    type="button"
                    class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600"
                  >
                    <Icon 
                      icon="mdi:card-account-details" 
                      class="w-5 h-5" 
                    />
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Citizenship Photo Upload (Front) -->
          <FormField name="citizenshipPhotoFront">
            <FormItem>
              <FormLabel class="text-lg text-gray-700 font-semibold">
                Citizenship Photo (Front) <span class="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div class="space-y-3">
                  <!-- Photo Preview -->
                  <div v-if="citizenshipPhotos.front.preview" class="relative w-full bg-gray-50 rounded-md overflow-hidden">
                    <img 
                      :src="citizenshipPhotos.front.preview" 
                      alt="Front citizenship photo"
                      class="w-full h-40 object-cover rounded-md"
                    />
                    <!-- Delete and Replace Options on Hover -->
                    <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-md">
                      <button
                        type="button"
                        @click="deletePhoto('front')"
                        class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md flex items-center gap-2"
                      >
                        <Icon icon="mdi:delete" class="w-4 h-4" />
                        Delete
                      </button>
                      <label
                        class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md flex items-center gap-2 cursor-pointer"
                      >
                        <Icon icon="mdi:pencil" class="w-4 h-4" />
                        Replace
                        <input
                          type="file"
                          accept="image/*"
                          @change="(e) => handlePhotoUpload(e, 'front')"
                          class="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <!-- Upload Area -->
                  <label v-else class="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-md p-8 cursor-pointer hover:border-primary-normal transition">
                    <Icon icon="mdi:cloud-upload-outline" class="w-8 h-8 text-gray-400 mb-2" />
                    <span class="text-gray-600 font-medium">Click to upload front photo</span>
                    <span class="text-gray-400 text-sm">or drag and drop</span>
                    <input
                      type="file"
                      accept="image/*"
                      @change="(e) => handlePhotoUpload(e, 'front')"
                      class="hidden"
                    />
                  </label>
                </div>
              </FormControl>
            </FormItem>
          </FormField>

          <!-- Citizenship Photo Upload (Back) -->
          <FormField name="citizenshipPhotoBack">
            <FormItem>
              <FormLabel class="text-lg text-gray-700 font-semibold">
                Citizenship Photo (Back) <span class="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div class="space-y-3">
                  <!-- Photo Preview -->
                  <div v-if="citizenshipPhotos.back.preview" class="relative w-full bg-gray-50 rounded-md overflow-hidden">
                    <img 
                      :src="citizenshipPhotos.back.preview" 
                      alt="Back citizenship photo"
                      class="w-full h-40 object-cover rounded-md"
                    />
                    <!-- Delete and Replace Options on Hover -->
                    <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-md">
                      <button
                        type="button"
                        @click="deletePhoto('back')"
                        class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md flex items-center gap-2"
                      >
                        <Icon icon="mdi:delete" class="w-4 h-4" />
                        Delete
                      </button>
                      <label
                        class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md flex items-center gap-2 cursor-pointer"
                      >
                        <Icon icon="mdi:pencil" class="w-4 h-4" />
                        Replace
                        <input
                          type="file"
                          accept="image/*"
                          @change="(e) => handlePhotoUpload(e, 'back')"
                          class="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <!-- Upload Area -->
                  <label v-else class="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-md p-8 cursor-pointer hover:border-primary-normal transition">
                    <Icon icon="mdi:cloud-upload-outline" class="w-8 h-8 text-gray-400 mb-2" />
                    <span class="text-gray-600 font-medium">Click to upload back photo</span>
                    <span class="text-gray-400 text-sm">or drag and drop</span>
                    <input
                      type="file"
                      accept="image/*"
                      @change="(e) => handlePhotoUpload(e, 'back')"
                      class="hidden"
                    />
                  </label>
                </div>
              </FormControl>
            </FormItem>
          </FormField>

          <!-- Navigation Buttons for Step 2 -->
          <div class="w-full pt-5 flex gap-4">
            <Button
              type="button"
              @click="goToPreviousStep"
              class="w-1/3 px-4 py-6 font-semibold text-gray-700 text-lg bg-gray-200 hover:bg-gray-300 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Previous
            </Button>
            <Button
              type="submit"
              :disabled="isLoading"
              class="w-2/3 px-4 py-6 font-semibold text-white text-lg bg-primary-normal hover:bg-primary-normal/90 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon v-if="isLoading" name="mdi:loading" class="w-5 h-5 animate-spin" />
              {{ isLoading ? "Loading..." : "Register Now" }}
            </Button>
          </div>
          </TabsContent>

      </StepTabs>

      <!-- Submit Button -->
      <div v-if="false" class="w-full pt-3">
        <Button
          type="submit"
          :disabled="isLoading"
          class="w-full px-4 py-6 font-semibold text-white text-lg bg-primary-normal hover:bg-primary-normal/90 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Icon v-if="isLoading" name="mdi:loading" class="w-5 h-5 animate-spin" />
          {{ isLoading ? "Loading..." : "Login Now" }}
        </Button>
      </div>
    </Form>

    <!-- Register Link -->
    <p class="text-slate-600 w-full text-center">
      Don't have an account?
      <span
        @click="navigateTo('/register')"
        class="text-primary-normal font-semibold cursor-pointer underline"
      >
        Register Now
      </span>
    </p>

    <!-- Divider -->
    <div class="w-full relative flex justify-center items-center">
      <div class="w-[80px] h-1 border-b-2 border-primary-normal" />
      <span class="px-2 absolute text-lg text-primary-normal font-semibold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2] bg-white">
        OR
      </span>
    </div>

    <!-- Google Sign-In Button -->
    <Button
      @click="handleGoogleSignIn"
      type="button"
      class="w-full px-4 py-2 flex items-center justify-center gap-x-2 bg-[#f2f2f2] hover:bg-[#e8e8e8] border-2 border-gray-200 rounded-md font-semibold"
    >
      <Icon name="mdi:google" class="w-6 h-6" />
      <span>Continue with Google</span>
    </Button>
  </div>
</template>
