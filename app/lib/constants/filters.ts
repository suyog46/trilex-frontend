// Static filter data for booking requests
// TODO: Replace with API call later

export interface FilterOption {
  label: string
  value: string
}

export interface FilterGroup {
  id: string
  label: string
  options: FilterOption[]
}

export const bookingFilters: FilterGroup[] = [
  {
    id: 'type',
    label: 'Case Type',
    options: [
      { label: 'All Types', value: '' },
      { label: 'Criminal', value: 'Criminal' },
      { label: 'Civil', value: 'Civil' },
      { label: 'Family', value: 'Family' },
      { label: 'Corporate', value: 'Corporate' },
      { label: 'Immigration', value: 'Immigration' },
    ]
  },
  {
    id: 'urgency',
    label: 'Urgency',
    options: [
      { label: 'All Urgency', value: '' },
      { label: 'High', value: 'High' },
      { label: 'Medium', value: 'Medium' },
      { label: 'Low', value: 'Low' },
    ]
  },
  {
    id: 'court',
    label: 'Court',
    options: [
      { label: 'All Courts', value: '' },
      { label: 'Supreme Court', value: 'Supreme Court' },
      { label: 'District Court', value: 'District Court' },
      { label: 'Family Court', value: 'Family Court' },
      { label: 'Commercial Court', value: 'Commercial Court' },
      { label: 'Immigration Court', value: 'Immigration Court' },
    ]
  },
]

// Case filters for draft, ongoing, and completed cases
export const caseFilters: FilterGroup[] = [
  {
    id: 'courtType',
    label: 'Court Type',
    options: [
      { label: 'All Courts', value: '' },
      { label: 'Supreme Court', value: 'Supreme Court' },
      { label: 'District Court', value: 'District Court' },
      { label: 'Family Court', value: 'Family Court' },
      { label: 'Commercial Court', value: 'Commercial Court' },
      { label: 'Labor Court', value: 'Labor Court' },
    ]
  },
  {
    id: 'tarikMonth',
    label: 'Tarik Month',
    options: [
      { label: 'All Months', value: '' },
      { label: 'January', value: '01' },
      { label: 'February', value: '02' },
      { label: 'March', value: '03' },
      { label: 'April', value: '04' },
      { label: 'May', value: '05' },
      { label: 'June', value: '06' },
      { label: 'July', value: '07' },
      { label: 'August', value: '08' },
      { label: 'September', value: '09' },
      { label: 'October', value: '10' },
      { label: 'November', value: '11' },
      { label: 'December', value: '12' },
    ]
  },
]

