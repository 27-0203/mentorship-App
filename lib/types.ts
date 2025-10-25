export type UserRole = "student" | "mentor"
export type SessionStatus = "pending" | "confirmed" | "completed" | "cancelled"
export type MeetingType = "one_on_one" | "group"

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  bio?: string
  is_anonymous: boolean
  created_at: string
  updated_at: string
}

export interface MentorProfile {
  id: string
  expertise: string[]
  hourly_rate?: number
  years_of_experience?: number
  rating: number
  total_sessions: number
  is_available: boolean
  created_at: string
  profile?: Profile
}

export interface Session {
  id: string
  student_id: string
  mentor_id: string
  title: string
  description?: string
  scheduled_at: string
  duration_minutes: number
  status: SessionStatus
  meeting_link?: string
  notes?: string
  created_at: string
  updated_at: string
  student?: Profile
  mentor?: MentorProfile & { profile?: Profile }
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  session_id?: string
  content: string
  is_read: boolean
  created_at: string
  sender?: Profile
  receiver?: Profile
}

export interface Availability {
  id: string
  mentor_id: string
  day_of_week: number
  start_time: string
  end_time: string
  created_at: string
}

export interface Group {
  id: string
  name: string
  description?: string
  mentor_id: string
  max_participants: number
  created_at: string
  mentor?: MentorProfile & { profile?: Profile }
  member_count?: number
}

export interface Review {
  id: string
  session_id: string
  student_id: string
  mentor_id: string
  rating: number
  comment?: string
  created_at: string
  student?: Profile
}
