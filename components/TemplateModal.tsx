'use client'

import React, { useState, useEffect } from 'react';
import { EmailTemplate } from '../lib/email-system';
import { SupabaseEmailManager } from '../lib/supabase-email';

interface TemplateModalProps {
  template?: EmailTemplate | null;
  onSave: (templateData: any) => void;
  onClose: () => void;
}

export default function TemplateModal({ template, onSave, onClose }: TemplateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'custom' as any,
    leadStage: '',
    industry: '',
    isActive: true,
    variables: [] as string[]
  });

  const [availableVariables] = useState(SupabaseEmailManager.getAvailableVariables());

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        subject: template.subject,
        content: template.content,
        type: template.type,
        leadStage: template.leadStage || '',
        industry: template.industry || '',
        isActive: template.isActive,
        variables: template.variables
      });
    } else {
      setFormData({
        name: '',
        subject: '',
        content: '',
        type: 'custom',
        leadStage: '',
        industry: '',
        isActive: true,
        variables: []
      });
    }
  }, [template]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleVariableToggle = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.includes(variable)
        ? prev.variables.filter(v => v !== variable)
        : [...prev.variables, variable]
    }));
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + `{{${variable}}}` + after;

      setFormData(prev => ({
        ...prev,
        content: newText
      }));

      // Add variable to list if not already included
      if (!formData.variables.includes(variable)) {
        handleVariableToggle(variable);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const templateData = {
      ...formData,
      createdBy: 'user' // This should come from auth context in a real app
    };

    onSave(templateData);
  };

  const templateTypes = [
    { value: 'welcome', label: 'Welcome' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'nurture', label: 'Nurture' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'closing', label: 'Closing' },
    { value: 'win', label: 'Win' },
    { value: 'lost', label: 'Lost' },
    { value: 'custom', label: 'Custom' }
  ];

  const leadStages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>
            {template ? 'Edit Template' : 'Create New Template'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                  placeholder="Enter template name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Line *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                  placeholder="Enter email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Content *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows={12}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm font-mono"
                  placeholder="Enter email content..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                  >
                    {templateTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Stage (Optional)
                  </label>
                  <select
                    name="leadStage"
                    value={formData.leadStage}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                  >
                    <option value="">Any Stage</option>
                    {leadStages.map(stage => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry (Optional)
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                    placeholder="e.g., Healthcare"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#3dbff2] focus:ring-[#3dbff2] border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Active (available for use in campaigns)
                </label>
              </div>
            </div>

            {/* Right Column - Variables */}
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Available Variables</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3 bg-gray-50">
                  {availableVariables.map(variable => (
                    <div key={variable} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.variables.includes(variable)}
                          onChange={() => handleVariableToggle(variable)}
                          className="h-3 w-3 text-[#3dbff2] focus:ring-[#3dbff2] border-gray-300 rounded"
                        />
                        <span className="ml-2 text-xs text-gray-600">{variable}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => insertVariable(variable)}
                        className="text-xs text-[#3dbff2] hover:underline"
                      >
                        Insert
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Preview Variables</h4>
                <div className="border rounded-md p-3 bg-gray-50 max-h-40 overflow-y-auto">
                  {formData.variables.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {formData.variables.map(variable => (
                        <span key={variable} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {'{{'}{variable}{'}}'}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No variables selected</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90"
              style={{backgroundColor: '#3dbff2'}}
            >
              {template ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}