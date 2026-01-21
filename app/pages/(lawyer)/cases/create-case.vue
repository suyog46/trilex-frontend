<script setup lang="ts">
    import StepTabs from '~/components/ui/tabs/StepTabs.vue';
    import { TabsContent } from '~/components/ui/tabs';
definePageMeta({
  layout: "lawyer",
})
const activeStep = ref("general")

const steps = [
  { key: "general", label: "General Information" },
  { key: "client", label: "Client Details" },
  { key: "documents", label: "Documents" },
  { key: "woris", label: "Woris Details" },
  { key: "progress", label: "Progress" },
]
</script>

<template>
  <StepTabs
    v-model="activeStep"
    :steps="steps"
    width="full"
  >
    <TabsContent value="general">
      General content
    </TabsContent>

    <TabsContent value="client">    
      Client details content
    </TabsContent>

    <TabsContent value="documents">
      Documents content
    </TabsContent>

    <TabsContent value="woris">
      Woris details content
    </TabsContent>

    <TabsContent value="progress">
      Progress content
    </TabsContent>
  </StepTabs>
</template>