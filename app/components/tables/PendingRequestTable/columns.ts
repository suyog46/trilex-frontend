import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'

export interface BookingRequest {
  id: string
  fullName: string
  type: string
  court: string
  urgency: string
  description: string
}

export  const columns: ColumnDef<BookingRequest>[] = [
  {
    accessorKey: 'fullName',
    header: 'Full Name',
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.getValue('fullName')),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => h('div', {}, row.getValue('type')),
  },
  {
    accessorKey: 'court',
    header: 'Court',
    cell: ({ row }) => h('div', {}, row.getValue('court')),
  },
  {
    accessorKey: 'urgency',
    header: 'Urgency',
    cell: ({ row }) => {
      const urgency = row.getValue('urgency') as string
      const urgencyClass = urgency === 'High' 
        ? 'bg-red-100 text-red-800 border-red-200' 
        : urgency === 'Medium' 
        ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
        : 'bg-green-100 text-green-800 border-green-200'
      
      return h('div', { class: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${urgencyClass}` }, urgency)
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => h('div', { class: 'max-w-md truncate' }, row.getValue('description')),
  },
]

export default columns