import { URL } from "~/lib/constants/url"

// Request/Response types
export interface CreateBookingPayload {
  created_to: string
  case_category: string
  court_type: string
  description: string
  date: string
}

export interface User {
  id: string
  name: string
  email: string
  role: string
}

export interface BookingResponse {
  id: string
  created_by: User
  created_to: User
  case_category?: string
  case_category_name: string
  court_type: string
  description?: string
  date: string
  status: "pending" | "accepted" | "rejected"
  created_at: string
}

export interface BookingsListResponse {
  count: number
  next: string | null
  previous: string | null
  results: BookingResponse[]
}

export const bookingsApi = {
  /**
   * Create a new booking
   * POST /api/bookings/
   */
  createBooking: (payload: CreateBookingPayload): Promise<BookingResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.BOOKINGS.CREATE, {
      method: "POST",
      body: payload,
    })
  },

  /**
   * Get sent bookings (bookings created by the current user)
   * GET /api/bookings/sent/ with pagination and status filter
   */
  getBookingsSent: (params?: {
    page?: number
    page_size?: number
    status?: "pending" | "accepted" | "rejected"
  }): Promise<BookingsListResponse> => {
    const apiFetch = useApiFetch()
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append("page", String(params.page))
    if (params?.page_size) queryParams.append("page_size", String(params.page_size))
    if (params?.status) queryParams.append("status", params.status)

    const queryString = queryParams.toString()
    const url = queryString ? `${URL.API.BOOKINGS.SENT}?${queryString}` : URL.API.BOOKINGS.SENT

    return apiFetch(url)
  },

  /**
   * Get received bookings (bookings sent to the current user)
   * GET /api/bookings/received/ with pagination and status filter
   */
  getBookingsReceived: (params?: {
    page?: number
    page_size?: number
    status?: "pending" | "accepted" | "rejected"
  }): Promise<BookingsListResponse> => {
    const apiFetch = useApiFetch()
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append("page", String(params.page))
    if (params?.page_size) queryParams.append("page_size", String(params.page_size))
    if (params?.status) queryParams.append("status", params.status)

    const queryString = queryParams.toString()
    const url = queryString ? `${URL.API.BOOKINGS.RECEIVED}?${queryString}` : URL.API.BOOKINGS.RECEIVED

    return apiFetch(url)
  },

  /**
   * Get booking detail
   * GET /api/bookings/{id}/
   */
  getBookingDetail: (bookingId: string): Promise<BookingResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch(`${URL.API.BOOKINGS.DETAIL(bookingId)}`)
  },

  /**
   * Accept a booking
   * POST /api/bookings/{id}/accept/
   */
  acceptBooking: (bookingId: string): Promise<BookingResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch(`${URL.API.BOOKINGS.ACCEPT(bookingId)}`, {
      method: "POST",
    })
  },

  /**
   * Reject a booking
   * POST /api/bookings/{id}/reject/
   */
  rejectBooking: (bookingId: string): Promise<BookingResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch(`${URL.API.BOOKINGS.REJECT(bookingId)}`, {
      method: "POST",
    })
  },
}
