import { supabase, CallLog, CRMUser, CRMSettings } from './supabase'

export class SupabaseService {
  // Call Logs Operations
  static async createCallLog(callData: Omit<CallLog, 'id' | 'created_at' | 'updated_at'>): Promise<CallLog | null> {
    try {
      const { data, error } = await supabase
        .from('crm_call_logs')
        .insert({
          ...callData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating call log:', error)
        return null
      }

      return data as CallLog
    } catch (error) {
      console.error('Exception creating call log:', error)
      return null
    }
  }

  static async getCallLogs(options?: {
    limit?: number
    offset?: number
    date?: string
    caller?: string
    outcome?: string
  }): Promise<{ calls: CallLog[]; total: number }> {
    try {
      let query = supabase
        .from('crm_call_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })

      // Apply filters
      if (options?.date) {
        const filterDate = new Date(options.date)
        const startOfDay = new Date(filterDate.setHours(0, 0, 0, 0)).toISOString()
        const endOfDay = new Date(filterDate.setHours(23, 59, 59, 999)).toISOString()
        query = query.gte('timestamp', startOfDay).lte('timestamp', endOfDay)
      }

      if (options?.caller) {
        query = query.ilike('caller_name', `%${options.caller}%`)
      }

      if (options?.outcome) {
        query = query.eq('call_outcome', options.outcome)
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit)
      }
      if (options?.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1)
      }

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching call logs:', error)
        return { calls: [], total: 0 }
      }

      return {
        calls: data as CallLog[],
        total: count || 0
      }
    } catch (error) {
      console.error('Exception fetching call logs:', error)
      return { calls: [], total: 0 }
    }
  }

  static async getCallStatsForPeriod(startDate: Date, endDate: Date): Promise<{
    totalCalls: number
    successful: number
    unsuccessful: number
    pending: number
    callsByOutcome: Record<string, number>
    callsByDay?: Record<string, number>
    averageCallDuration: number
  }> {
    try {
      const { data, error } = await supabase
        .from('crm_call_logs')
        .select('call_outcome, timestamp, call_duration')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())

      if (error) {
        console.error('Error fetching call stats:', error)
        return {
          totalCalls: 0,
          successful: 0,
          unsuccessful: 0,
          pending: 0,
          callsByOutcome: {},
          averageCallDuration: 0
        }
      }

      const successfulOutcomes = ['Booked Demo', 'Interested', 'Requested More Info']
      const unsuccessfulOutcomes = ['Not Interested', 'No Answer']
      const pendingOutcomes = ['Callback Requested', 'Follow Up Required']

      const stats = {
        totalCalls: data.length,
        successful: 0,
        unsuccessful: 0,
        pending: 0,
        callsByOutcome: {} as Record<string, number>,
        callsByDay: {} as Record<string, number>,
        averageCallDuration: 0
      }

      data.forEach(call => {
        // Count by outcome type
        if (successfulOutcomes.includes(call.call_outcome)) {
          stats.successful++
        } else if (unsuccessfulOutcomes.includes(call.call_outcome)) {
          stats.unsuccessful++
        } else if (pendingOutcomes.includes(call.call_outcome)) {
          stats.pending++
        }

        // Count by specific outcome
        stats.callsByOutcome[call.call_outcome] = (stats.callsByOutcome[call.call_outcome] || 0) + 1

        // Count by day (for week view)
        const dayName = new Date(call.timestamp).toLocaleDateString('en-US', { weekday: 'long' })
        stats.callsByDay[dayName] = (stats.callsByDay[dayName] || 0) + 1
      })

      // Calculate average call duration
      const totalDuration = data.reduce((sum, call) => sum + (call.call_duration || 0), 0)
      stats.averageCallDuration = data.length > 0 ? totalDuration / data.length : 0

      return stats
    } catch (error) {
      console.error('Exception fetching call stats:', error)
      return {
        totalCalls: 0,
        successful: 0,
        unsuccessful: 0,
        pending: 0,
        callsByOutcome: {},
        averageCallDuration: 0
      }
    }
  }

  // User Operations
  static async getCurrentUser(): Promise<CRMUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return null

      const { data, error } = await supabase
        .from('crm_users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user:', error)
        return null
      }

      return data as CRMUser || null
    } catch (error) {
      console.error('Exception fetching current user:', error)
      return null
    }
  }

  static async createUser(userData: Omit<CRMUser, 'id' | 'created_at' | 'updated_at'>): Promise<CRMUser | null> {
    try {
      const { data, error } = await supabase
        .from('crm_users')
        .insert({
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user:', error)
        return null
      }

      return data as CRMUser
    } catch (error) {
      console.error('Exception creating user:', error)
      return null
    }
  }

  // Settings Operations
  static async getUserSettings(userId: string): Promise<CRMSettings | null> {
    try {
      const { data, error } = await supabase
        .from('crm_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user settings:', error)
        return null
      }

      return data as CRMSettings || null
    } catch (error) {
      console.error('Exception fetching user settings:', error)
      return null
    }
  }

  static async updateUserSettings(userId: string, settings: CRMSettings['settings']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('crm_settings')
        .upsert({
          user_id: userId,
          settings,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error updating user settings:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Exception updating user settings:', error)
      return false
    }
  }

  // Real-time subscriptions
  static subscribeToCallLogs(callback: (payload: any) => void) {
    return supabase
      .channel('crm_call_logs')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'crm_call_logs' },
        callback
      )
      .subscribe()
  }
}