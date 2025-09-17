import { Lead } from './leads';
import { EmailTemplate } from './email-system';

export interface RevenueData {
  period: string;
  actual: number;
  forecast: number;
  target: number;
  previousPeriod?: number;
}

export interface ConversionFunnelStep {
  stage: string;
  count: number;
  percentage: number;
  dropOffRate?: number;
  avgTimeInStage?: number; // in days
}

export interface TerritoryPerformance {
  territory: string;
  totalLeads: number;
  qualifiedLeads: number;
  closedDeals: number;
  revenue: number;
  conversionRate: number;
  avgDealSize: number;
  topPerformers: string[];
}

export interface ChannelPerformance {
  channel: string;
  leads: number;
  cost: number;
  revenue: number;
  costPerLead: number;
  roi: number;
  conversionRate: number;
}

export interface ForecastData {
  period: string;
  conservative: number;
  likely: number;
  optimistic: number;
  confidence: number; // percentage
  factors: string[];
}

export interface KPIMetric {
  name: string;
  value: number;
  previousValue?: number;
  target?: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercentage?: number;
  status: 'good' | 'warning' | 'critical';
}

export interface AutomationMetric {
  name: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  avgExecutionTime: number; // in seconds
  successRate: number; // percentage
  lastExecuted: string;
  status: 'active' | 'inactive' | 'error';
}

export interface MakeAutomationStats {
  totalScenarios: number;
  activeScenarios: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  avgExecutionTime: number;
  dataTransferred: number; // in MB
  operationsUsed: number;
  operationsRemaining: number;
  monthlyUsage: {
    period: string;
    executions: number;
    operations: number;
    dataTransferred: number;
  }[];
}

export class AdvancedAnalytics {
  // Mock data - in production this would come from your database
  private static revenueData: RevenueData[] = [
    { period: '2024-01', actual: 125000, forecast: 120000, target: 110000, previousPeriod: 115000 },
    { period: '2024-02', actual: 140000, forecast: 135000, target: 125000, previousPeriod: 125000 },
    { period: '2024-03', actual: 158000, forecast: 155000, target: 140000, previousPeriod: 140000 },
    { period: '2024-04', actual: 172000, forecast: 170000, target: 155000, previousPeriod: 158000 },
    { period: '2024-05', actual: 165000, forecast: 180000, target: 170000, previousPeriod: 172000 },
    { period: '2024-06', actual: 0, forecast: 195000, target: 185000, previousPeriod: 165000 },
  ];

  private static territoryData: TerritoryPerformance[] = [
    {
      territory: 'East Coast',
      totalLeads: 450,
      qualifiedLeads: 180,
      closedDeals: 45,
      revenue: 675000,
      conversionRate: 25.0,
      avgDealSize: 15000,
      topPerformers: ['John Smith', 'Sarah Johnson']
    },
    {
      territory: 'West Coast',
      totalLeads: 380,
      qualifiedLeads: 165,
      closedDeals: 52,
      revenue: 780000,
      conversionRate: 31.5,
      avgDealSize: 15000,
      topPerformers: ['Mike Davis', 'Lisa Chen']
    },
    {
      territory: 'Midwest',
      totalLeads: 320,
      qualifiedLeads: 128,
      closedDeals: 32,
      revenue: 480000,
      conversionRate: 25.0,
      avgDealSize: 15000,
      topPerformers: ['David Wilson']
    },
    {
      territory: 'Southeast',
      totalLeads: 290,
      qualifiedLeads: 145,
      closedDeals: 38,
      revenue: 570000,
      conversionRate: 26.2,
      avgDealSize: 15000,
      topPerformers: ['Emily Rodriguez', 'Tom Anderson']
    }
  ];

  private static channelData: ChannelPerformance[] = [
    {
      channel: 'Website',
      leads: 420,
      cost: 15000,
      revenue: 630000,
      costPerLead: 35.71,
      roi: 4100,
      conversionRate: 12.5
    },
    {
      channel: 'Email Campaign',
      leads: 380,
      cost: 8000,
      revenue: 456000,
      costPerLead: 21.05,
      roi: 5600,
      conversionRate: 10.2
    },
    {
      channel: 'Social Media',
      leads: 250,
      cost: 12000,
      revenue: 300000,
      costPerLead: 48.00,
      roi: 2400,
      conversionRate: 8.8
    },
    {
      channel: 'Cold Calling',
      leads: 180,
      cost: 25000,
      revenue: 540000,
      costPerLead: 138.89,
      roi: 2060,
      conversionRate: 22.2
    },
    {
      channel: 'Referral',
      leads: 120,
      cost: 5000,
      revenue: 480000,
      costPerLead: 41.67,
      roi: 9500,
      conversionRate: 35.0
    },
    {
      channel: 'WhatsApp Bot',
      leads: 95,
      cost: 3000,
      revenue: 142500,
      costPerLead: 31.58,
      roi: 4650,
      conversionRate: 15.8
    }
  ];

  static getRevenueData(): RevenueData[] {
    return this.revenueData;
  }

  static getTerritoryPerformance(): TerritoryPerformance[] {
    return this.territoryData;
  }

  static getChannelPerformance(): ChannelPerformance[] {
    return this.channelData;
  }

  static getConversionFunnel(leads: Lead[]): ConversionFunnelStep[] {
    const stages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won'];
    const stageCounts = stages.map(stage => ({
      stage,
      count: leads.filter(lead => lead.status === stage).length
    }));

    const totalLeads = leads.length;

    return stageCounts.map((stageData, index) => {
      const percentage = totalLeads > 0 ? (stageData.count / totalLeads) * 100 : 0;
      const dropOffRate = index > 0
        ? ((stageCounts[index - 1].count - stageData.count) / stageCounts[index - 1].count) * 100
        : 0;

      return {
        stage: stageData.stage,
        count: stageData.count,
        percentage: Math.round(percentage * 10) / 10,
        dropOffRate: Math.round(dropOffRate * 10) / 10,
        avgTimeInStage: this.getAvgTimeInStage(stageData.stage)
      };
    });
  }

  private static getAvgTimeInStage(stage: string): number {
    // Mock data - in production calculate from lead history
    const avgTimes: Record<string, number> = {
      'New': 2.5,
      'Contacted': 5.2,
      'Qualified': 8.7,
      'Proposal': 12.3,
      'Negotiation': 18.5,
      'Won': 0
    };
    return avgTimes[stage] || 7.0;
  }

  static getRevenueForecast(): ForecastData[] {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const forecasts: ForecastData[] = [];

    for (let i = 0; i < 6; i++) {
      const month = currentMonth + i;
      const year = month > 11 ? currentYear + 1 : currentYear;
      const adjustedMonth = month > 11 ? month - 12 : month;

      const period = `${year}-${String(adjustedMonth + 1).padStart(2, '0')}`;
      const baseAmount = 150000 + (i * 15000) + (Math.random() * 20000);

      forecasts.push({
        period,
        conservative: Math.round(baseAmount * 0.8),
        likely: Math.round(baseAmount),
        optimistic: Math.round(baseAmount * 1.2),
        confidence: 85 - (i * 5),
        factors: [
          'Seasonal trends',
          'Pipeline health',
          'Market conditions',
          'Team capacity'
        ]
      });
    }

    return forecasts;
  }

  static getKPIMetrics(leads: Lead[]): KPIMetric[] {
    const currentMonth = leads.filter(lead => {
      const createdDate = new Date(lead.createdAt);
      const now = new Date();
      return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
    });

    const lastMonth = leads.filter(lead => {
      const createdDate = new Date(lead.createdAt);
      const now = new Date();
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
      return createdDate.getMonth() === lastMonthDate.getMonth() && createdDate.getFullYear() === lastMonthDate.getFullYear();
    });

    const qualifiedThisMonth = currentMonth.filter(lead => lead.status === 'Qualified' || lead.status === 'Proposal' || lead.status === 'Negotiation' || lead.status === 'Won').length;
    const qualifiedLastMonth = lastMonth.filter(lead => lead.status === 'Qualified' || lead.status === 'Proposal' || lead.status === 'Negotiation' || lead.status === 'Won').length;

    const wonThisMonth = currentMonth.filter(lead => lead.status === 'Won').length;
    const wonLastMonth = lastMonth.filter(lead => lead.status === 'Won').length;

    const calculateTrend = (current: number, previous: number): 'up' | 'down' | 'stable' => {
      if (current > previous) return 'up';
      if (current < previous) return 'down';
      return 'stable';
    };

    const calculateChangePercentage = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const getStatus = (current: number, target: number): 'good' | 'warning' | 'critical' => {
      const percentage = target > 0 ? (current / target) * 100 : 100;
      if (percentage >= 90) return 'good';
      if (percentage >= 70) return 'warning';
      return 'critical';
    };

    return [
      {
        name: 'Monthly Lead Generation',
        value: currentMonth.length,
        previousValue: lastMonth.length,
        target: 200,
        unit: 'leads',
        trend: calculateTrend(currentMonth.length, lastMonth.length),
        changePercentage: calculateChangePercentage(currentMonth.length, lastMonth.length),
        status: getStatus(currentMonth.length, 200)
      },
      {
        name: 'Lead Conversion Rate',
        value: currentMonth.length > 0 ? Math.round((qualifiedThisMonth / currentMonth.length) * 100) : 0,
        previousValue: lastMonth.length > 0 ? Math.round((qualifiedLastMonth / lastMonth.length) * 100) : 0,
        target: 25,
        unit: '%',
        trend: calculateTrend(qualifiedThisMonth, qualifiedLastMonth),
        changePercentage: calculateChangePercentage(qualifiedThisMonth, qualifiedLastMonth),
        status: getStatus(qualifiedThisMonth, Math.round(currentMonth.length * 0.25))
      },
      {
        name: 'Monthly Revenue',
        value: wonThisMonth * 15000, // Assuming average deal size of $15k
        previousValue: wonLastMonth * 15000,
        target: 180000,
        unit: '$',
        trend: calculateTrend(wonThisMonth, wonLastMonth),
        changePercentage: calculateChangePercentage(wonThisMonth, wonLastMonth),
        status: getStatus(wonThisMonth * 15000, 180000)
      },
      {
        name: 'Average Deal Size',
        value: 15000,
        previousValue: 14500,
        target: 16000,
        unit: '$',
        trend: 'up',
        changePercentage: 3.4,
        status: 'good'
      },
      {
        name: 'Sales Cycle Length',
        value: 28,
        previousValue: 32,
        target: 25,
        unit: 'days',
        trend: 'down', // down is good for cycle length
        changePercentage: -12.5,
        status: 'warning'
      },
      {
        name: 'Customer Acquisition Cost',
        value: 850,
        previousValue: 920,
        target: 800,
        unit: '$',
        trend: 'down', // down is good for cost
        changePercentage: -7.6,
        status: 'warning'
      }
    ];
  }

  static getLeadScoringDistribution(leads: Lead[]): { range: string; count: number; percentage: number }[] {
    const ranges = [
      { range: '0-20', min: 0, max: 20 },
      { range: '21-40', min: 21, max: 40 },
      { range: '41-60', min: 41, max: 60 },
      { range: '61-80', min: 61, max: 80 },
      { range: '81-100', min: 81, max: 100 }
    ];

    const totalLeads = leads.length;

    return ranges.map(range => {
      const count = leads.filter(lead => lead.score >= range.min && lead.score <= range.max).length;
      const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;

      return {
        range: range.range,
        count,
        percentage: Math.round(percentage * 10) / 10
      };
    });
  }

  static getActivityTrends(period: 'week' | 'month' = 'month'): { date: string; calls: number; emails: number; meetings: number }[] {
    const trends = [];
    const daysToShow = period === 'week' ? 7 : 30;

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      trends.push({
        date: date.toISOString().split('T')[0],
        calls: Math.floor(Math.random() * 50) + 10,
        emails: Math.floor(Math.random() * 100) + 20,
        meetings: Math.floor(Math.random() * 20) + 5
      });
    }

    return trends;
  }

  static getTopPerformingTemplates(templates: EmailTemplate[]): EmailTemplate[] {
    return templates
      .filter(template => template.stats.sent > 0)
      .sort((a, b) => {
        const aRate = (a.stats.opened / a.stats.sent) * 100;
        const bRate = (b.stats.opened / b.stats.sent) * 100;
        return bRate - aRate;
      })
      .slice(0, 5);
  }

  static getLeadSourceROI(): { source: string; leads: number; cost: number; revenue: number; roi: number }[] {
    return this.channelData.map(channel => ({
      source: channel.channel,
      leads: channel.leads,
      cost: channel.cost,
      revenue: channel.revenue,
      roi: channel.roi
    }));
  }

  static getMakeAutomationStats(): MakeAutomationStats {
    return {
      totalScenarios: 12,
      activeScenarios: 10,
      totalExecutions: 2450,
      successfulExecutions: 2341,
      failedExecutions: 109,
      avgExecutionTime: 3.2,
      dataTransferred: 1250.5,
      operationsUsed: 18750,
      operationsRemaining: 31250,
      monthlyUsage: [
        { period: '2024-01', executions: 1850, operations: 14200, dataTransferred: 850.2 },
        { period: '2024-02', executions: 2100, operations: 16300, dataTransferred: 975.8 },
        { period: '2024-03', executions: 2250, operations: 17800, dataTransferred: 1120.4 },
        { period: '2024-04', executions: 2400, operations: 18500, dataTransferred: 1200.7 },
        { period: '2024-05', executions: 2450, operations: 18750, dataTransferred: 1250.5 }
      ]
    };
  }

  static getAutomationMetrics(): AutomationMetric[] {
    return [
      {
        name: 'Lead Qualification Workflow',
        totalExecutions: 1250,
        successfulExecutions: 1198,
        failedExecutions: 52,
        avgExecutionTime: 2.1,
        successRate: 95.8,
        lastExecuted: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        status: 'active'
      },
      {
        name: 'Email Follow-up Sequence',
        totalExecutions: 3400,
        successfulExecutions: 3315,
        failedExecutions: 85,
        avgExecutionTime: 1.8,
        successRate: 97.5,
        lastExecuted: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        status: 'active'
      },
      {
        name: 'Lead Scoring Update',
        totalExecutions: 5600,
        successfulExecutions: 5521,
        failedExecutions: 79,
        avgExecutionTime: 0.9,
        successRate: 98.6,
        lastExecuted: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
        status: 'active'
      },
      {
        name: 'CRM Data Sync',
        totalExecutions: 720,
        successfulExecutions: 695,
        failedExecutions: 25,
        avgExecutionTime: 5.2,
        successRate: 96.5,
        lastExecuted: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        status: 'active'
      },
      {
        name: 'WhatsApp Notification Bot',
        totalExecutions: 890,
        successfulExecutions: 856,
        failedExecutions: 34,
        avgExecutionTime: 1.5,
        successRate: 96.2,
        lastExecuted: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        status: 'active'
      },
      {
        name: 'Calendar Booking Integration',
        totalExecutions: 420,
        successfulExecutions: 398,
        failedExecutions: 22,
        avgExecutionTime: 3.1,
        successRate: 94.8,
        lastExecuted: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        status: 'error'
      }
    ];
  }
}