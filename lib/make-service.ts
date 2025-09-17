export interface MakeScenario {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'error';
  folder?: {
    id: string;
    name: string;
  };
  scheduling?: {
    type: 'indefinitely' | 'once' | 'every';
    interval?: number;
    intervalType?: 'minutes' | 'hours' | 'days';
  };
  lastRun?: string;
  nextRun?: string;
  stats: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    incompleteRuns: number;
    averageExecutionTime?: number;
  };
  createdAt: string;
  updatedAt: string;
  blueprint?: {
    modules: MakeModule[];
  };
}

export interface MakeModule {
  id: string;
  module: string;
  version: number;
  parameters?: Record<string, any>;
  mapper?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface MakeExecution {
  id: string;
  scenarioId: string;
  status: 'success' | 'error' | 'incomplete' | 'running';
  startedAt: string;
  finishedAt?: string;
  executionTime?: number;
  operations: number;
  dataTransferred: number;
  errorMessage?: string;
  warning?: string;
}

export interface MakeWebhook {
  id: string;
  name: string;
  url: string;
  scenarioId: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastTriggered?: string;
  totalTriggers: number;
}

export interface MakeOrganization {
  id: string;
  name: string;
  plan: string;
  limits: {
    operations: number;
    dataTransfer: number;
    scenarios: number;
  };
  usage: {
    operations: number;
    dataTransfer: number;
    scenarios: number;
  };
}

export interface MakeApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code: string;
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

export class MakeService {
  private static baseUrl = '/api/make';
  private static isInitialized = false;

  static initialize(apiToken: string, organizationId: string) {
    this.isInitialized = true;
  }

  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<MakeApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: {
            message: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
            code: response.status.toString(),
          },
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 'NETWORK_ERROR',
        },
      };
    }
  }

  static async getScenarios(page = 1, limit = 50): Promise<MakeApiResponse<MakeScenario[]>> {
    return this.makeRequest<MakeScenario[]>(
      `/scenarios?page=${page}&limit=${limit}`
    );
  }

  static async getScenario(scenarioId: string): Promise<MakeApiResponse<MakeScenario>> {
    return this.makeRequest<MakeScenario>(
      `/organizations/${this.organizationId}/scenarios/${scenarioId}`
    );
  }

  static async getScenarioExecutions(
    scenarioId: string,
    page = 1,
    limit = 50
  ): Promise<MakeApiResponse<MakeExecution[]>> {
    return this.makeRequest<MakeExecution[]>(
      `/organizations/${this.organizationId}/scenarios/${scenarioId}/executions?page=${page}&limit=${limit}`
    );
  }

  static async getOrganizationExecutions(
    page = 1,
    limit = 50,
    status?: 'success' | 'error' | 'incomplete'
  ): Promise<MakeApiResponse<MakeExecution[]>> {
    const statusQuery = status ? `&status=${status}` : '';
    return this.makeRequest<MakeExecution[]>(
      `/executions?page=${page}&limit=${limit}${statusQuery}`
    );
  }

  static async getWebhooks(): Promise<MakeApiResponse<MakeWebhook[]>> {
    return this.makeRequest<MakeWebhook[]>(
      `/organizations/${this.organizationId}/webhooks`
    );
  }

  static async getOrganization(): Promise<MakeApiResponse<MakeOrganization>> {
    return this.makeRequest<MakeOrganization>(
      `/organization`
    );
  }

  static async activateScenario(scenarioId: string): Promise<MakeApiResponse<void>> {
    return this.makeRequest<void>(
      `/organizations/${this.organizationId}/scenarios/${scenarioId}/activate`,
      { method: 'POST' }
    );
  }

  static async deactivateScenario(scenarioId: string): Promise<MakeApiResponse<void>> {
    return this.makeRequest<void>(
      `/organizations/${this.organizationId}/scenarios/${scenarioId}/deactivate`,
      { method: 'POST' }
    );
  }

  static async runScenario(scenarioId: string): Promise<MakeApiResponse<{ executionId: string }>> {
    return this.makeRequest<{ executionId: string }>(
      `/organizations/${this.organizationId}/scenarios/${scenarioId}/run`,
      { method: 'POST' }
    );
  }

  static async duplicateScenario(
    scenarioId: string,
    name: string
  ): Promise<MakeApiResponse<MakeScenario>> {
    return this.makeRequest<MakeScenario>(
      `/organizations/${this.organizationId}/scenarios/${scenarioId}/clone`,
      {
        method: 'POST',
        body: JSON.stringify({ name }),
      }
    );
  }

  // Helper methods for CRM integration
  static async getAllScenariosWithStats(): Promise<{
    scenarios: MakeScenario[];
    totalStats: {
      totalScenarios: number;
      activeScenarios: number;
      totalRuns: number;
      successfulRuns: number;
      failedRuns: number;
      averageSuccessRate: number;
    };
    error?: string;
  }> {
    const response = await this.getScenarios(1, 100);

    if (response.error) {
      return {
        scenarios: [],
        totalStats: {
          totalScenarios: 0,
          activeScenarios: 0,
          totalRuns: 0,
          successfulRuns: 0,
          failedRuns: 0,
          averageSuccessRate: 0,
        },
        error: response.error.message,
      };
    }

    const scenarios = response.data || [];

    const totalStats = scenarios.reduce(
      (acc, scenario) => ({
        totalScenarios: acc.totalScenarios + 1,
        activeScenarios: acc.activeScenarios + (scenario.status === 'active' ? 1 : 0),
        totalRuns: acc.totalRuns + scenario.stats.totalRuns,
        successfulRuns: acc.successfulRuns + scenario.stats.successfulRuns,
        failedRuns: acc.failedRuns + scenario.stats.failedRuns,
        averageSuccessRate: 0, // Will calculate after
      }),
      {
        totalScenarios: 0,
        activeScenarios: 0,
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        averageSuccessRate: 0,
      }
    );

    totalStats.averageSuccessRate = totalStats.totalRuns > 0
      ? (totalStats.successfulRuns / totalStats.totalRuns) * 100
      : 100;

    return { scenarios, totalStats };
  }

  static async getRecentExecutions(limit = 10): Promise<{
    executions: MakeExecution[];
    error?: string;
  }> {
    const response = await this.getOrganizationExecutions(1, limit);

    if (response.error) {
      return {
        executions: [],
        error: response.error.message,
      };
    }

    return {
      executions: response.data || [],
    };
  }

  static async getUsageStats(): Promise<{
    organization?: MakeOrganization;
    usagePercentage: {
      operations: number;
      dataTransfer: number;
      scenarios: number;
    };
    error?: string;
  }> {
    const response = await this.getOrganization();

    if (response.error) {
      return {
        usagePercentage: { operations: 0, dataTransfer: 0, scenarios: 0 },
        error: response.error.message,
      };
    }

    const org = response.data!;
    const usagePercentage = {
      operations: org.limits.operations > 0 ? (org.usage.operations / org.limits.operations) * 100 : 0,
      dataTransfer: org.limits.dataTransfer > 0 ? (org.usage.dataTransfer / org.limits.dataTransfer) * 100 : 0,
      scenarios: org.limits.scenarios > 0 ? (org.usage.scenarios / org.limits.scenarios) * 100 : 0,
    };

    return {
      organization: org,
      usagePercentage,
    };
  }

  // Utility functions
  static formatExecutionTime(seconds?: number): string {
    if (!seconds) return 'N/A';

    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }

  static formatDataTransfer(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  static getStatusColor(status: string): string {
    switch (status) {
      case 'active': case 'success': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'inactive': case 'incomplete': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  static isConfigured(): boolean {
    return this.isInitialized;
  }
}