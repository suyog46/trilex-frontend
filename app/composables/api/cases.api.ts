import { URL } from "~/lib/constants/url"

// Types
export interface Category {
  id: string
  name: string
  is_active: boolean
  created_at: string
}

export interface Client {
  full_name: string
  address: string
  email: string
  phone: string
  date_of_birth: string
  citizenship_number: string
  gender: string
}

export interface Waris {
  full_name: string
  email: string
  address: string
  phone: string
  date_of_birth: string
  citizenship_number: string
  gender: string
}

export interface CaseDocument {
  title: string
  description: string
  file: string
  file_type: "image" | "pdf" | "document"
  document_scope: "internal" | "client"
}

export interface CaseDate {
  date_type: "tarik"
  date: string
  remark: string
  assigned_to_name: string
}

export interface CreateCaseInput {
  title: string
  case_category: string
  court_type: "district" | "high" | "supreme"
  description: string
  status: "draft" | "registered" | "ongoing" | "completed"
  client_details: Client
  client?: string
  waris?: Waris
  documents?: CaseDocument[]
  dates?: CaseDate[]
}

export interface UpdateCaseInput {
  title: string
  case_category: string
  court_type: "district" | "high" | "supreme"
  description: string
  status: "draft" | "registered" | "ongoing" | "completed"
  client?: string
  client_details: Client
  waris?: Waris
}

export interface RegisteredClient {
  id: string
  user: {
    id: string
    email: string
    role: string
  }
  profile: {
    phone_number: string
    address: any
  }
  verification: {
    full_name: string
    passport_size_photo: {
      id: string
      url: string
    }
  }
}

export interface ClientsListResponse {
  count: number
  next: string | null
  previous: string | null
  results: RegisteredClient[]
}

export interface CaseListItem {
  id: string
  owner_type: string
  title: string
  case_category: {
    id: string
    name: string
    is_active: boolean
    created_at: string
  }
  court_type: string
  description: string
  status: string
  client: any
  client_details: {
    id: string
    full_name: string
    address: string
    email: string
    phone: string
    date_of_birth: string
    citizenship_number: string
    gender: string
    created_at: string
  }
  waris: any
  dates: any[]
  total_documents: number
  assigned_lawyers: any[]
  created_at: string
  updated_at: string
}

export interface CasesListResponse {
  count: number
  next: string | null
  previous: string | null
  results: CaseListItem[]
}

export interface FirmMember {
  id: string
  lawyer: {
    id: string
    user: {
      id: string
      email: string
      full_name: string
    }
    verification: {
      full_name: string
      passport_size_photo: {
        id: string
        url: string
      } | null
    }
  }
  role: string
  joined_at: string
}

export interface FirmMembersResponse {
  count: number
  next: string | null
  previous: string | null
  results: FirmMember[]
}

export interface DocumentItem {
  id: string
  title: string
  description: string
  file: {
    id: string
    url: string
  }
  file_type: "image" | "pdf" | "document"
  document_scope: "internal" | "client"
  uploaded_by_type: "lawyer" | "client" | "firm"
  uploaded_by_user: string
  created_at: string
}

export interface DocumentsListResponse {
  count: number
  next: string | null
  previous: string | null
  results: DocumentItem[]
}

export interface UploadDocumentInput {
  title: string
  description: string
  file: string
  file_type: "image" | "pdf" | "document"
  document_scope: "internal" | "client"
}

export interface CaseDetail {
  id: string
  owner_type: string
  title: string
  case_category: {
    id: string
    name: string
    is_active: boolean
    created_at: string
  }
  court_type: "district" | "high" | "supreme"
  description: string
  status: "draft" | "registered" | "ongoing" | "completed"
  client: {
    id: string
    user: {
      id: string
      email: string
      role: string
    }
    verification: {
      full_name: string
      passport_size_photo: {
        id: string
        url: string
      }
    }
  } | null
  client_details: {
    id: string
    full_name: string
    address: string
    email: string
    phone: string
    date_of_birth: string
    citizenship_number: string
    gender: string
    created_at: string
  }
  waris: {
    id: string
    full_name: string
    email: string
    address: string
    phone: string
    date_of_birth: string
    citizenship_number: string
    gender: string
    created_at: string
  } | null
  dates: {
    id: string
    date_type: "tarik"
    date: string
    remark: string
    assigned_to_name: string
    created_at: string
  }[]
  total_documents: number
  assigned_lawyers: {
    lawyer_id: string
    email: string
    role: string
    can_edit: boolean
  }[]
  created_at: string
  updated_at: string
}

export const casesApi = {
  /**
   * Get category by ID
   * GET /api/cases/categories/{id}/
   */
  getCategoryById: (categoryId: string): Promise<Category> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/cases/categories/${categoryId}/`)
  },

  /**
   * Fetch case categories
   * GET /api/cases/categories/
   */
  getCategories: (params?: { active?: boolean; page?: number; page_size?: number }): Promise<{ results: Category[] }> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.CASES.CATEGORIES, {
      params,
    })
  },

  /**
   * Create a new case
   * POST /api/cases/
   */
  createCase: (data: CreateCaseInput): Promise<any> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.CASES.CREATE, {
      method: 'POST',
      body: data,
    })
  },

  /**
   * Get list of registered clients
   * GET /api/clients/
   */
  getClients: (params?: { page?: number; page_size?: number; search?: string }): Promise<ClientsListResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.CLIENTS.LIST, {
      params,
    })
  },

  /**
   * Get list of cases with filters
   * GET /api/cases/list/
   */
  getCasesList: (params?: {
    case_category?: string
    case_scope?: string
    court_type?: string
    created_from?: string
    created_to?: string
    page?: number
    page_size?: number
    search?: string
    status?: string
  }): Promise<CasesListResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.CASES.LIST, {
      params,
    })
  },

  /**
   * Assign lawyer to a case
   * POST /api/cases/{case_id}/assign-lawyer/
   */
  assignLawyer: (caseId: string, lawyerId: string): Promise<any> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/cases/${caseId}/assign-lawyer/`, {
      method: 'POST',
      body: { lawyer: lawyerId },
    })
  },

  /**
   * Get firm members (lawyers)
   * GET /api/firms/me/members/
   */
  getFirmMembers: (params?: { page?: number; page_size?: number; search?: string }): Promise<FirmMembersResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch('/api/firms/me/members/', {
      params,
    })
  },

  /**
   * Get case details by ID
   * GET /api/cases/{case_id}/
   */
  getCaseDetail: (caseId: string): Promise<CaseDetail> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/cases/${caseId}/`)
  },

  /**
   * Update case by ID
   * PATCH /api/cases/{case_id}/update/
   */
  updateCase: (caseId: string, data: UpdateCaseInput): Promise<CaseDetail> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/cases/${caseId}/update/`, {
      method: 'PATCH',
      body: data,
    })
  },

  /**
   * Get documents for a case
   * GET /api/cases/{case_id}/documents/
   */
  getCaseDocuments: (caseId: string, params?: {
    page?: number
    page_size?: number
    scope?: 'my' | 'firm' | 'client'
  }): Promise<DocumentsListResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/cases/${caseId}/documents/`, {
      params,
    })
  },

  /**
   * Upload document to a case
   * POST /api/cases/{case_id}/documents/upload/
   */
  uploadCaseDocument: (caseId: string, data: UploadDocumentInput): Promise<DocumentItem> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/cases/${caseId}/documents/upload/`, {
      method: 'POST',
      body: data,
    })
  },
}

