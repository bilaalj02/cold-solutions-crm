export interface CalendlyEvent {
  uri: string;
  name: string;
  start_time: string;
  end_time: string;
  event_type: string;
  status: string;
  invitee_name?: string;
  invitee_email?: string;
  location?: string;
}

export interface CalendlyStats {
  total_events: number;
  upcoming_events: number;
  completed_events: number;
  cancelled_events: number;
}

export class CalendlyService {
  private apiToken: string;
  private baseUrl = 'https://api.calendly.com';

  constructor() {
    this.apiToken = process.env.CALENDLY_API_TOKEN || '';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Calendly API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getScheduledEvents(count = 100): Promise<CalendlyEvent[]> {
    try {
      const orgUri = process.env.CALENDLY_ORG_URI;
      if (!orgUri) {
        throw new Error('Calendly organization URI not configured');
      }

      const response = await this.makeRequest(
        `/scheduled_events?organization=${encodeURIComponent(orgUri)}&count=${count}&sort=start_time:desc`
      );

      const events: CalendlyEvent[] = [];
      
      for (const event of response.collection) {
        // Get invitee information
        const inviteesResponse = await this.makeRequest(`/scheduled_events/${event.uri.split('/').pop()}/invitees`);
        const invitee = inviteesResponse.collection[0];

        events.push({
          uri: event.uri,
          name: event.name,
          start_time: event.start_time,
          end_time: event.end_time,
          event_type: event.event_type,
          status: event.status,
          invitee_name: invitee?.name || '',
          invitee_email: invitee?.email || '',
          location: event.location?.location || 'Online',
        });
      }

      return events;
    } catch (error) {
      console.error('Error fetching Calendly events:', error);
      return [];
    }
  }

  async getEventStats(): Promise<CalendlyStats> {
    try {
      const events = await this.getScheduledEvents();
      const now = new Date();

      const upcoming = events.filter(event => 
        new Date(event.start_time) > now && event.status === 'active'
      ).length;

      const completed = events.filter(event => 
        new Date(event.end_time) < now && event.status === 'active'
      ).length;

      const cancelled = events.filter(event => 
        event.status === 'canceled'
      ).length;

      return {
        total_events: events.length,
        upcoming_events: upcoming,
        completed_events: completed,
        cancelled_events: cancelled,
      };
    } catch (error) {
      console.error('Error fetching Calendly stats:', error);
      return {
        total_events: 0,
        upcoming_events: 0,
        completed_events: 0,
        cancelled_events: 0,
      };
    }
  }

  async getUpcomingEvents(limit = 10): Promise<CalendlyEvent[]> {
    const events = await this.getScheduledEvents();
    const now = new Date();

    return events
      .filter(event => new Date(event.start_time) > now && event.status === 'active')
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, limit);
  }

  async getRecentEvents(limit = 10): Promise<CalendlyEvent[]> {
    const events = await this.getScheduledEvents();
    const now = new Date();

    return events
      .filter(event => new Date(event.end_time) < now)
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
      .slice(0, limit);
  }
}

export const calendlyService = new CalendlyService();