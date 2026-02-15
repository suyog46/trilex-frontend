import { URL } from '~/lib/constants/url'

export interface ChatMessage {
  sender: 'user' | 'ai'
  message: string
  answer?: string // Alternative field for answer (used in not_legal query_type)
  query_type: string | null
  recommendations: Recommendations | null
  created_at: string
}

export interface Recommendations {
  case_category: string | null
  lawyers: LawyerRecommendation[]
  firms: FirmRecommendation[]
}

export interface LawyerRecommendation {
  id: string
  user: {
    id: string
    email: string
    role: string
  }
  profile: {
    phone_number: string
    address: AddressInfo
    services: ServiceInfo[]
  }
  verification: {
    full_name: string
    license_photo: MediaFile
  }
}

export interface FirmRecommendation {
  id: string
  user: {
    id: string
    email: string
    role: string
  }
  profile: {
    phone_number: string
    address: AddressInfo
    services: ServiceInfo[]
  }
  verification: {
    id: string
    firm_name: string
    firm_license: MediaFile
  }
}

export interface AddressInfo {
  id: string
  province: LocationEntity
  district: LocationEntity
  municipality: LocationEntity
  ward: WardInfo
  created_at: string
  updated_at: string
}

export interface LocationEntity {
  id: number
  title: string
  title_nepali: string
  code: number
}

export interface WardInfo {
  id: number
  number: number
  number_nepali: string
}

export interface ServiceInfo {
  id: string
  name: string
}

export interface MediaFile {
  id: string
  url: string
}

export interface ChatHistoryResponse {
  count: number
  next: string | null
  previous: string | null
  results: ChatMessage[]
}

export interface QueryRequest {
  query: string
}

export interface QueryResponse {
  answer: string
  query_type: string
  recommendations: Recommendations
  created_at: string
}

export const aiAssistantApi = {

  getChatHistory: (page: number = 1, pageSize: number = 10): Promise<ChatHistoryResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/ai-assistant/history/`, {
      method: 'GET',
      params: {
        page,
        page_size: pageSize,
      },
    })
  },


  sendQuery: (payload: QueryRequest): Promise<QueryResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/ai-assistant/query/`, {
      method: 'POST',
      body: payload,
    })
  },
}
