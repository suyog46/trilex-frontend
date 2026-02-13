<template>
  <div>
    <!-- Header with Create Case Button -->
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold" style="color: var(--color-primary-normal)">Dashboard</h1>
      <button
        @click="navigateTo('/cases/create')"
        class="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium"
        style="background: var(--color-primary-normal)"
      >
        <span>Create Case</span>
        <Icon name="mdi:plus-circle-outline" class="w-5 h-5" />
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-start justify-between mb-4">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">Total Cases</p>
            <h3 class="text-3xl font-bold" style="color: var(--color-primary-normal)">{{ totals.totalCases }}</h3>
          </div>
          <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Icon name="mdi:briefcase" class="w-6 h-6" style="color: var(--color-primary-normal)" />
          </div>
        </div>
        <p class="text-sm text-gray-500 font-medium">All cases assigned</p>
      </div>

      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-start justify-between mb-4">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">Ongoing Cases</p>
            <h3 class="text-3xl font-bold" style="color: var(--color-primary-normal)">{{ totals.ongoingCases }}</h3>
          </div>
          <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Icon name="mdi:trending-up" class="w-6 h-6" style="color: var(--color-primary-normal)" />
          </div>
        </div>
        <p class="text-sm text-gray-500 font-medium">Active court proceedings</p>
      </div>

      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-start justify-between mb-4">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">Pending Bookings</p>
            <h3 class="text-3xl font-bold" style="color: var(--color-primary-normal)">{{ totals.pendingBookings }}</h3>
          </div>
          <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Icon name="mdi:account-multiple-plus" class="w-6 h-6" style="color: var(--color-primary-normal)" />
          </div>
        </div>
        <p class="text-sm text-gray-500 font-medium">Awaiting confirmation</p>
      </div>

      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-start justify-between mb-4">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">Cases This Month</p>
            <h3 class="text-3xl font-bold" style="color: var(--color-primary-normal)">{{ totals.currentMonthCases }}</h3>
          </div>
          <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Icon name="mdi:calendar-check" class="w-6 h-6" style="color: var(--color-primary-normal)" />
          </div>
        </div>
        <p class="text-sm text-gray-500 font-medium">New case activity</p>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Overview Chart -->
      <div class="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold mb-1" style="color: var(--color-primary-normal)">Overview</h2>
            <p class="text-sm text-gray-600">Showing number of case per month</p>
          </div>
        </div>

        <!-- Bar Chart -->
        <div class="h-80">
          <div class="h-full flex items-end justify-between gap-2">
            <div
              v-for="(data, index) in chartData"
              :key="index"
              class="flex-1 flex flex-col items-center"
            >
              <div class="w-full flex items-end justify-center h-64">
                <div
                  class="w-full rounded-t-lg transition-all"
                  :style="{
                    height: `${(data.value / chartMax) * 100}%`,
                    background: 'var(--color-primary-normal)'
                  }"
                ></div>
              </div>
              <span class="text-xs text-gray-600 mt-2">{{ data.month }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Visits -->
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <h2 class="text-xl font-bold mb-1" style="color: var(--color-primary-normal)">Profile Visits</h2>
        <p class="text-sm text-gray-600 mb-6">Frequency of your profile viewed</p>

        <!-- Wave Chart -->
        <div class="h-48 mb-6 relative">
          <svg viewBox="0 0 300 120" class="w-full h-full">
            <path
              d="M 0 60 Q 25 40, 50 50 T 100 60 T 150 50 T 200 60 T 250 50 T 300 60"
              fill="none"
              stroke="#A0C4FF"
              stroke-width="2"
            />
            <path
              d="M 0 60 Q 25 40, 50 50 T 100 60 T 150 50 T 200 60 T 250 50 T 300 60 L 300 120 L 0 120 Z"
              fill="url(#gradient)"
              opacity="0.3"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#A0C4FF;stop-opacity:0.5" />
                <stop offset="100%" style="stop-color:#A0C4FF;stop-opacity:0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <!-- Days of Week -->
        <div class="flex justify-between text-xs text-gray-600 mb-6">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        <!-- Date Range -->
        <div class="flex items-center justify-between">
          <button>
            <Icon name="mdi:chevron-left" class="w-5 h-5 text-gray-600" />
          </button>
          <span class="text-sm font-medium text-gray-700">13 - 19 October</span>
          <button>
            <Icon name="mdi:chevron-right" class="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { navigateTo } from '#app'
import { useApiFetch } from '~/composables/useApiFetch'
import { useAuthStore } from '~/stores/auth'

type CasesPerMonthItem = {
  month: string
  year: number
  count: number
}

type LawyerDashboardResponse = {
  total_cases: number
  total_ongoing_cases: number
  total_pending_bookings: number
  cases_per_month: CasesPerMonthItem[]
}

const authStore = useAuthStore()
const apiFetch = useApiFetch()
const dashboardData = ref<LawyerDashboardResponse | null>(null)

const chartData = computed(() => {
  return (dashboardData.value?.cases_per_month || []).map(item => ({
    month: item.month,
    value: item.count,
  }))
})

const chartMax = computed(() => {
  const values = chartData.value.map(item => item.value)
  return Math.max(1, ...values)
})

const totals = computed(() => {
  const casesPerMonth = dashboardData.value?.cases_per_month || []
  const lastMonth = casesPerMonth[casesPerMonth.length - 1]

  return {
    totalCases: dashboardData.value?.total_cases ?? 0,
    ongoingCases: dashboardData.value?.total_ongoing_cases ?? 0,
    pendingBookings: dashboardData.value?.total_pending_bookings ?? 0,
    currentMonthCases: lastMonth?.count ?? 0,
  }
})

const fetchDashboard = async () => {
  if (authStore.user?.role !== 'lawyer') return
  dashboardData.value = await apiFetch('/api/lawyers/dashboard/')
}

onMounted(() => {
  fetchDashboard()
})
</script>
