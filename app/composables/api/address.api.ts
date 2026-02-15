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
  
   
   
  getProvinces: (): Promise<Province[]> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.ADDRESS.PROVINCES)
  },

  
   
  getDistricts: (provinceId: number): Promise<District[]> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.ADDRESS.DISTRICTS(provinceId))
  },

  
   
  getMunicipalities: (districtId: number): Promise<Municipality[]> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.ADDRESS.MUNICIPALITIES(districtId))
  },

  
    
   
  getWards: (municipalityId: number): Promise<Ward[]> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.ADDRESS.WARDS(municipalityId))
  },
}

