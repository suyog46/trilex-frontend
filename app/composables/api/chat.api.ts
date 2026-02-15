import { URL } from "~/lib/constants/url"
export interface ChatUser {
  id: string
  email: string
  name: string
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
  name: string
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
  createRoom: (bookingId: string): Promise<ChatRoom> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/chat/rooms/${bookingId}/`, {
      method: "POST",
    })
  },

  getRooms: (params?: { page?: number; page_size?: number }): Promise<ChatRoomsResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch('/api/chat/rooms/', {
      method: "GET",
      params,
    })
  },

  getMessages: (roomId: string, params?: { page?: number; page_size?: number }): Promise<ChatMessagesResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/chat/rooms/${roomId}/messages/`, {
      method: "GET",
      params,
    })
  },

  sendMessage: (roomId: string, payload: SendMessagePayload): Promise<ChatMessage> => {
    const apiFetch = useApiFetch()
    return apiFetch(`/api/chat/rooms/${roomId}/messages/`, {
      method: "POST",
      body: payload,
    })
  },
}
