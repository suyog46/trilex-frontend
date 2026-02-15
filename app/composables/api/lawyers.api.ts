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
  search?: string
  province?: number
  district?: number
  services?: string
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

export interface FirmData {
  id: string
  user: LawyerUser
  phone_number?: string
  address?: string
  services?: Service[]
  verification: FirmVerification
}

export interface LawyerFirmInvitation {
  id: string
  status: 'pending' | 'accepted' | 'rejected'
  invited_at: string
  responded_at: string | null
  firm: FirmData
}

export interface LawyerFirmInvitationsResponse {
  count: number
  next: string | null
  previous: string | null
  results: LawyerFirmInvitation[]
}

export const lawyersApi = {
  getLawyers: (params?: LawyerListParams): Promise<PaginatedResponse<Lawyer>> => {
    const apiFetch = useApiFetch()
    const queryParams = new URLSearchParams()
    
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.province) queryParams.append('province', params.province.toString())
    if (params?.district) queryParams.append('district', params.district.toString())
    if (params?.services) queryParams.append('services', params.services)
    
    const url = queryParams.toString() ? `/api/lawyers/?${queryParams.toString()}` : '/api/lawyers/'
    return apiFetch(url)
  },

  getLawyerById: (lawyerId: string): Promise<Lawyer> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/lawyers/${lawyerId}/`)
  },

  suspendLawyer: (lawyerId: string): Promise<any> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/lawyers/${lawyerId}/suspend/`, {
      method: 'PATCH',
    })
  },

  getLawyerFirmInvitations: (params?: { page?: number; page_size?: number }): Promise<LawyerFirmInvitationsResponse> => {
    const apiFetch = useApiFetch()
    const queryParams = new URLSearchParams()
    
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString())
    
    const url = queryParams.toString() ? `/api/lawyers/me/invitations/?${queryParams.toString()}` : '/api/lawyers/me/invitations/'
    return apiFetch(url)
  },

  respondToFirmInvitation: (invitationId: string, action: 'accept' | 'reject'): Promise<any> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/lawyers/me/invitations/${invitationId}/${action}/`, {
      method: 'POST',
    })
  },
}
