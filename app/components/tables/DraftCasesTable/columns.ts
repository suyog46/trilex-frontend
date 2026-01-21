import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { Icon } from '@iconify/vue'
import type { Case } from '~/lib/constants/casesData'

// Action dropdown component
const ActionDropdown = (props: { case: Case, onAction: (action: string, caseData: Case) => void }) => {
  const showDropdown = ref(false)
  
  const handleAction = (action: string, event: Event) => {
    event.stopPropagation()
    props.onAction(action, props.case)
    showDropdown.value = false
  }
  
  const toggleDropdown = (event: Event) => {
    event.stopPropagation()
    showDropdown.value = !showDropdown.value
  }
  
  return h('div', { class: 'relative' }, [
    h('button', {
      onClick: toggleDropdown,
      class: 'p-1 hover:bg-gray-100 rounded-lg transition-colors'
    }, [
      h(Icon, { icon: 'mdi:dots-vertical', class: 'w-5 h-5 text-gray-600' })
    ]),
    showDropdown.value ? h('div', {
      class: 'absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]'
    }, [
      h('button', {
        onClick: (e: Event) => handleAction('view', e),
        class: 'w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm'
      }, [
        h(Icon, { icon: 'mdi:eye-outline', class: 'w-4 h-4' }),
        'View Details'
      ]),
      h('button', {
        onClick: (e: Event) => handleAction('edit', e),
        class: 'w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm'
      }, [
        h(Icon, { icon: 'mdi:pencil-outline', class: 'w-4 h-4' }),
        'Edit'
      ]),
      h('button', {
        onClick: (e: Event) => handleAction('delete', e),
        class: 'w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-red-600'
      }, [
        h(Icon, { icon: 'mdi:delete-outline', class: 'w-4 h-4' }),
        'Delete'
      ]),
    ]) : null
  ])
}

export const createDraftCaseColumns = (onAction: (action: string, caseData: Case) => void): ColumnDef<Case>[] => [
  {
    accessorKey: 'caseName',
    header: 'Case Name',
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.getValue('caseName')),
    meta: {
      width: '250px'
    }
  },
  {
    accessorKey: 'courtType',
    header: 'Court Type',
    cell: ({ row }) => row.getValue('courtType'),
    meta: {
      width: '150px'
    }
  },
  {
    accessorKey: 'clientName',
    header: 'Client Name',
    cell: ({ row }) => row.getValue('clientName'),
    meta: {
      width: '180px'
    }
  },
  {
    accessorKey: 'warisName',
    header: 'Waris Name',
    cell: ({ row }) => row.getValue('warisName'),
    meta: {
      width: '180px'
    }
  },
  {
    accessorKey: 'files',
    header: 'Files',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-2' }, [
      h(Icon, { icon: 'mdi:file-document-outline', class: 'w-4 h-4 text-gray-500' }),
      h('span', row.getValue('files'))
    ]),
    meta: {
      width: '100px'
    }
  },
  {
    accessorKey: 'tarikDate',
    header: 'Tarik Date',
    cell: ({ row }) => {
      const date = new Date(row.getValue('tarikDate'))
      return date.toLocaleDateString('en-GB')
    },
    meta: {
      width: '120px'
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => h(ActionDropdown, { 
      case: row.original,
      onAction 
    }),
    meta: {
      width: '80px'
    }
  },
]
