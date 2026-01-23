<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

// Dummy stats data
const stats = [
  { 
    title: 'Total Users', 
    value: '2,847', 
    change: '+12.5%', 
    isPositive: true,
    icon: 'mdi:account-group-outline',
    color: 'bg-blue-500'
  },
  { 
    title: 'Active Lawyers', 
    value: '423', 
    change: '+8.2%', 
    isPositive: true,
    icon: 'mdi:briefcase-account-outline',
    color: 'bg-green-500'
  },
  { 
    title: 'Law Firms', 
    value: '89', 
    change: '+3.1%', 
    isPositive: true,
    icon: 'mdi:office-building-outline',
    color: 'bg-purple-500'
  },
  { 
    title: 'Pending Verifications', 
    value: '34', 
    change: '-5.4%', 
    isPositive: false,
    icon: 'mdi:clock-outline',
    color: 'bg-yellow-500'
  },
]

// Dummy recent activity
const recentActivity = [
  { id: 1, type: 'verification', message: 'New lawyer verification request from John Doe', time: '5 mins ago', icon: 'mdi:account-check' },
  { id: 2, type: 'registration', message: 'New law firm registered: Smith & Associates', time: '15 mins ago', icon: 'mdi:office-building' },
  { id: 3, type: 'case', message: 'New case category added: Intellectual Property', time: '1 hour ago', icon: 'mdi:folder-plus' },
  { id: 4, type: 'verification', message: 'Client verification approved for Jane Smith', time: '2 hours ago', icon: 'mdi:check-circle' },
  { id: 5, type: 'registration', message: 'New client registered: Mike Johnson', time: '3 hours ago', icon: 'mdi:account-plus' },
]

// Dummy pending verifications
const pendingVerifications = [
  { id: 1, name: 'Robert Williams', type: 'Lawyer', submitted: '2 days ago', status: 'pending' },
  { id: 2, name: 'Legal Eagles LLP', type: 'Law Firm', submitted: '3 days ago', status: 'pending' },
  { id: 3, name: 'Sarah Connor', type: 'Client', submitted: '1 day ago', status: 'pending' },
  { id: 4, name: 'David Miller', type: 'Lawyer', submitted: '4 days ago', status: 'pending' },
]
</script>

<template>
  <div class="space-y-8">
    <!-- Page Header -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="stat in stats"
        :key="stat.title"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 font-medium">{{ stat.title }}</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ stat.value }}</p>
            <p 
              class="text-sm mt-2 font-medium"
              :class="stat.isPositive ? 'text-green-600' : 'text-red-600'"
            >
              {{ stat.change }} from last month
            </p>
          </div>
          <div :class="[stat.color, 'p-4 rounded-xl']">
            <Icon :icon="stat.icon" class="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Activity -->
      <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <button class="text-sm text-primary-normal hover:text-primary-normal-hover font-medium">
            View All
          </button>
        </div>
        <div class="space-y-4">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="p-2 bg-primary-light rounded-lg">
              <Icon :icon="activity.icon" class="w-5 h-5 text-primary-normal" />
            </div>
            <div class="flex-1">
              <p class="text-sm text-gray-700">{{ activity.message }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending Verifications -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900">Pending Verifications</h2>
          <span class="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
            {{ pendingVerifications.length }} pending
          </span>
        </div>
        <div class="space-y-4">
          <div
            v-for="item in pendingVerifications"
            :key="item.id"
            class="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-primary-light transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Icon 
                  :icon="item.type === 'Lawyer' ? 'mdi:briefcase-account' : item.type === 'Law Firm' ? 'mdi:office-building' : 'mdi:account'" 
                  class="w-5 h-5 text-gray-600" 
                />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
                <p class="text-xs text-gray-500">{{ item.type }} • {{ item.submitted }}</p>
              </div>
            </div>
            <button class="text-xs text-primary-normal hover:text-primary-normal-hover font-medium">
              Review
            </button>
          </div>
        </div>
        <NuxtLink 
          to="/admin/lawyer-verifications"
          class="block mt-4 text-center text-sm text-primary-normal hover:text-primary-normal-hover font-medium"
        >
          View All Verifications →
        </NuxtLink>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <NuxtLink 
          to="/admin/case-categories"
          class="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-normal hover:bg-primary-light/30 transition-colors"
        >
          <Icon icon="mdi:folder-plus-outline" class="w-8 h-8 text-primary-normal" />
          <span class="text-sm font-medium text-gray-700">Add Category</span>
        </NuxtLink>
        <NuxtLink 
          to="/admin/lawyer-verifications"
          class="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-normal hover:bg-primary-light/30 transition-colors"
        >
          <Icon icon="mdi:account-check-outline" class="w-8 h-8 text-primary-normal" />
          <span class="text-sm font-medium text-gray-700">Verify Lawyers</span>
        </NuxtLink>
        <NuxtLink 
          to="/admin/firm-verifications"
          class="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-normal hover:bg-primary-light/30 transition-colors"
        >
          <Icon icon="mdi:office-building-check-outline" class="w-8 h-8 text-primary-normal" />
          <span class="text-sm font-medium text-gray-700">Verify Firms</span>
        </NuxtLink>
        <NuxtLink 
          to="/admin/client-verifications"
          class="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-normal hover:bg-primary-light/30 transition-colors"
        >
          <Icon icon="mdi:account-group-outline" class="w-8 h-8 text-primary-normal" />
          <span class="text-sm font-medium text-gray-700">Verify Clients</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
