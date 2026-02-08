import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import type { BookingResponse } from '~/composables/api/bookings.api'

export const columns: ColumnDef<BookingResponse>[] = [
  {
    accessorKey: 'created_by.name',
    header: 'Client Name',
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.created_by.name),
  },
  {
    accessorKey: 'case_category_name',
    header: 'Case Type',
    cell: ({ row }) => h('div', {}, row.original.case_category_name),
  },
  {
    accessorKey: 'court_type',
    header: 'Court',
    cell: ({ row }) => {
      const courtType = row.getValue('court_type') as string
      const labelMap: { [key: string]: string } = {
        district: 'District Court',
        supreme: 'Supreme Court',
        high: 'High Court',
        family: 'Family Court',
        commercial: 'Commercial Court',
      }
      return h('div', {}, labelMap[courtType] || courtType)
    },
  },
  {
    accessorKey: 'date',
    header: 'Booking Date',
    cell: ({ row }) => {
      const date = row.getValue('date') as string
      return h('div', {}, new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }))
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const statusClasses: { [key: string]: string } = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        accepted: 'bg-green-100 text-green-800 border-green-200',
        rejected: 'bg-red-100 text-red-800 border-red-200',
      }
      
      const statusMap: { [key: string]: string } = {
        pending: 'Pending',
        accepted: 'Accepted',
        rejected: 'Rejected',
      }
      
      return h('div', { class: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClasses[status] || 'bg-gray-100'}` }, statusMap[status] || status)
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Received At',
    cell: ({ row }) => {
      const createdAt = row.getValue('created_at') as string
      return h('div', { class: 'text-sm text-gray-600' }, new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }))
    },
  },
]

export default columns
