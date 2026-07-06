
export type EventType = 'exposition' | 'conference' | 'atelier' | 'rencontre'

export interface Event {
  id: string
  title: string
  description: string
  type: EventType
  venue: string
  date: string
  totalSeats: number
  availableSeats: number
  imageUrl: string | null
  createdAt: string
}

export interface EventsFilters {
  type?: EventType
  date?: string
  page?: number
  limit?: number
}

export interface PaginatedEvents {
  data: Event[]
  total: number
  page: number
  limit: number
}

export interface CreateEventPayload {
  title: string
  description: string
  type: EventType
  venue: string
  date: string
  totalSeats: number
  imageUrl?: string
}


export type BookingStatus = 'confirmed' | 'cancelled'

export interface Booking {
  id: string
  userId: string
  eventId: string
  status: BookingStatus
  createdAt: string
  event: Event
}


export interface UpdateProfilePayload {
  name?: string
  email?: string
  password?: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
}
