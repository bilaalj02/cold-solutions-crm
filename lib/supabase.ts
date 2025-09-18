import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface CallLog {
  id: string
  call_id: string
  lead_id: string
  lead_name: string
  lead_email?: string
  lead_phone: string
  lead_company?: string
  lead_position?: string
  call_outcome: 'Booked Demo' | 'Interested' | 'Not Interested' | 'Requested More Info' | 'No Answer' | 'Callback Requested' | 'Follow Up Required'
  call_notes?: string
  caller_name: string
  caller_role?: string
  call_duration?: number
  timestamp: string
  lead_source?: string
  lead_industry?: string
  lead_territory?: string
  collected_email?: string
  preferred_phone?: string
  created_at: string
  updated_at: string
}

export interface CRMUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'sales_rep'
  created_at: string
  updated_at: string
}

export interface CRMSettings {
  id: string
  user_id: string
  settings: {
    dashboard_refresh_interval?: number
    default_time_period?: 'day' | 'week' | 'month'
    email_notifications?: boolean
    call_outcome_reminders?: boolean
  }
  created_at: string
  updated_at: string
}