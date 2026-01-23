<template>
  <div>
    <!-- Header with Add Team Member Button -->
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold" style="color: var(--color-primary-normal)">Dashboard</h1>
      <button
        @click="navigateTo('/firm/user-management')"
        class="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium"
        style="background: var(--color-primary-normal)"
      >
        <span>Manage Team</span>
        <Icon name="mdi:account-plus" class="w-5 h-5" />
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <!-- Active Clients -->
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-start justify-between mb-4">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">Active Clients</p>
            <h3 class="text-3xl font-bold" style="color: var(--color-primary-normal)">24</h3>
          </div>
          <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Icon name="mdi:account-group" class="w-6 h-6" style="color: var(--color-primary-normal)" />
          </div>
        </div>
        <p class="text-sm text-green-600 font-medium">+15.3% from last month</p>
      </div>

      <!-- Total Cases -->
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-start justify-between mb-4">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">Total Cases</p>
            <h3 class="text-3xl font-bold" style="color: var(--color-primary-normal)">156</h3>
          </div>
          <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Icon name="mdi:briefcase" class="w-6 h-6" style="color: var(--color-primary-normal)" />
          </div>
        </div>
        <p class="text-sm text-green-600 font-medium">+8.2% from last month</p>
      </div>

      <!-- Team Members -->
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-start justify-between mb-4">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">Team Members</p>
            <h3 class="text-3xl font-bold" style="color: var(--color-primary-normal)">12</h3>
          </div>
          <div class="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
            <Icon name="mdi:account-multiple" class="w-6 h-6" style="color: var(--color-primary-normal)" />
          </div>
        </div>
        <p class="text-sm text-green-600 font-medium">+3 new this month</p>
      </div>

      <!-- Pending Requests -->
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-start justify-between mb-4">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">Pending Requests</p>
            <h3 class="text-3xl font-bold" style="color: var(--color-primary-normal)">5</h3>
          </div>
          <div class="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
            <Icon name="mdi:clock-outline" class="w-6 h-6" style="color: var(--color-primary-normal)" />
          </div>
        </div>
        <p class="text-sm text-red-600 font-medium">2 urgent</p>
      </div>

      <!-- Firm Revenue -->
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-start justify-between mb-4">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">Firm Revenue</p>
            <h3 class="text-3xl font-bold" style="color: var(--color-primary-normal)">$45.2K</h3>
          </div>
          <div class="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
            <Icon name="mdi:cash" class="w-6 h-6" style="color: var(--color-primary-normal)" />
          </div>
        </div>
        <p class="text-sm text-green-600 font-medium">+12.5% from last month</p>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Overview Chart -->
      <div class="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold mb-1" style="color: var(--color-primary-normal)">Firm Overview</h2>
            <p class="text-sm text-gray-600">Total cases handled per month</p>
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
                    height: `${(data.value / 25) * 100}%`,
                    background: 'var(--color-primary-normal)'
                  }"
                ></div>
              </div>
              <span class="text-xs text-gray-600 mt-2">{{ data.month }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Performance -->
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <h2 class="text-xl font-bold mb-1" style="color: var(--color-primary-normal)">Team Performance</h2>
        <p class="text-sm text-gray-600 mb-6">Top performing members this month</p>

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
          <span class="text-sm font-medium text-gray-700">This Week</span>
          <button>
            <Icon name="mdi:chevron-right" class="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { navigateTo } from '#app'

const chartData = ref([
  { month: 'Jan', value: 18 },
  { month: 'Feb', value: 12 },
  { month: 'Mar', value: 22 },
  { month: 'Apr', value: 19 },
  { month: 'May', value: 25 },
  { month: 'Jun', value: 21 },
  { month: 'Jul', value: 24 },
  { month: 'Aug', value: 23 },
  { month: 'Sep', value: 20 },
  { month: 'Oct', value: 26 },
  { month: 'Nov', value: 28 },
  { month: 'Dec', value: 22 }
])
</script>
