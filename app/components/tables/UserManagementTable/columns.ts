import type { ColumnDef } from '@tanstack/vue-table'
import { h, ref } from 'vue'
import type { FirmMember } from '~/composables/api/firms.api'
import { casesApi } from '~/composables/api/cases.api'

// Cache for service names to avoid repeated API calls
const serviceCache = ref<Record<string, string>>({})
const loadingServices = ref<Set<string>>(new Set())

const getServiceName = async (serviceId: string): Promise<string> => {
  // Don't fetch if undefined or empty
  if (!serviceId) {
    return 'Unknown Service'
  }

  if (serviceCache.value[serviceId]) {
    return serviceCache.value[serviceId]
  }

  // Prevent duplicate requests
  if (loadingServices.value.has(serviceId)) {
    return 'Loading...'
  }

  try {
    loadingServices.value.add(serviceId)
    const category = await casesApi.getCategoryById(serviceId)
    serviceCache.value[serviceId] = category.name
    loadingServices.value.delete(serviceId)
    return category.name
  } catch (error) {
    console.error('Error fetching service name:', error)
    loadingServices.value.delete(serviceId)
    return 'Unknown Service'
  }
}

export const createUserManagementColumns = (): ColumnDef<FirmMember>[] => [
  {
    accessorKey: 'lawyer.verification',
    header: 'Lawyer',
    cell: ({ row }) => {
      const member = row.original
      const photoUrl = member.lawyer?.verification?.license_photo?.url
      const fullName = member.lawyer?.verification?.full_name ?? 'N/A'
      const email = member.lawyer?.user?.email ?? 'N/A'
      
      return h('div', { class: 'flex items-center gap-3' }, [
        h('img', {
          src: photoUrl || '',
          alt: fullName,
          class: 'w-10 h-10 rounded-full object-cover bg-gray-200 flex-shrink-0',
          onError: (e: Event) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40'
          }
        }),
        h('div', { class: 'flex flex-col min-w-0' }, [
          h('p', { class: 'font-medium text-sm text-gray-900' }, fullName),
          h('p', { class: 'text-xs text-gray-500 truncate' }, email)
        ])
      ])
    },
    meta: {
      width: '250px'
    }
  },
  {
    accessorKey: 'lawyer.phone_number',
    header: 'Phone',
    cell: ({ row }) => {
      const phoneNumber = row.original.lawyer?.phone_number || 'N/A'
      return h('span', { class: 'text-sm text-gray-600' }, phoneNumber)
    },
    meta: {
      width: '150px'
    }
  },
  {
    accessorKey: 'lawyer.services',
    header: 'Services',
    cell: ({ row }) => {
      const member = row.original
      const services = member.lawyer?.services ?? []
      
      // Filter out undefined service IDs
      const validServices = services.filter(s => s && s.id)
      
      if (validServices.length === 0) {
        return h('span', { class: 'text-sm text-gray-600' }, 'N/A')
      }

      const serviceNames = ref<string[]>([])
      const isLoading = ref(false)

      // Fetch service names only for valid services
      if (serviceNames.value.length === 0) {
        isLoading.value = true
        Promise.all(validServices.map(s => getServiceName(s.id))).then(names => {
          serviceNames.value = names
          isLoading.value = false
        })
      }

      const displayText = serviceNames.value.length > 0 
        ? serviceNames.value.join(', ') 
        : (isLoading.value ? 'Loading...' : 'N/A')
      
      return h('div', { 
        class: 'text-sm text-gray-600 max-w-xs truncate',
        title: displayText
      }, displayText)
    },
    meta: {
      width: '200px'
    }
  },
  {
    accessorKey: 'joined_at',
    header: 'Joined At',
    cell: ({ row }) => {
      const joinedAt = row.original.joined_at
      const date = new Date(joinedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
      return h('span', { class: 'text-sm text-gray-600' }, date)
    },
    meta: {
      width: '130px'
    }
  },
]
