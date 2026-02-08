// Types
export interface LawyerUser {
  email: string
  role: string
  id: string
}

export interface Province {
  id: number
  title: string
  title_nepali: string
  code: number
}

export interface District {
  id: number
  title: string
  title_nepali: string
  code: number
  province?: Province
}

export interface Municipality {
  id: number
  title: string
  title_nepali: string
  code: number
  district?: District
}

export interface Ward {
  id: number
  number: number
  number_nepali: string
  municipality?: Municipality
}

export interface LawyerAddress {
  id: string
  province: Province
  district: District
  municipality: Municipality
  ward: Ward
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
}

export interface LawyerProfile {
  phone_number: string
  address: LawyerAddress
  services: Service[]
}

export interface LicensePhoto {
  id: string
  url: string
}

export interface LawyerVerification {
  id: string
  full_name: string
  license_photo: LicensePhoto
}

export interface Lawyer {
  id?: string
  user: LawyerUser
  profile: LawyerProfile
  verification: LawyerVerification
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface LawyerListParams {
  page?: number
  page_size?: number
}

export const lawyersApi = {
  /**
   * Get all lawyers with pagination
   * GET /api/lawyers/
   */
  getLawyers: (params?: LawyerListParams): Promise<PaginatedResponse<Lawyer>> => {
    const apiFetch = useApiFetch()
    const queryParams = new URLSearchParams()
    
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString())
    
    const url = queryParams.toString() ? `/api/lawyers/?${queryParams.toString()}` : '/api/lawyers/'
    return apiFetch(url)
  },

  /**
   * Get lawyer by ID
   * GET /api/lawyers/{lawyer_id}/
   */
  getLawyerById: (lawyerId: string): Promise<Lawyer> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/lawyers/${lawyerId}/`)
  },
}
