import { URL } from "~/lib/constants/url"
export interface FirmUser {
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
  search?: string
  province?: number
  district?: number
  services?: string
}

export interface LawyerUser {
  id: string
  email: string
  role: string
}

export interface LawyerVerification {
  full_name: string
  license_photo: {
    id: string
    url: string
  }
}

export interface LawyerProfile {
  services?: Service[]
}

export interface LawyerData {
  id: string
  user: LawyerUser
  phone_number?: string
  address?: FirmAddress
  services?: Service[]
  verification: LawyerVerification
}

export interface FirmMember {
  id: string
  joined_at: string
  lawyer: LawyerData
}

export interface FirmMembersResponse {
  count: number
  next: string | null
  previous: string | null
  results: FirmMember[]
}

export interface FirmInvitation {
  id: string
  status: 'pending' | 'accepted' | 'rejected'
  invited_at: string
  responded_at: string | null
  lawyer: LawyerData
}

export interface FirmInvitationsResponse {
  count: number
  next: string | null
  previous: string | null
  results: FirmInvitation[]
}

export const firmsApi = {
  getFirms: (params?: FirmListParams): Promise<PaginatedResponse<Firm>> => {
    const apiFetch = useApiFetch()
    const queryParams = new URLSearchParams()
    
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.province) queryParams.append('province', params.province.toString())
    if (params?.district) queryParams.append('district', params.district.toString())
    if (params?.services) queryParams.append('services', params.services)
    
    const url = queryParams.toString() ? `/api/firms/?${queryParams.toString()}` : '/api/firms/'
    return apiFetch(url)
  },

  getFirmById: (firmId: string): Promise<Firm> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/firms/${firmId}/`)
  },

  getFirmMembers: (params?: { page?: number; page_size?: number }): Promise<FirmMembersResponse> => {
    const apiFetch = useApiFetch()
    const queryParams = new URLSearchParams()
    
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString())
    
    const url = queryParams.toString() ? `/api/firms/me/members/?${queryParams.toString()}` : '/api/firms/me/members/'
    return apiFetch(url)
  },

  addMember: (lawyerId: string): Promise<FirmMember> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/firms/me/invite-lawyer/${lawyerId}/`, {
      method: 'POST',
    })
  },

  removeMember: (memberId: string): Promise<void> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/firms/me/members/${memberId}/`, {
      method: 'DELETE',
    })
  },

  getFirmInvitations: (params?: { page?: number; page_size?: number }): Promise<FirmInvitationsResponse> => {
    const apiFetch = useApiFetch()
    const queryParams = new URLSearchParams()
    
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString())
    
    const url = queryParams.toString() ? `/api/firms/me/invitations/?${queryParams.toString()}` : '/api/firms/me/invitations/'
    return apiFetch(url)
  },
}
