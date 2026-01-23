import { URL } from "~/lib/constants/url"

// Types
export interface FirmUser {
  email: string
  role: string
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

export interface FirmAddress {
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

export interface FirmProfile {
  phone_number: string
  address: FirmAddress
  services: Service[]
}

export interface FirmLicense {
  id: string
  url: string
}

export interface FirmVerification {
  id: string
  firm_name: string
  firm_license: FirmLicense
}

export interface Firm {
  id?: string
  user: FirmUser
  profile: FirmProfile
  verification: FirmVerification
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface FirmListParams {
  page?: number
  page_size?: number
}

export const firmsApi = {
  /**
   * Get all firms with pagination
   * GET /api/firms/
   */
  getFirms: (params?: FirmListParams): Promise<PaginatedResponse<Firm>> => {
    const apiFetch = useApiFetch()
    const queryParams = new URLSearchParams()
    
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString())
    
    const url = queryParams.toString() ? `/api/firms/?${queryParams.toString()}` : '/api/firms/'
    return apiFetch(url)
  },

  /**
   * Get firm by ID
   * GET /api/firms/{firm_id}/
   */
  getFirmById: (firmId: string): Promise<Firm> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/firms/${firmId}/`)
  },
}
