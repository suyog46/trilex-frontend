import { URL } from "~/lib/constants/url"

// Types
export interface ChatUser {
  id: string
  email: string
  role: string
}

export interface ChatParticipant {
  id: string
  user: ChatUser
  is_admin: boolean
  joined_at: string
}

export interface LastMessage {
  id: string
  sender: string
  message: string
  created_at: string
}

export interface ChatRoom {
  id: string
  booking_id: string
  participants: ChatParticipant[]
  last_message: LastMessage | null
  unread_count: number
  updated_at: string
}

export interface ChatRoomsResponse {
  count: number
  next: string | null
  previous: string | null
  results: ChatRoom[]
}

export interface MessageSender {
  id: string
  email: string
  role: string
}

export interface ChatMessage {
  id: string
  sender: MessageSender
  message: string
  created_at: string
}

export interface ChatMessagesResponse {
  count: number
  next: string | null
  previous: string | null
  results: ChatMessage[]
}

export interface CreateRoomPayload {
  booking_id: string
}

export interface SendMessagePayload {
  message: string
}

export const chatApi = {
  /**
   * Create a chat room
   * POST /api/chat/rooms/{booking_id}/
   */
  createRoom: (bookingId: string): Promise<ChatRoom> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/chat/rooms/${bookingId}/`, {
      method: "POST",
    })
  },

  /**
   * Get all chat rooms
   * GET /api/chat/rooms/
   */
  getRooms: (params?: { page?: number; page_size?: number }): Promise<ChatRoomsResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch('/api/chat/rooms/', {
      method: "GET",
      params,
    })
  },

  /**
   * Get messages for a specific room
   * GET /api/chat/rooms/{room_id}/messages/
   */
  getMessages: (roomId: string, params?: { page?: number; page_size?: number }): Promise<ChatMessagesResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/chat/rooms/${roomId}/messages/`, {
      method: "GET",
      params,
    })
  },

  /**
   * Send a message in a room
   * POST /api/chat/rooms/{room_id}/messages/
   */
  sendMessage: (roomId: string, payload: SendMessagePayload): Promise<ChatMessage> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/chat/rooms/${roomId}/messages/`, {
      method: "POST",
      body: payload,
    })
  },
}
