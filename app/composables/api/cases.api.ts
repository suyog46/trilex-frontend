// Types
export interface Category {
  id: string
  name: string
  is_active: boolean
  created_at: string
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
}
