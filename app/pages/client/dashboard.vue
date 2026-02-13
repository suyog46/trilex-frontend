<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useApiFetch } from '~/composables/useApiFetch'
import { notificationsApi } from '~/composables/api/notifications.api'

definePageMeta({
  layout: 'client',
  middleware: 'client',
})

const authStore = useAuthStore()
const apiFetch = useApiFetch()

// Dashboard data
const dashboardData = ref({
  accepted_bookings: 0,
  active_cases: 0,
  verification_status: 'UNVERIFIED',
})

const recentActivityData = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await apiFetch<any>('/api/clients/dashboard/', {
      method: 'GET',
    })
    dashboardData.value = response as any
  } catch (err: any) {
    console.error('Failed to fetch dashboard data:', err)
    error.value = err.message || 'Failed to load dashboard'
  }
}

// Fetch notifications/recent activity
const fetchRecentActivity = async () => {
  try {
    const response = await notificationsApi.getNotifications({
      page_size: 3,
    })
    recentActivityData.value = response.results.map((notification: any) => ({
      type: notification.type.includes('booking') ? 'booking' : notification.type.includes('firm') ? 'message' : 'payment',
      title: notification.title,
      description: notification.message,
      time: new Date(notification.created_at).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      icon: notification.type.includes('booking') ? 'mdi:calendar-check' : notification.type.includes('firm') ? 'mdi:message' : 'mdi:check-circle',
    }))
  } catch (err: any) {
    console.error('Failed to fetch notifications:', err)
    // Don't show error for notifications, just keep default data
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchDashboardData(), fetchRecentActivity()])
})

const isVerified = computed(() => {
  return authStore.clientVerificationStatus?.status === 'VERIFIED'
})

const verificationStatus = computed(() => {
  return authStore.clientVerificationStatus?.status || 'UNVERIFIED'
})

// Quick stats - now using computed properties from API data
const quickStats = computed(() => [
  {
    label: 'Accepted Bookings',
    value: dashboardData.value.accepted_bookings.toString(),
    icon: 'mdi:calendar-check',
    color: 'blue',
  },
  {
    label: 'Active Cases',
    value: dashboardData.value.active_cases.toString(),
    icon: 'mdi:briefcase',
    color: 'green',
  },
  {
    label: 'Verification',
    value: verificationStatus.value === 'VERIFIED' ? 'Verified' : verificationStatus.value === 'PENDING' ? 'Pending' : 'Required',
    icon: verificationStatus.value === 'VERIFIED' ? 'mdi:check-circle' : verificationStatus.value === 'PENDING' ? 'mdi:clock-outline' : 'mdi:alert-circle',
    color: verificationStatus.value === 'VERIFIED' ? 'green' : verificationStatus.value === 'PENDING' ? 'yellow' : 'red',
  },
  {
    label: 'Visiting Lawyers',
    value: '12',
    icon: 'mdi:account-multiple',
    color: 'purple',
  },
])

// Default recent activity fallback
const defaultRecentActivity = [
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

// Use fetched data or fallback to defaults
const recentActivity = computed(() => {
  return recentActivityData.value.length > 0 ? recentActivityData.value : defaultRecentActivity
})
</script>

<template>
  <div class="space-y-6">
    <!-- Error Alert -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
      <Icon icon="mdi:alert-circle" class="w-5 h-5 text-red-600 flex-shrink-0" />
      <p class="text-red-800 text-sm">{{ error }}</p>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="space-y-4">
      <div class="bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg p-6 h-24 animate-pulse" />
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="bg-slate-200 rounded-lg p-6 h-32 animate-pulse" />
      </div>
    </div>

    <!-- Welcome Header -->
    <div v-if="!loading" class="bg-gradient-to-r from-primary-normal to-primary-normal-hover rounded-lg p-6 text-white">
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
    <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              stat.color === 'yellow' && 'text-yellow-500',
              stat.color === 'purple' && 'text-purple-500',
            ]"
          />
        </div>
        <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Two Column Layout -->
    <div v-if="!loading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content: Recent Activity -->
      <!-- <div class="lg:col-span-2">
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>

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

          <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <NuxtLink
              to="/client/bookings"
              class="text-primary-normal hover:text-primary-normal-hover text-sm font-medium transition-colors"
            >
              View All Activity →
            </NuxtLink>
          </div>
        </div>
      </div> -->

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
