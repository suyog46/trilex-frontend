import { URL } from "~/lib/constants/url"

export interface NotificationActor {
  id: string
  email: string
  name: string
  role: string
}

export interface Notification {
  id: string
  type: 'booking_created' | 'booking_accepted' | 'booking_rejected' | 'firm_invitation_received' | 'firm_invitation_accepted' | 'firm_invitation_rejected'
  title: string
  message: string
  entity_type: string
  entity_id: string
  metadata: Record<string, any> | string
  is_read: boolean
  created_at: string
  actor: NotificationActor
}

export interface NotificationsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Notification[]
}

export const notificationsApi = {
  /**
   * Get all notifications
   * GET /api/notifications/
   */
  getNotifications: (params?: { 
    is_read?: boolean
    page?: number
    page_size?: number 
  }): Promise<NotificationsResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch('/api/notifications/', {
      method: 'GET',
      params,
    })
  },

  /**
   * Mark a notification as read
   * POST /api/notifications/{id}/read/
   */
  markAsRead: (id: string): Promise<Notification> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/notifications/${id}/read/`, {
      method: 'POST',
    })
  },

  /**
   * Mark all notifications as read
   * POST /api/notifications/mark-all-read/
   */
  markAllAsRead: (): Promise<{ count: number }> => {
    const apiFetch = useApiFetch()
    return apiFetch('/api/notifications/mark-all-read/', {
      method: 'POST',
    })
  },
}
