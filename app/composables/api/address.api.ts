import { URL } from "~/lib/constants/url"

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
}

export interface Municipality {
  id: number
  title: string
  title_nepali: string
  code: number
}

export interface Ward {
  id: number
  number: number
  number_nepali: string
  municipality: Municipality
}

export interface Category {
  id: string
  name: string
  description?: string
}

export const addressApi = {
  /**
   * Fetch all provinces
   * GET /api/addresses/provinces/
   */
  getProvinces: (): Promise<Province[]> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.ADDRESS.PROVINCES)
  },

  /**
   * Fetch districts by province ID
   * GET /api/addresses/districts/{province_id}/
   */
  getDistricts: (provinceId: number): Promise<District[]> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.ADDRESS.DISTRICTS(provinceId))
  },

  /**
   * Fetch municipalities by district ID
   * GET /api/addresses/municipalities/{district_id}/
   */
  getMunicipalities: (districtId: number): Promise<Municipality[]> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.ADDRESS.MUNICIPALITIES(districtId))
  },

  /**
   * Fetch wards by municipality ID
   * GET /api/addresses/wards/{municipality_id}/
   */
  getWards: (municipalityId: number): Promise<Ward[]> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.ADDRESS.WARDS(municipalityId))
  },
}

export const casesApi = {
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
}
