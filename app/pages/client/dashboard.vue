<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'client',
  middleware: ['auth'],
})

const authStore = useAuthStore()

const isVerified = computed(() => {
  return authStore.clientVerificationStatus?.status === 'VERIFIED'
})

const verificationStatus = computed(() => {
  return authStore.clientVerificationStatus?.status
})

// Quick stats
const quickStats = [
  {
    label: 'Active Bookings',
    value: '2',
    icon: 'mdi:calendar-check',
    color: 'blue',
  },
  {
    label: 'Messages',
    value: '5',
    icon: 'mdi:message',
    color: 'green',
  },
  {
    label: 'Pending Cases',
    value: '1',
    icon: 'mdi:briefcase',
    color: 'orange',
  },
  {
    label: 'Payments Due',
    value: 'Rs. 5,000',
    icon: 'mdi:credit-card',
    color: 'red',
  },
]

// Recent activity
const recentActivity = [
  {
    type: 'booking',
    title: 'New booking confirmed',
    description: 'Lawyer: Adv. Ram Kumar',
    time: '2 hours ago',
    icon: 'mdi:calendar-check',
  },
  {
    type: 'message',
    title: 'Message from Adv. Sita',
    description: 'Case update regarding your property dispute',
    time: '4 hours ago',
    icon: 'mdi:message',
  },
  {
    type: 'payment',
    title: 'Payment received',
    description: 'Invoice #2024-001 has been paid',
    time: '1 day ago',
    icon: 'mdi:check-circle',
  },
]
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="bg-gradient-to-r from-primary-normal to-primary-normal-hover rounded-lg p-6 text-white">
      <h1 class="text-3xl font-bold mb-2">Welcome back, {{ authStore.user?.fullName || 'User' }}!</h1>
      <p class="text-primary-light">
        {{ isVerified 
          ? 'Your profile is verified. You have full access to all features.' 
          : verificationStatus === 'PENDING'
            ? 'Your profile verification is under review.'
            : 'Complete your profile verification to unlock all features.' }}
      </p>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="stat in quickStats"
        :key="stat.label"
        class="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow"
      >
        <div class="flex items-center justify-between mb-2">
          <p class="text-gray-600 text-sm font-medium">{{ stat.label }}</p>
          <Icon
            :icon="stat.icon"
            :class="[
              'w-5 h-5',
              stat.color === 'blue' && 'text-blue-500',
              stat.color === 'green' && 'text-green-500',
              stat.color === 'orange' && 'text-orange-500',
              stat.color === 'red' && 'text-red-500',
            ]"
          />
        </div>
        <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Two Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content: Recent Activity -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>

          <!-- Activity List -->
          <div class="divide-y divide-gray-200">
            <div
              v-if="recentActivity.length > 0"
              v-for="activity in recentActivity"
              :key="activity.title"
              class="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div class="flex items-start gap-4">
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  :class="[
                    activity.type === 'booking' && 'bg-blue-100',
                    activity.type === 'message' && 'bg-green-100',
                    activity.type === 'payment' && 'bg-green-100',
                  ]"
                >
                  <Icon
                    :icon="activity.icon"
                    :class="[
                      'w-5 h-5',
                      activity.type === 'booking' && 'text-blue-600',
                      activity.type === 'message' && 'text-green-600',
                      activity.type === 'payment' && 'text-green-600',
                    ]"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900">{{ activity.title }}</p>
                  <p class="text-sm text-gray-600 mt-1">{{ activity.description }}</p>
                </div>
                <p class="text-xs text-gray-500 flex-shrink-0">{{ activity.time }}</p>
              </div>
            </div>

            <div v-else class="px-6 py-12 text-center">
              <Icon icon="mdi:inbox-outline" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p class="text-gray-500">No recent activity</p>
            </div>
          </div>

          <!-- View All Button -->
          <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <NuxtLink
              to="/client/bookings"
              class="text-primary-normal hover:text-primary-normal-hover text-sm font-medium transition-colors"
            >
              View All Activity →
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Sidebar: Quick Actions + Alerts -->
      <div class="space-y-6">
        <!-- Quick Actions Card -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div class="space-y-2">
            <NuxtLink
              to="/client/bookings"
              class="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-light hover:bg-primary-light-hover text-primary-normal transition-colors"
            >
              <Icon icon="mdi:plus" class="w-5 h-5" />
              <span class="text-sm font-medium">New Booking</span>
            </NuxtLink>
            <NuxtLink
              to="/client/messages"
              class="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              <Icon icon="mdi:message" class="w-5 h-5" />
              <span class="text-sm font-medium">Send Message</span>
            </NuxtLink>
            <NuxtLink
              to="/client/profile"
              class="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              <Icon icon="mdi:account-edit" class="w-5 h-5" />
              <span class="text-sm font-medium">Edit Profile</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Verification Status Card -->
        <div
          :class="[
            'rounded-lg border p-6',
            isVerified
              ? 'bg-green-50 border-green-200'
              : verificationStatus === 'PENDING'
                ? 'bg-blue-50 border-blue-200'
                : 'bg-yellow-50 border-yellow-200'
          ]"
        >
          <div class="flex items-start gap-3 mb-4">
            <Icon
              :icon="isVerified ? 'mdi:check-circle' : verificationStatus === 'PENDING' ? 'mdi:clock-outline' : 'mdi:alert-circle'"
              :class="[
                'w-6 h-6 flex-shrink-0',
                isVerified && 'text-green-600',
                verificationStatus === 'PENDING' && 'text-blue-600',
                !isVerified && verificationStatus !== 'PENDING' && 'text-yellow-600',
              ]"
            />
            <div>
              <h4
                :class="[
                  'font-semibold mb-1',
                  isVerified && 'text-green-900',
                  verificationStatus === 'PENDING' && 'text-blue-900',
                  !isVerified && verificationStatus !== 'PENDING' && 'text-yellow-900',
                ]"
              >
                {{ isVerified ? 'Profile Verified' : verificationStatus === 'PENDING' ? 'Verification Pending' : 'Verification Required' }}
              </h4>
              <p
                :class="[
                  'text-sm',
                  isVerified && 'text-green-700',
                  verificationStatus === 'PENDING' && 'text-blue-700',
                  !isVerified && verificationStatus !== 'PENDING' && 'text-yellow-700',
                ]"
              >
                {{ isVerified 
                  ? 'Your profile has been verified successfully.'
                  : verificationStatus === 'PENDING'
                    ? 'Your verification is under review. Check back soon.'
                    : 'Complete verification to book lawyers and access all features.' }}
              </p>
            </div>
          </div>
          <NuxtLink
            v-if="!isVerified"
            to="/client/verification-status"
            :class="[
              'block text-center px-4 py-2 rounded-lg font-medium transition-colors text-sm',
              verificationStatus === 'PENDING'
                ? 'bg-blue-200 hover:bg-blue-300 text-blue-900'
                : 'bg-yellow-200 hover:bg-yellow-300 text-yellow-900'
            ]"
          >
            {{ verificationStatus === 'PENDING' ? 'View Status' : 'Verify Now' }}
          </NuxtLink>
        </div>

        <!-- Help Card -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h4 class="font-semibold text-gray-900 mb-3">Need Help?</h4>
          <p class="text-sm text-gray-600 mb-4">
            Have questions about booking a lawyer or using our platform?
          </p>
          <NuxtLink
            to="/client/help"
            class="text-primary-normal hover:text-primary-normal-hover text-sm font-medium transition-colors"
          >
            Visit Help Center →
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
