'use client'

import React, { useState, useEffect } from "react";
import { AutomationEngine, AutomationWorkflow, Task, Notification, LeadRoutingRule, AutomationLog } from "../../lib/automation-engine";
import { MakeIntegration } from "../../components/MakeIntegration";

export default function AutomationPage() {
  const [activeTab, setActiveTab] = useState<'workflows' | 'tasks' | 'notifications' | 'routing' | 'logs' | 'analytics' | 'make'>('workflows');
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [routingRules, setRoutingRules] = useState<LeadRoutingRule[]>([]);
  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>([]);
  const [automationStats, setAutomationStats] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<AutomationWorkflow | null>(null);

  useEffect(() => {
    setWorkflows(AutomationEngine.getWorkflows());
    setTasks(AutomationEngine.getTasks());
    setNotifications(AutomationEngine.getNotifications('current-user'));
    setRoutingRules(AutomationEngine.getRoutingRules());
    setAutomationLogs(AutomationEngine.getAutomationLogs());
    setAutomationStats(AutomationEngine.getAutomationStats());
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'Completed': case 'active': return 'bg-green-100 text-green-800';
      case 'running': case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'failed': case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'pending': case 'Open': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-blue-100 text-blue-800';
      case 'Low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Call': return 'bg-green-100 text-green-800';
      case 'Email': return 'bg-blue-100 text-blue-800';
      case 'Meeting': return 'bg-purple-100 text-purple-800';
      case 'Follow-up': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredWorkflows = workflows.filter(workflow => 
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleWorkflow = (id: string) => {
    const workflow = workflows.find(w => w.id === id);
    if (workflow) {
      const updated = AutomationEngine.updateWorkflow(id, { isActive: !workflow.isActive });
      if (updated) {
        setWorkflows(workflows.map(w => w.id === id ? updated : w));
      }
    }
  };

  const markNotificationAsRead = (id: string) => {
    AutomationEngine.markNotificationAsRead(id);
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
    ));
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    const updated = AutomationEngine.updateTask(taskId, { status });
    if (updated) {
      setTasks(tasks.map(t => t.id === taskId ? updated : t));
    }
  };

  return (
    <div className="flex min-h-screen bg-white" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      {/* Sidebar */}
      <aside className="min-h-screen w-72 flex flex-col justify-between text-white p-4" style={{backgroundColor: '#0a2240'}}>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col p-4">
            <h1 className="text-xl font-bold leading-normal text-white">Cold Solutions</h1>
            <p className="text-sm font-normal leading-normal" style={{color: '#a0a0a0'}}>Automation Hub</p>
          </div>
          <nav className="flex flex-col gap-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>dashboard</span>
              <p className="text-sm font-medium leading-normal">Dashboard</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/leads">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>group</span>
              <p className="text-sm font-medium leading-normal">Leads Database</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/email">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>email</span>
              <p className="text-sm font-medium leading-normal">Email Management</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-white" style={{backgroundColor: '#3dbff2'}} href="/automation">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>smart_toy</span>
              <p className="text-sm font-medium leading-normal">Automation Hub</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/analytics">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>analytics</span>
              <p className="text-sm font-medium leading-normal">Performance Analytics</p>
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen" style={{backgroundColor: '#f9fafb'}}>
        {/* Header */}
        <header className="p-6 bg-white border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{color: '#0a2240'}}>Automation Hub</h1>
              <p className="text-sm text-gray-600 mt-1">Manage workflows, tasks, and intelligent automation</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-lg border p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#0a2240'}}>
                    {automationStats.totalExecutions || 0}
                  </div>
                  <div className="text-xs text-gray-500">Total Executions</div>
                </div>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#3dbff2'}}>
                    {automationStats.activeWorkflows || 0}
                  </div>
                  <div className="text-xs text-gray-500">Active Workflows</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="bg-white border-b">
          <div className="px-6">
            <nav className="flex space-x-8">
              {[
                { key: 'workflows', label: 'Workflows', icon: 'auto_awesome' },
                { key: 'make', label: 'Make.com', icon: 'integration_instructions' },
                { key: 'tasks', label: 'Tasks', icon: 'task' },
                { key: 'notifications', label: 'Notifications', icon: 'notifications' },
                { key: 'routing', label: 'Routing Rules', icon: 'route' },
                { key: 'logs', label: 'Execution Logs', icon: 'history' },
                { key: 'analytics', label: 'Analytics', icon: 'analytics' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-[#3dbff2] text-[#3dbff2]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{tab.icon}</span>
                  {tab.label}
                  {tab.key === 'notifications' && notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="material-symbols-outlined text-gray-400">search</span>
              </div>
              <input 
                className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm" 
                placeholder="Search..." 
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              {activeTab === 'workflows' && (
                <button 
                  className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
                  style={{backgroundColor: '#3dbff2'}}
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  New Workflow
                </button>
              )}
              {activeTab === 'routing' && (
                <button 
                  className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
                  style={{backgroundColor: '#3dbff2'}}
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  New Rule
                </button>
              )}
            </div>
          </div>

          {/* Workflows Tab */}
          {activeTab === 'workflows' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>
                  Automation Workflows ({filteredWorkflows.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Workflow</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Trigger</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredWorkflows.map((workflow) => (
                      <tr key={workflow.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium" style={{color: '#0a2240'}}>{workflow.name}</div>
                            <div className="text-xs text-gray-500">{workflow.description}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              Created: {formatDate(workflow.createdAt)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {workflow.trigger.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {workflow.actions.slice(0, 2).map((action, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                {action.type.replace('_', ' ')}
                              </span>
                            ))}
                            {workflow.actions.length > 2 && (
                              <span className="text-xs text-gray-500">+{workflow.actions.length - 2} more</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div>Executed: <span className="font-medium">{workflow.stats.executed}</span></div>
                            <div>Failed: <span className="font-medium text-red-600">{workflow.stats.failed}</span></div>
                            <div className="text-xs text-gray-500">
                              Success Rate: {workflow.stats.executed > 0 ? ((workflow.stats.executed / (workflow.stats.executed + workflow.stats.failed)) * 100).toFixed(1) : 100}%
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleWorkflow(workflow.id)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              workflow.isActive 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {workflow.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              className="text-[#3dbff2] hover:underline text-xs"
                              onClick={() => setSelectedWorkflow(workflow)}
                            >
                              View
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <span className="material-symbols-outlined text-base">more_horiz</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>
                  Automated Tasks ({filteredTasks.length})
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Filter:</span>
                  <select className="rounded border-gray-300 text-sm">
                    <option>All Tasks</option>
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Task</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium" style={{color: '#0a2240'}}>{task.title}</div>
                            {task.description && (
                              <div className="text-xs text-gray-500">{task.description}</div>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {task.automationGenerated && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                  <span className="material-symbols-outlined text-xs mr-1">smart_toy</span>
                                  Auto-generated
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(task.type)}`}>
                            {task.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{task.assignedTo}</td>
                        <td className="px-6 py-4">
                          {task.dueDate ? (
                            <div className="text-sm">
                              <div>{formatDate(task.dueDate)}</div>
                              <div className={`text-xs ${new Date(task.dueDate) < new Date() ? 'text-red-600' : 'text-gray-500'}`}>
                                {new Date(task.dueDate) < new Date() ? 'Overdue' : 'Upcoming'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">No due date</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['status'])}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-none ${getStatusColor(task.status)}`}
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="text-[#3dbff2] hover:underline text-xs">
                              View
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>
                  Notifications ({notifications.length})
                </h3>
                <button className="text-sm text-[#3dbff2] hover:underline">
                  Mark all as read
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium" style={{color: '#0a2240'}}>{notification.title}</h4>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{formatDate(notification.createdAt)}</span>
                          <span className={`px-2 py-0.5 rounded ${
                            notification.type === 'error' ? 'bg-red-100 text-red-700' :
                            notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                            notification.type === 'success' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {notification.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => markNotificationAsRead(notification.id)}
                            className="text-sm text-[#3dbff2] hover:underline"
                          >
                            Mark as read
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600">
                          <span className="material-symbols-outlined text-base">more_horiz</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Routing Rules Tab */}
          {activeTab === 'routing' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>
                  Lead Routing Rules ({routingRules.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Rule</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Conditions</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {routingRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium" style={{color: '#0a2240'}}>{rule.name}</div>
                            <div className="text-xs text-gray-500">{rule.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded font-mono">
                            #{rule.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs">
                            {rule.conditions.map((condition, index) => (
                              <div key={index} className="mb-1">
                                <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                                  {condition.field} {condition.operator} {condition.value}
                                </code>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium">{rule.assignment.type}</div>
                            {rule.assignment.value && (
                              <div className="text-xs text-gray-500">{rule.assignment.value}</div>
                            )}
                            {rule.assignment.users && (
                              <div className="text-xs text-gray-500">{rule.assignment.users.length} users</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div>Matched: <span className="font-medium">{rule.stats.matched}</span></div>
                            <div>Assigned: <span className="font-medium">{rule.stats.assigned}</span></div>
                            <div className="text-xs text-gray-500">
                              Success Rate: {rule.stats.matched > 0 ? ((rule.stats.assigned / rule.stats.matched) * 100).toFixed(1) : 100}%
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="text-[#3dbff2] hover:underline text-xs">
                              Edit
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <span className="material-symbols-outlined text-base">more_horiz</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Execution Logs Tab */}
          {activeTab === 'logs' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>
                  Automation Execution Logs ({automationLogs.length})
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Filter:</span>
                  <select className="rounded border-gray-300 text-sm">
                    <option>All Executions</option>
                    <option>Completed</option>
                    <option>Failed</option>
                    <option>Running</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Execution</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Workflow</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Trigger</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {automationLogs.slice(0, 50).map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-xs font-mono" style={{color: '#0a2240'}}>{log.id.slice(-8)}</div>
                            <div className="text-xs text-gray-500">{formatDate(log.startedAt)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            {workflows.find(w => w.id === log.workflowId)?.name || log.workflowId}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {log.triggerType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div>Total: {log.executedActions.length}</div>
                            <div className="text-xs text-gray-500">
                              Success: {log.executedActions.filter(a => a.status === 'completed').length} / 
                              Failed: {log.executedActions.filter(a => a.status === 'failed').length}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {log.completedAt ? 
                            `${Math.round((new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime()) / 1000)}s` : 
                            'Running...'
                          }
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-[#3dbff2] hover:underline text-xs">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Make.com Tab */}
          {activeTab === 'make' && (
            <MakeIntegration />
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Total Workflows</p>
                      <p className="text-2xl font-bold" style={{color: '#0a2240'}}>{automationStats.totalWorkflows}</p>
                      <p className="text-xs text-gray-500">{automationStats.activeWorkflows} active</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
                      <span className="material-symbols-outlined text-blue-600">auto_awesome</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Total Executions</p>
                      <p className="text-2xl font-bold" style={{color: '#3dbff2'}}>{automationStats.totalExecutions}</p>
                      <p className="text-xs text-gray-500">{automationStats.totalFailures} failures</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-cyan-100">
                      <span className="material-symbols-outlined text-cyan-600">play_arrow</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Active Tasks</p>
                      <p className="text-2xl font-bold" style={{color: '#10b981'}}>{tasks.filter(t => t.status !== 'Completed').length}</p>
                      <p className="text-xs text-gray-500">{automationStats.completedTasks} completed</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
                      <span className="material-symbols-outlined text-green-600">task</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold" style={{color: '#f59e0b'}}>
                        {automationStats.totalExecutions > 0 
                          ? ((1 - automationStats.totalFailures / automationStats.totalExecutions) * 100).toFixed(1) 
                          : 100}%
                      </p>
                      <p className="text-xs text-gray-500">Overall performance</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-yellow-100">
                      <span className="material-symbols-outlined text-yellow-600">trending_up</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workflow Performance */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>Workflow Performance</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {workflows.filter(w => w.stats.executed > 0).map((workflow) => {
                      const successRate = workflow.stats.executed > 0 
                        ? ((workflow.stats.executed / (workflow.stats.executed + workflow.stats.failed)) * 100) 
                        : 100;
                      
                      return (
                        <div key={workflow.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${workflow.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <div>
                              <div className="font-medium" style={{color: '#0a2240'}}>{workflow.name}</div>
                              <div className="text-sm text-gray-500">{workflow.stats.executed + workflow.stats.failed} total runs</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div>
                              <div className="font-medium">{workflow.stats.executed}</div>
                              <div className="text-gray-500">Successful</div>
                            </div>
                            <div>
                              <div className="font-medium text-red-600">{workflow.stats.failed}</div>
                              <div className="text-gray-500">Failed</div>
                            </div>
                            <div>
                              <div className="font-medium text-green-600">{successRate.toFixed(1)}%</div>
                              <div className="text-gray-500">Success Rate</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Workflow Detail Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>Workflow Details</h3>
              <button 
                onClick={() => setSelectedWorkflow(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2" style={{color: '#0a2240'}}>{selectedWorkflow.name}</h4>
                  <p className="text-gray-600">{selectedWorkflow.description}</p>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Trigger</h5>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="font-medium text-blue-800">
                      {selectedWorkflow.trigger.type.replace('_', ' ').toUpperCase()}
                    </div>
                    {selectedWorkflow.trigger.conditions && selectedWorkflow.trigger.conditions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {selectedWorkflow.trigger.conditions.map((condition, index) => (
                          <div key={index} className="text-sm text-blue-700">
                            {condition.field} {condition.operator} {condition.value}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Actions ({selectedWorkflow.actions.length})</h5>
                  <div className="space-y-3">
                    {selectedWorkflow.actions.map((action, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-[#3dbff2] text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div className="font-medium">
                            {action.type.replace('_', ' ').toUpperCase()}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {JSON.stringify(action.parameters, null, 2)}
                        </div>
                        {action.delay && (
                          <div className="text-xs text-gray-500 mt-2">
                            Delay: {action.delay.value} {action.delay.unit}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Performance Statistics</h5>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedWorkflow.stats.executed}</div>
                      <div className="text-sm text-green-700">Successful Executions</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">{selectedWorkflow.stats.failed}</div>
                      <div className="text-sm text-red-700">Failed Executions</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedWorkflow.stats.executed > 0 
                          ? ((selectedWorkflow.stats.executed / (selectedWorkflow.stats.executed + selectedWorkflow.stats.failed)) * 100).toFixed(1)
                          : 100}%
                      </div>
                      <div className="text-sm text-blue-700">Success Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}