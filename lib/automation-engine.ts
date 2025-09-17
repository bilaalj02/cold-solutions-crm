import { Lead } from './leads';

export type TriggerType = 
  | 'lead_created'
  | 'lead_updated' 
  | 'score_changed'
  | 'status_changed'
  | 'tag_added'
  | 'tag_removed'
  | 'time_based'
  | 'inactivity'
  | 'email_opened'
  | 'email_clicked'
  | 'form_submitted'
  | 'webhook_received';

export type ActionType = 
  | 'update_lead_score'
  | 'change_lead_status'
  | 'add_tag'
  | 'remove_tag'
  | 'assign_territory'
  | 'assign_user'
  | 'create_task'
  | 'send_email'
  | 'send_notification'
  | 'webhook_call'
  | 'update_field'
  | 'move_to_sequence';

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists' | 'in' | 'not_in';
  value: any;
}

export interface AutomationTrigger {
  type: TriggerType;
  conditions?: TriggerCondition[];
  delay?: {
    value: number;
    unit: 'minutes' | 'hours' | 'days' | 'weeks';
  };
  schedule?: {
    time: string; // HH:MM format
    days?: number[]; // 0=Sunday, 1=Monday, etc.
    timezone: string;
  };
}

export interface AutomationAction {
  type: ActionType;
  parameters: Record<string, any>;
  delay?: {
    value: number;
    unit: 'minutes' | 'hours' | 'days' | 'weeks';
  };
  conditions?: TriggerCondition[]; // Optional conditions for the action
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  stats: {
    triggered: number;
    executed: number;
    failed: number;
    lastRun?: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AutomationLog {
  id: string;
  workflowId: string;
  leadId?: string;
  triggerType: TriggerType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  executedActions: {
    actionType: ActionType;
    status: 'completed' | 'failed';
    result?: any;
    error?: string;
    executedAt: string;
  }[];
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  leadId?: string;
  assignedTo: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  type: 'Call' | 'Email' | 'Meeting' | 'Follow-up' | 'Research' | 'Proposal' | 'Other';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  completedAt?: string;
  automationGenerated: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'Low' | 'Medium' | 'High';
  isRead: boolean;
  leadId?: string;
  taskId?: string;
  workflowId?: string;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
}

export interface LeadRoutingRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  priority: number; // Lower number = higher priority
  conditions: TriggerCondition[];
  assignment: {
    type: 'user' | 'territory' | 'round_robin' | 'load_balanced';
    value?: string; // user ID or territory name
    users?: string[]; // for round robin or load balancing
  };
  createdAt: string;
  updatedAt: string;
  stats: {
    matched: number;
    assigned: number;
  };
}

export class AutomationEngine {
  private static workflows: AutomationWorkflow[] = [];

  private static routingRules: LeadRoutingRule[] = [];

  private static tasks: Task[] = [];
  private static notifications: Notification[] = [];
  private static logs: AutomationLog[] = [];

  static getWorkflows(): AutomationWorkflow[] {
    return this.workflows;
  }

  static getWorkflowById(id: string): AutomationWorkflow | undefined {
    return this.workflows.find(w => w.id === id);
  }

  static getRoutingRules(): LeadRoutingRule[] {
    return this.routingRules.sort((a, b) => a.priority - b.priority);
  }

  static getTasks(): Task[] {
    return this.tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static getNotifications(userId: string): Notification[] {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static getAutomationLogs(): AutomationLog[] {
    return this.logs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  static createWorkflow(workflow: Omit<AutomationWorkflow, 'id' | 'createdAt' | 'updatedAt' | 'stats'>): AutomationWorkflow {
    const newWorkflow: AutomationWorkflow = {
      ...workflow,
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { triggered: 0, executed: 0, failed: 0 }
    };
    this.workflows.push(newWorkflow);
    return newWorkflow;
  }

  static updateWorkflow(id: string, updates: Partial<AutomationWorkflow>): AutomationWorkflow | null {
    const index = this.workflows.findIndex(w => w.id === id);
    if (index === -1) return null;
    
    this.workflows[index] = {
      ...this.workflows[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.workflows[index];
  }

  static deleteWorkflow(id: string): boolean {
    const index = this.workflows.findIndex(w => w.id === id);
    if (index === -1) return false;
    
    this.workflows.splice(index, 1);
    return true;
  }

  static createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.tasks.push(newTask);
    return newTask;
  }

  static updateTask(id: string, updates: Partial<Task>): Task | null {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    this.tasks[index] = {
      ...this.tasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      ...(updates.status === 'Completed' && !this.tasks[index].completedAt ? { completedAt: new Date().toISOString() } : {})
    };
    return this.tasks[index];
  }

  static createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    this.notifications.push(newNotification);
    return newNotification;
  }

  static markNotificationAsRead(id: string): Notification | null {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index === -1) return null;
    
    this.notifications[index] = {
      ...this.notifications[index],
      isRead: true,
      readAt: new Date().toISOString()
    };
    return this.notifications[index];
  }

  // Simulation of automation execution
  static async executeWorkflow(workflowId: string, lead: Lead): Promise<AutomationLog> {
    const workflow = this.getWorkflowById(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const log: AutomationLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      leadId: lead.id,
      triggerType: workflow.trigger.type,
      status: 'running',
      executedActions: [],
      startedAt: new Date().toISOString()
    };

    try {
      // Execute each action
      for (const action of workflow.actions) {
        const actionResult = await this.executeAction(action, lead);
        log.executedActions.push({
          actionType: action.type,
          status: actionResult.success ? 'completed' : 'failed',
          result: actionResult.result,
          error: actionResult.error,
          executedAt: new Date().toISOString()
        });
      }

      log.status = 'completed';
      log.completedAt = new Date().toISOString();

      // Update workflow stats
      workflow.stats.executed++;
      workflow.stats.lastRun = new Date().toISOString();

    } catch (error) {
      log.status = 'failed';
      log.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log.completedAt = new Date().toISOString();

      // Update workflow stats
      workflow.stats.failed++;
    }

    this.logs.push(log);
    return log;
  }

  private static async executeAction(action: AutomationAction, lead: Lead): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      switch (action.type) {
        case 'create_task':
          const task = this.createTask({
            title: action.parameters.title,
            description: action.parameters.description,
            leadId: lead.id,
            assignedTo: lead.assignedTo || 'unassigned',
            priority: action.parameters.priority || 'Medium',
            status: 'Open',
            type: action.parameters.type || 'Other',
            dueDate: action.parameters.dueHours 
              ? new Date(Date.now() + action.parameters.dueHours * 60 * 60 * 1000).toISOString()
              : undefined,
            createdBy: 'automation',
            automationGenerated: true
          });
          return { success: true, result: task };

        case 'send_notification':
          const notification = this.createNotification({
            userId: lead.assignedTo || 'admin',
            title: action.parameters.title.replace('{{leadName}}', lead.name).replace('{{score}}', lead.score.toString()),
            message: action.parameters.message.replace('{{leadName}}', lead.name).replace('{{score}}', lead.score.toString()),
            type: action.parameters.type || 'info',
            priority: action.parameters.priority || 'Medium',
            leadId: lead.id
          });
          return { success: true, result: notification };

        case 'update_lead_score':
          // In a real implementation, this would update the lead's score
          return { success: true, result: { scoreUpdated: true } };

        case 'add_tag':
          // In a real implementation, this would add tags to the lead
          return { success: true, result: { tagsAdded: action.parameters.tags } };

        default:
          return { success: false, error: `Unknown action type: ${action.type}` };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static evaluateRoutingRules(lead: Lead): string | null {
    const rules = this.getRoutingRules().filter(rule => rule.isActive);
    
    for (const rule of rules) {
      if (this.evaluateConditions(rule.conditions, lead)) {
        rule.stats.matched++;
        rule.stats.assigned++;
        
        switch (rule.assignment.type) {
          case 'user':
            return rule.assignment.value || null;
          case 'territory':
            // In a real implementation, this would assign based on territory
            return rule.assignment.value || null;
          case 'round_robin':
            // Simple round-robin simulation
            const users = rule.assignment.users || [];
            if (users.length > 0) {
              return users[rule.stats.assigned % users.length];
            }
            break;
        }
      }
    }
    
    return null;
  }

  private static evaluateConditions(conditions: TriggerCondition[], lead: Lead): boolean {
    return conditions.every(condition => {
      const fieldValue = (lead as any)[condition.field];
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'not_equals':
          return fieldValue !== condition.value;
        case 'contains':
          return typeof fieldValue === 'string' && fieldValue.includes(condition.value);
        case 'greater_than':
          return typeof fieldValue === 'number' && fieldValue > condition.value;
        case 'less_than':
          return typeof fieldValue === 'number' && fieldValue < condition.value;
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(fieldValue);
        case 'exists':
          return fieldValue !== undefined && fieldValue !== null;
        case 'not_exists':
          return fieldValue === undefined || fieldValue === null;
        default:
          return false;
      }
    });
  }

  // Helper methods for getting statistics
  static getAutomationStats() {
    return {
      totalWorkflows: this.workflows.length,
      activeWorkflows: this.workflows.filter(w => w.isActive).length,
      totalTasks: this.tasks.length,
      completedTasks: this.tasks.filter(t => t.status === 'Completed').length,
      totalNotifications: this.notifications.length,
      unreadNotifications: this.notifications.filter(n => !n.isRead).length,
      totalExecutions: this.workflows.reduce((acc, w) => acc + w.stats.executed, 0),
      totalFailures: this.workflows.reduce((acc, w) => acc + w.stats.failed, 0)
    };
  }
}