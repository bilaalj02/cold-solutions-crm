import { useState, useEffect } from 'react';
import { LeadData, DatabaseStats } from '@/lib/notion-service';

export function useLeads(database?: string) {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const url = database ? `/api/leads?database=${database}` : '/api/leads';
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch leads');
        }
        
        const data = await response.json();
        setLeads(data.leads);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching leads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [database]);

  return { leads, loading, error, refetch: () => setLoading(true) };
}

export function useStats(database?: string) {
  const [stats, setStats] = useState<DatabaseStats | Record<string, DatabaseStats> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const url = database ? `/api/stats?database=${database}` : '/api/stats';
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const data = await response.json();
        setStats(data.stats);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [database]);

  return { stats, loading, error, refetch: () => setLoading(true) };
}